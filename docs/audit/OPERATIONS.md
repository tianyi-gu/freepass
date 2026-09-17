# FreePass operations

Updated September 17, 2026. The owner authorized the available operations work and accepted the remaining items as follow-up. No paid plan was purchased.

## Availability and cost controls

`.github/workflows/production-health.yml` runs the public service checks hourly and a synthetic live Casey request daily. A manual run can include the live AI check. The repository URL variable and public-anon-key Actions secret are configured. The job checks Auth/email-confirmation configuration, the directory, visible learning content, Casey's consent guard, the privacy policy, and (daily) actual provider routing to existing directory IDs. It retries transient failures, has request/job time limits and prints only status/timing metadata.

Check [Production health runs](https://github.com/tianyi-gu/freepass/actions/workflows/production-health.yml) and GitHub Actions failure notifications. Scheduled runs can be delayed and delivery of notifications depends on the owner's GitHub preferences; external paging and notification delivery were not configured or tested. This is an availability check, not an uptime SLA.

The live project reports `ACTIVE_HEALTHY`, with a database around 14 MB. A small 12-request read-only burst, concurrency four, passed with a 539 ms p95. This does not establish sustained load or disk-IO headroom. The project remains on Free, with zero managed backups. Previous pause/IO incidents remain a reason to choose appropriate hosting before expanding usage.

Existing Casey limits remain guest 6/minute and 40/day, signed-in 12/minute and 150/day, and 1,000 total actions/day. Gmail authentication email is capped at 20/hour. These bounds are not dollar-denominated provider budgets. OpenAI spending alerts and a production support/moderation rota still need an owner decision.

## Encrypted backup and restore

`scripts/backup-production.mjs` exports `public`, `auth` and `storage` database schemas/data, then downloads actual Storage objects. It uses a temporary Supabase CLI login, verifies the pooler's TLS certificate, and does not reset the database password. The result is gzip-compressed and AES-256-GCM encrypted. Plain temporary files are removed on exit. `scripts/unpack-backup.mjs` authenticates/decrypts the archive and verifies database/file hashes before writing an owner-only output directory. A modified encrypted archive was rejected in the live drill.

Local snapshots live in ignored `.context/backups/`; the matching 32-byte key is `credentials/freepass-backup.key` (mode 0600). Preserve the key separately in owner-controlled secure storage. Without it, the backup is unrecoverable. Do not commit snapshots, decrypted files, the key or admin tokens. The current snapshot and restore results are recorded in `.context/audit/final-encrypted-backup.json` and `.context/audit/backup-restore-check.json`.

To repeat, obtain a project-scoped management token with database access and read access to pooler settings/API-key secrets. Set `SUPABASE_ACCESS_TOKEN` securely in the process environment, then run:

```sh
FREEPASS_BACKUP_KEY_FILE=credentials/freepass-backup.key \
FREEPASS_BACKUP_DIR=.context/backups \
PGSSLROOTCERT=credentials/supabase-root.crt \
PG_DUMP_BIN=/opt/homebrew/opt/libpq/bin/pg_dump \
node scripts/backup-production.mjs
```

Use `pg_dump` version 17 or later; adjust its path on other machines. Download the current root certificate from Supabase's Database Settings page. A temporary CLI credential expires after five minutes; revoke temporary management tokens when finished. Do not replace the existing encryption key when making later snapshots.

For an isolated restore drill, decrypt with:

```sh
node scripts/unpack-backup.mjs SNAPSHOT.fpbackup credentials/freepass-backup.key NEW_PRIVATE_DIRECTORY
```

The drill restored schemas, functions, policies and rows into a separate local PostgreSQL 17 database and compared table counts. Supabase role names and the `uuid-ossp`/`pgcrypto` extensions were bootstrapped locally; original ownership/ACLs were not applied to the test roles. Storage bytes were independently downloaded and hash-verified. This does not test restoring the hosted Auth/Storage services, uploading all files to a replacement project, or preserving every platform setting. Database and file copies occur sequentially, so active writes during a backup require reconciliation. Edge Function code remains in Git; provider and SMTP credentials require separate secure custody.

This is a **local, manually invoked snapshot**, not scheduled off-site disaster recovery. Arrange periodic encrypted off-site copies, retention/deletion, notification delivery and a full replacement-project restore drill. Never point restore commands at production casually. Supabase managed database backups also exclude actual Storage file bytes. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups), [TLS connection documentation](https://supabase.com/docs/guides/database/psql).
