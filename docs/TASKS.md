# Tasks & Sprints

## Sprint 1 — DB + Core CRUD (No login wall)
**Goal:** Schema live, seed data visible, Brief and Story forms persist to DB.
- [ ] Run migration SQL (all tables + RLS v1 permissive policies)
- [ ] Seed 3 demo briefs, 2 stories, 8 scenes, 2 video_jobs, 2 reviews
- [ ] Build `/` dashboard page — lists all VideoJobs with status badges (loading/empty/error/ready states)
- [ ] Build `/briefs/new` — Brief creation form; saves to `briefs`
- [ ] Build `/briefs/[id]` — Brief detail; shows linked Story if exists
- [ ] Confirm: seeded rows appear on dashboard without login

**Definition of Done:** Dashboard renders seeded jobs; new Brief form saves and appears in list; no login required.

---

## Sprint 2 — Core Engine: Story Generation ⬅ v1 functional milestone
**Goal:** Brief → AI Story → editable Scenes → VideoJob submission all work end-to-end.
- [ ] Server Action `generate_story_draft`: calls GPT-4o, saves story + scenes with confidence + review_status
- [ ] Build `/stories/[id]` — Scene list with confidence badges; inline edit visual_prompt + voiceover
- [ ] Save scene edits to DB; update review_status to 'edited'
- [ ] "Generate Video" button → calls `runway_video_submit` server action → inserts `video_jobs` row (status=queued)
- [ ] Supabase Edge Function: polls Runway every 30s → updates status + output_url
- [ ] Video playback on `/video-jobs/[id]` — plays output_url when status=completed
- [ ] Audit log entry on story generation + video submission
- [ ] All screens: loading spinner, empty state copy, error toast

**Definition of Done:** Create Brief → generate Story → edit a Scene → submit VideoJob → watch status move to 'completed' → video plays. All persisted to DB.

---

## Sprint 3 — Review & Dashboard KPIs
**Goal:** Reviewers log decisions; dashboard shows acceptance rate.
- [ ] Build Review form on `/video-jobs/[id]` — Accept / Reject + feedback text; saves to `reviews`
- [ ] Dashboard KPI cards: total jobs, completed, acceptance rate, scenes needing review
- [ ] Reviewer attention queue: scenes sorted by confidence asc
- [ ] Realtime subscription on `video_jobs` — status badge updates without page refresh
- [ ] Audit log entry on review decision

**Definition of Done:** Reviewer logs Accept → `reviews` row exists → acceptance rate KPI updates on dashboard in real-time.

---

## Sprint 4 — Lock It Down (Auth + RLS)
**Goal:** Per-user data isolation; role enforcement.
- [ ] Enable Supabase Auth (email/password)
- [ ] Add `role` field to users; seed Creator/Reviewer/Admin roles
- [ ] Replace permissive RLS with `auth.uid() = user_id` owner policies
- [ ] Add role-based middleware: Reviewer cannot submit jobs; Admin can delete
- [ ] Login / signup pages; redirect anonymous users to login
- [ ] Confirm: demo seed rows remain; existing data not lost

**Definition of Done:** Anonymous user sees login page; logged-in Creator can run full workflow; Reviewer cannot submit video jobs; Admin can delete.

---

## Gantt (Sprint → Week)
| Sprint | Week |
|---|---|
| Sprint 1 — DB + CRUD | Week 1 |
| Sprint 2 — Core Engine (**v1 functional**) | Week 1 |
| Sprint 3 — Review & Dashboard | Week 2 |
| Sprint 4 — Lock It Down | Week 2 |
