# Agentic Layer

## Risk Levels & Actions

### Low — Auto (no approval needed)
- `generate_story_draft` — calls GPT-4o with brief, saves story+scenes with review_status='unreviewed'
- `tag_scene_confidence` — scores each scene prompt, stores confidence
- `summarize_brief` — extracts brand/tone/goal into structured fields

### Medium — Light Approval (user confirms before execution)
- `submit_video_job` — sends scenes to video API; user clicks "Generate Video" = approval event
- `update_video_status` — Edge Function polls provider and writes status; triggers Realtime notification

### High — Always Approval
- `mark_client_accepted` — logs Review decision; increments acceptance KPI; shown to stakeholders
- `regenerate_story` — overwrites existing story+scenes; user must confirm data loss

### Critical — Human Only
- Deleting a completed VideoJob or accepted Review (irreversible record)
- Any external publish or delivery to client systems

## Named Tools
- `openai_chat_completion` — story/scene generation
- `runway_video_submit` — submit job to Runway ML
- `runway_video_status` — poll job status
- `supabase_storage_upload` — store output video

## Audit Log Fields
`id, user_id, action, object_type, object_id, payload_snapshot, risk_level, outcome, created_at`

## v1 vs Later
- **v1:** generate_story_draft, submit_video_job, update_video_status (polling edge function)
- **Later:** Auto-rewrite weak scenes, suggest retakes based on rejection patterns
