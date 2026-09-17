# FreePass authentication email

Updated September 17, 2026. The dedicated Gmail account **freepassnotifications@gmail.com** is created, SMS two-step verification is enabled, and the **FreePass Supabase SMTP** app password is configured in Supabase. No authenticator app was installed or enrolled. SMTP and IMAP authentication passed with certificate verification enabled. Settings were reloaded from Supabase and confirmed enabled with the correct sender, host and port. All **12 live delivery/authentication assertions passed**; the synthetic account was deleted. Evidence is in `.context/audit/gmail-auth-delivery.json`.

## Configuration and account access

- Sender: **FreePass <freepassnotifications@gmail.com>**.
- Server: `smtp.gmail.com`, port `465`, encrypted TLS.
- SMTP username: the full Gmail address; SMTP password: the separate Google app password.
- Email confirmation remains required. Minimum resend interval: 60 seconds.
- An initial limit of **20 authentication emails/hour** was saved and reloaded to verify persistence.
- The account password and app password are saved in the ignored, permission-restricted `credentials/freepass-email.json` (mode 0600). Keep an owner-controlled copy in a password manager. No email credentials belong in the mobile app or Git.

A personally owned domain is not required for this Gmail setup. If later using a custom sending domain, configure the provider's SPF/DKIM and DMARC records. [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

## Limits and acceptance

Personal Gmail can block sending above 500 emails/day or for delivery/abuse issues. Supabase also warns that Gmail is intended for personal email and transactional delivery may be affected. This is a limited-volume setup, not a delivery or capacity guarantee. Monitor rejected/delayed emails and move to a transactional provider before exceeding its practical limits. Google revokes app passwords when the account password changes; update Supabase if that happens. Google's requirements: [SMTP](https://developers.google.com/workspace/gmail/imap/imap-smtp), [app passwords](https://support.google.com/accounts/answer/185833), [sending limits](https://support.google.com/mail/answer/22839).

The recovery template contains `{{ .Token }}` and instructs users to enter it in FreePass. The project uses eight-digit codes; the app does not impose a six-digit limit. Signup confirmation redirects to https://www.fountainfund.org after confirmation; users then return to FreePass to sign in.

The live acceptance procedure uses a unique alias of the new Gmail mailbox and an ordinary, unconfirmed FreePass signup. It checks initial delivery, resend delivery, confirmation-link redemption, login after confirmation, recovery-code delivery, rejection of an incorrect code, password change, old-password rejection, new-password login and deletion of the synthetic account. It does not prove every recipient domain's deliverability, time-expired-code behavior, or physical-device acceptance. Those remain final acceptance checks.
