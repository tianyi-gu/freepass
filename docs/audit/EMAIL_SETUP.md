# Production authentication email blocker

Live settings checked 2026-09-17: no custom SMTP host or sender, confirmation required, default email limit 2/hour. Supabase's default SMTP only sends to project-team addresses and is explicitly not for production. Ordinary signup and password-reset delivery therefore remain a release blocker.

Official source: https://supabase.com/docs/guides/auth/auth-smtp .

Required owner input: a sender address on a domain they control and SMTP provider credentials (host, port, username, password/API key, sender name). Store credentials in a protected environment or the Supabase dashboard, never in the mobile app or Git. Configure the provider's SPF/DKIM and DMARC records, then enable custom SMTP and set a suitable send limit. Do not disable confirmation to conceal this failure.

The recovery template already contains `{{ .Token }}` and instructs users to enter it in FreePass. The project currently uses 8-digit codes; the app does not impose a six-digit limit. Signup confirmation redirects to https://www.fountainfund.org after confirmation; users then return to FreePass to sign in. Before launch, verify delivery to an ordinary non-team mailbox, signup confirmation, resend, expired-code rejection, and password reset with the actual final build. A successful admin-created test account login does not validate email delivery.
