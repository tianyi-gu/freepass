# Final review fixes — September 17, 2026

After the owner authorized App Review submission, CodeRabbit completed its delayed review of PR #5. The following findings were verified against the code and addressed before building the replacement release candidate:

- Corrupt native SecureStore session manifests now recover so a new sign-in or logout can complete. The same chunking implementation is exercised through injected storage adapters; interrupted writes retain the previous session and logout tombstones prevent legacy-session revival.
- Casey updates its consent ref in a layout effect, so asynchronous requests consult committed consent rather than speculative render state.
- HTML, empty and invalid gateway responses produce controlled Casey errors; 429 keeps the usage-limit message.
- CI explicitly limits the repository token to read-only contents and checkout does not persist credentials. The health workflow also disables credential persistence.
- CI now directly type-checks the deployed Edge Function entry point with Deno, in addition to the app TypeScript/lint/tests.
- The historical Adalo migration requires its privileged server key; it cannot silently fall back to an anonymous client.
- The fixed-ID content-correction SQL checks affected row counts and rolls back if expected rows are absent. It was not rerun against production during this follow-up.
- The Maestro error assertion matches the actual Casey failure message.

The backup snapshot-consistency finding remains an explicitly accepted operations limitation: database and file exports are sequential and do not freeze live writes. The existing backup was restored and its files verified, but the manual script must not be treated as coherent live disaster recovery. A quiesced or reconciled off-site backup and replacement-project recovery remain follow-up work in OPERATIONS.md. No claim is made that this finding was fixed.

Validation: TypeScript, ESLint and 38 unit tests passed, including eight new regression tests for session persistence and response handling. Direct Deno checking of supabase/functions/casey/index.ts passed. Release build and Apple submission evidence will be recorded in the local release handoff after completion. The prior physical-device and operations limitations remain unchanged.
