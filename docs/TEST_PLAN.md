# Test Plan

## End-to-End Success Scenario
1. Open `/` — dashboard loads with seeded VideoJobs and KPI cards (no login)
2. Click "New Brief" → fill brand=FreshBrew, product=Canned Coffee, goal=Launch awareness, tone=Energetic → Save → redirected to `/briefs/[id]`
3. Click "Generate Story" → loading spinner appears → story + 5 scenes saved → redirected to `/stories/[id]`
4. Verify each scene has a confidence badge and review_status='unreviewed'
5. Edit scene 2 visual_prompt → Save → review_status changes to 'edited'
6. Click "Generate Video" → confirmation dialog → confirm → video_job row created with status='queued'
7. Dashboard shows job status='queued' then 'processing' then 'completed' (Realtime update, no refresh)
8. Open `/video-jobs/[id]` → video player loads and plays 30-sec output
9. Click "Accept" → fill feedback → submit → review row saved → acceptance rate KPI increments

## Empty States
- New account with no briefs: `/` shows "No videos yet — create your first Brief" CTA
- Story with no scenes: `/stories/[id]` shows "No scenes generated yet"
- VideoJob queued but not complete: player shows status badge, not broken iframe

## Error Cases
- GPT-4o returns malformed JSON → toast: "Story generation failed — try again"; no partial row saved
- Runway API error → video_job status set to 'failed'; error_message shown on job detail page
- Scene edit saved with empty visual_prompt → DB constraint rejects; inline validation error shown
- Network drop during polling → Edge Function retries; UI shows last known status until reconnect

## Permission Checks (post Sprint 4)
- Reviewer role: "Generate Video" button absent from UI
- Creator role: "Delete Job" button absent
- Admin role: all actions available
