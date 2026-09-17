# Casey OpenAI deployment

Chat uses `gpt-5.6-luna` with the Responses API, strict JSON schema, no reasoning, and `store: false`. The model selects up to three known resource IDs or an authored clarification/boundary/crisis reply. Model prose, model phone numbers, inferred eligibility and current availability are never displayed. The same OpenAI account key supplies `gpt-transcribe` and `gpt-4o-mini-tts` audio APIs.

The native app sends requests to the `casey` Supabase Edge Function. Only Supabase URL and public anon key belong in the app/EAS public environment. `OPENAI_API_KEY` is an Edge Function secret. Do not set it as `EXPO_PUBLIC_*` in new builds. Earlier builds embedded provider credentials; remove obsolete EAS variables and rotate exposed provider keys before public release after checking other uses of those keys.

## Deploy

1. Apply `scripts/production-security-fixes.sql` in a transaction after the existing launch migrations. Inspect current policies first. The function fails closed if its quota RPC is absent.
2. Set the function secret `OPENAI_API_KEY` through Supabase secrets management. Optional `CASEY_MODEL` overrides the evaluated model and therefore requires a fresh evaluation.
3. Deploy `supabase/functions/casey` using `supabase functions deploy casey --project-ref ihlhrorrxcwsxnxqufpb --no-verify-jwt`. The gateway JWT check is intentionally disabled because guest access uses a public project key; the handler verifies real user tokens with Supabase Auth before retrieving any profile.
4. Run `npm run check`, then `npm run evaluate:casey` with a server-side OpenAI key and the real public directory. This evaluation makes paid API calls with synthetic prompts, not customer conversations.
5. Exercise guest and signed-in calls against the deployed function, consent denial, invalid identity, invalid IDs, speech, transcription, quota failure, and directory outage. Build the native app after the function works.

## Bounds and privacy

Consent version 2 is required. The client cancels pending calls on revocation/logout/Casey blur. Message length is 2,000 characters; model context keeps eight previous turns; audio recordings stop at 60 seconds and uploads are bounded. Requests time out instead of spinning indefinitely. There is no provider fallback that removes safety constraints.

Usage counters store a server-keyed HMAC of account ID or guest IP, time bucket, count, and expiration; no conversation or raw IP is stored in that table. Expired counters are removed during subsequent requests. Limits currently count all chat/transcription/speech calls: signed-in 12/minute and 150/day; guest 6/minute and 40/day; project-wide 1,000/day. These are deliberately conservative launch limits, not a capacity claim. Configure provider budget alerts and review actual traffic before raising them. Guest IP identification prefers the Supabase gateway CF-Connecting-IP header. Live checks found that spoofing X-Forwarded-For preserved the same quota bucket, while a forged CF-Connecting-IP was rejected upstream with HTTP 403. Recheck this when changing hosts or gateway configuration. The global cap bounds use even if addresses are rotated, but does not prevent denial of service.

`store:false` disables retrievable Responses storage. It does not promise zero provider retention; OpenAI abuse-monitoring rules and Supabase operational logs still apply. No request/response bodies are intentionally logged by the handler.

## Limits

Schema validation prevents invented IDs and generated factual prose. It cannot guarantee that the model selects the best organization, detects every crisis, or that imported directory records are accurate today. Maintain the directory, rerun adversarial evaluations when changing model/prompt/data, and provide clear retry/no-match/contact options.

Official references: https://developers.openai.com/api/docs/models/gpt-5.6-luna ; https://developers.openai.com/api/docs/guides/structured-outputs ; https://developers.openai.com/api/docs/models/gpt-transcribe ; https://developers.openai.com/api/docs/guides/your-data .
