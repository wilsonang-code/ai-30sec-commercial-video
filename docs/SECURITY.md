# Security

## Secret Handling
- All API keys (OpenAI, Runway, Supabase service role) stored as Vercel/Supabase environment variables — never in client bundle
- Video generation calls made server-side only (Next.js Server Actions or Edge Functions)
- Output video URLs are signed Supabase Storage URLs with expiry

## Permission Model (v1 → lock-down)
- **v1:** Permissive RLS — demo works without login; all tables readable/writable by anonymous users
- **Lock-down sprint:** Replace with `auth.uid() = user_id` owner policies; add role column to membership; enforce Creator/Reviewer/Admin in middleware
- Roles: **Creator** (create brief, generate story, submit job), **Reviewer** (log review decisions), **Admin** (all + delete)

## Approved Tools Rule
- Only named tools in AGENTIC_LAYER.md may be invoked by server actions
- No `eval`, no `run_any`, no dynamic tool construction
- Agent inherits the session user's role — cannot escalate permissions

## Audit Principle
- Every meaningful mutation (story generated, video submitted, review logged) writes a row to `audit_logs`
- Audit rows are insert-only — no update/delete policies on `audit_logs`
- Human-only actions (delete completed job) require a second confirmation UI step + audit entry
