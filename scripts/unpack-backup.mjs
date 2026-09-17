// Decrypt to an owner-only directory for inspection or an isolated restore drill.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const [file, keyFile, output] = process.argv.slice(2);
if (!file || !keyFile || !output) throw new Error('Usage: node scripts/unpack-backup.mjs SNAPSHOT KEY_FILE NEW_OUTPUT_DIRECTORY');
const bytes = await fs.readFile(file), key = await fs.readFile(keyFile);
if (bytes.subarray(0, 4).toString() !== 'FPB1' || key.length !== 32) throw new Error('Invalid backup or key');
const decipher = crypto.createDecipheriv('aes-256-gcm', key, bytes.subarray(4, 16));
decipher.setAAD(Buffer.from('freepass-backup-v1'));
decipher.setAuthTag(bytes.subarray(16, 32));
const snapshot = JSON.parse(gunzipSync(Buffer.concat([decipher.update(bytes.subarray(32)), decipher.final()])).toString());
key.fill(0);
const database = Buffer.from(snapshot.database, 'base64');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
if (hash(database) !== snapshot.databaseSha256) throw new Error('Database digest mismatch');
for (const object of snapshot.objects) if (hash(Buffer.from(object.data, 'base64')) !== object.sha256) throw new Error('Storage digest mismatch');
// Refuse to overwrite a directory or follow an existing destination symlink.
await fs.mkdir(output, { mode: 0o700 });
await fs.writeFile(path.join(output, 'database.dump'), database, { mode: 0o600, flag: 'wx' });
await fs.writeFile(path.join(output, 'storage.json'), JSON.stringify(snapshot.objects), { mode: 0o600, flag: 'wx' });
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify({ ...snapshot, database: undefined, objects: undefined, storageObjectCount: snapshot.objects.length }, null, 2), { mode: 0o600, flag: 'wx' });
console.log(JSON.stringify({ createdAt: snapshot.createdAt, schemas: snapshot.schemas, storageObjects: snapshot.objects.length, digestsVerified: true }));
