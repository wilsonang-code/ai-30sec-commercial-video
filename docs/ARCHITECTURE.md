# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Backend/DB:** Supabase (Postgres + Storage + Realtime)
- **AI – Story:** OpenAI GPT-4o (structured JSON output)
- **AI – Video:** Runway ML Gen-3 or Kling API (async job)
- **Hosting:** Vercel

## Now vs Later
**Now:** Brief CRUD → Story generation → Scene editing → VideoJob submission & polling → Review logging → Dashboard
**Later:** Auth/RLS lockdown, client portal, voice synthesis, social publishing

## Key User Action — End-to-End Flow
1. User fills Brief form → row saved to `briefs`
2. "Generate Story" clicked → server action calls GPT-4o with brief fields → returns structured scenes JSON → saved to `stories` + `scenes`
3. User edits scenes if needed → saves to DB
4. "Generate Video" clicked → server action calls video API → `video_jobs` row created (status=queued)
5. Supabase Edge Function polls video API every 30s → updates `video_jobs.status` + `output_url`
6. Dashboard Realtime subscription shows live status; user clicks video to play
7. Reviewer clicks Accept/Reject → `reviews` row inserted → dashboard acceptance counter increments

## Layer Plan
1. **Data layer** — all tables, constraints, RLS (permissive v1)
2. **App logic** — CRUD forms, status machine, polling edge function
3. **Smart features** — GPT story generation, confidence scores, AI field review flow

## Core Without AI
Briefs, Stories, Scenes, VideoJobs, and Reviews are all manual-editable. AI generation is a progressive enhancement — the workflow runs if AI is disabled; users write prompts by hand.
