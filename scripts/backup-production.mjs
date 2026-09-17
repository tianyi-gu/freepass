// Creates an encrypted local snapshot; never restores into production.
// Requires pg_dump >= 17, a project-scoped Supabase management token, and an
// owner-controlled 32-byte encryption key file. See docs/audit/OPERATIONS.md.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';

const project = 'ihlhrorrxcwsxnxqufpb';
const token = process.env.SUPABASE_ACCESS_TOKEN;
const keyFile = process.env.FREEPASS_BACKUP_KEY_FILE;
const outputDir = process.env.FREEPASS_BACKUP_DIR;
if (!token || !keyFile || !outputDir) throw new Error('Management token, backup key file, and backup directory are required');
const encryptionKey = await fs.readFile(keyFile);
if (encryptionKey.length !== 32) throw new Error('Backup key must contain exactly 32 random bytes');
const api = async (endpoint, body) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${project}${endpoint}`, {
    method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error(`Backup management request failed (${r.status})`);
  return r.json();
};
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'freepass-backup-'));
await fs.chmod(temp, 0o700);
try {
  const poolers = await api('/config/database/pooler');
  const pooler = poolers.find(p => p.database_type === 'PRIMARY');
  if (!pooler?.db_host) throw new Error('Primary pooler was not found');
  // Supabase issues this CLI credential for five minutes. The database password
  // and existing roles are not reset. pg_dump itself only reads production.
  const login = await api('/cli/login-role', { read_only: false });
  await new Promise((resolve, reject) => {
    const child = spawn(process.env.PG_DUMP_BIN || 'pg_dump', [
      '--host', pooler.db_host, '--port', '5432', '--username', `${login.role}.${project}`,
      '--dbname', 'postgres', '--role=postgres', '--format=custom',
      '--schema=public', '--schema=auth', '--schema=storage', '--lock-wait-timeout=15s',
      `--file=${path.join(temp, 'database.dump')}`,
    ], {
      env: { ...process.env, PGPASSWORD: login.password, PGSSLMODE: 'verify-full', PGSSLROOTCERT: process.env.PGSSLROOTCERT || 'system', PGCONNECT_TIMEOUT: '20' },
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    child.on('error', () => reject(new Error('Cannot start pg_dump')));
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`pg_dump failed (${code}); no complete snapshot was saved`)));
  });
  const keys = await api('/api-keys');
  const service = keys.find(k => k.name === 'service_role')?.api_key;
  if (!service) throw new Error('Storage backup credential unavailable');
  const rows = await api('/database/query', { query: 'select bucket_id,name from storage.objects order by bucket_id,name' });
  const objects = [];
  for (const row of rows) {
    const objectPath = row.name.split('/').map(encodeURIComponent).join('/');
    const r = await fetch(`https://${project}.supabase.co/storage/v1/object/authenticated/${encodeURIComponent(row.bucket_id)}/${objectPath}`, {
      headers: { apikey: service, Authorization: `Bearer ${service}` }, signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) throw new Error(`Storage download failed (${r.status}); no complete snapshot was saved`);
    const bytes = Buffer.from(await r.arrayBuffer());
    objects.push({ ...row, contentType: r.headers.get('content-type'), sha256: crypto.createHash('sha256').update(bytes).digest('hex'), data: bytes.toString('base64') });
  }
  const database = await fs.readFile(path.join(temp, 'database.dump'));
  const snapshot = { format: 1, project, createdAt: new Date().toISOString(), schemas: ['public', 'auth', 'storage'], databaseSha256: crypto.createHash('sha256').update(database).digest('hex'), database: database.toString('base64'), objects };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  cipher.setAAD(Buffer.from('freepass-backup-v1'));
  const encrypted = Buffer.concat([cipher.update(gzipSync(Buffer.from(JSON.stringify(snapshot)))), cipher.final()]);
  await fs.mkdir(outputDir, { recursive: true, mode: 0o700 });
  const file = path.join(outputDir, `${snapshot.createdAt.replace(/[:.]/g, '-')}.fpbackup`);
  await fs.writeFile(file, Buffer.concat([Buffer.from('FPB1'), iv, cipher.getAuthTag(), encrypted]), { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify({ file, createdAt: snapshot.createdAt, databaseBytes: database.length, storageObjects: objects.length }));
} finally {
  await fs.rm(temp, { recursive: true, force: true });
  encryptionKey.fill(0);
}
