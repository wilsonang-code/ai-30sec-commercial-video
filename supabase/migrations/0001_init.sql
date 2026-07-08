create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  brand_name text not null,
  product text not null,
  goal text not null,
  tone text not null,
  raw_notes text,
  created_at timestamptz not null default now()
);
alter table briefs enable row level security;
drop policy if exists "briefs_v1_read" on briefs;
create policy "briefs_v1_read" on briefs for select using (true);
drop policy if exists "briefs_v1_write" on briefs;
create policy "briefs_v1_write" on briefs for all using (true) with check (true);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  brief_id uuid references briefs(id),
  title text not null,
  summary text,
  summary_source text,
  summary_confidence numeric,
  summary_review_status text default 'unreviewed',
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
alter table stories enable row level security;
drop policy if exists "stories_v1_read" on stories;
create policy "stories_v1_read" on stories for select using (true);
drop policy if exists "stories_v1_write" on stories;
create policy "stories_v1_write" on stories for all using (true) with check (true);

create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  story_id uuid references stories(id),
  sequence int not null,
  visual_prompt text not null,
  visual_prompt_source text,
  visual_prompt_confidence numeric,
  visual_prompt_review_status text default 'unreviewed',
  voiceover_text text,
  duration_sec int not null default 6,
  created_at timestamptz not null default now()
);
alter table scenes enable row level security;
drop policy if exists "scenes_v1_read" on scenes;
create policy "scenes_v1_read" on scenes for select using (true);
drop policy if exists "scenes_v1_write" on scenes;
create policy "scenes_v1_write" on scenes for all using (true) with check (true);

create table if not exists video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  story_id uuid references stories(id),
  status text not null default 'queued',
  provider text not null default 'runway',
  external_job_id text,
  output_url text,
  error_message text,
  created_at timestamptz not null default now()
);
alter table video_jobs enable row level security;
drop policy if exists "video_jobs_v1_read" on video_jobs;
create policy "video_jobs_v1_read" on video_jobs for select using (true);
drop policy if exists "video_jobs_v1_write" on video_jobs;
create policy "video_jobs_v1_write" on video_jobs for all using (true) with check (true);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  video_job_id uuid references video_jobs(id),
  decision text not null,
  feedback text,
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;
drop policy if exists "reviews_v1_read" on reviews;
create policy "reviews_v1_read" on reviews for select using (true);
drop policy if exists "reviews_v1_write" on reviews;
create policy "reviews_v1_write" on reviews for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid,
  payload_snapshot jsonb,
  risk_level text,
  outcome text,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into briefs (id, brand_name, product, goal, tone, raw_notes) values
  ('a1000000-0000-0000-0000-000000000001', 'FreshBrew', 'Canned Cold Brew Coffee', 'Launch awareness for Gen Z audience', 'Energetic, bold, playful', 'Launch in June, skate park vibes, morning routine angle'),
  ('a1000000-0000-0000-0000-000000000002', 'LunaFit', 'Smart Fitness Tracker', 'Drive app downloads for Q3 campaign', 'Premium, motivational, clean', 'Target 25-40 professionals, emphasise sleep tracking feature'),
  ('a1000000-0000-0000-0000-000000000003', 'GreenNest', 'Eco Home Cleaning Kit', 'Brand awareness for sustainability angle', 'Warm, trustworthy, natural', 'Families with kids, earthy palette, no harsh chemicals message');

insert into stories (id, brief_id, title, summary, summary_source, summary_confidence, summary_review_status, status) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'FreshBrew Morning Spark', 'Five-scene upbeat coffee journey targeting Gen Z morning routines, ending with group share at skate park.', 'gpt-4o', 0.87, 'approved', 'submitted'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'LunaFit — Own Your Night', 'Four-scene premium narrative: late office, run at dusk, sleep data reveal, morning triumph.', 'gpt-4o', 0.82, 'approved', 'ready');

insert into scenes (story_id, sequence, visual_prompt, visual_prompt_source, visual_prompt_confidence, visual_prompt_review_status, voiceover_text, duration_sec) values
  ('b1000000-0000-0000-0000-000000000001', 1, 'Alarm rings; hand reaches for a FreshBrew can from bedside table, golden sunrise light streaming through window.', 'gpt-4o', 0.91, 'approved', 'Your morning just got legendary.', 6),
  ('b1000000-0000-0000-0000-000000000001', 2, 'Skate park aerial shot; group of friends laughing, sharing FreshBrew cans, slow-motion pour in sunlight.', 'gpt-4o', 0.88, 'approved', 'Brewed for the bold.', 6),
  ('b1000000-0000-0000-0000-000000000001', 3, 'Close-up of can condensation dripping, vibrant teal background, fast cut to person taking first sip.', 'gpt-4o', 0.85, 'unreviewed', 'Cold. Sharp. Unapologetic.', 6),
  ('b1000000-0000-0000-0000-000000000001', 4, 'Street mural with FreshBrew logo spray-painted; artist steps back and nods approvingly.', 'gpt-4o', 0.79, 'unreviewed', 'Make your mark.', 6),
  ('b1000000-0000-0000-0000-000000000001', 5, 'FreshBrew can centred on white studio background, logo zoom, tagline appears in bold text.', 'gpt-4o', 0.93, 'approved', 'FreshBrew. Mornings redefined.', 6),
  ('b1000000-0000-0000-0000-000000000002', 1, 'Professional in glass office building, 9 PM, staring at screen, LunaFit band glowing on wrist.', 'gpt-4o', 0.84, 'approved', 'You give everything. Start taking it back.', 8),
  ('b1000000-0000-0000-0000-000000000002', 2, 'Outdoor run at dusk, cinematic tracking shot, LunaFit heart-rate display on wrist mid-stride.', 'gpt-4o', 0.88, 'approved', 'Train smarter. Recover faster.', 7),
  ('b1000000-0000-0000-0000-000000000002', 3, 'Sleep data dashboard animation on phone screen, clean UI, metrics rising overnight.', 'gpt-4o', 0.76, 'unreviewed', 'While you sleep, LunaFit works.', 8);

insert into video_jobs (id, story_id, status, provider, external_job_id, output_url) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'completed', 'runway', 'rwj_demo_001', 'https://www.w3schools.com/html/mov_bbb.mp4'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'processing', 'runway', 'rwj_demo_002', null);

insert into reviews (video_job_id, decision, feedback) values
  ('c1000000-0000-0000-0000-000000000001', 'accepted', 'Client loved the skate park scene. Approved for final cut.');