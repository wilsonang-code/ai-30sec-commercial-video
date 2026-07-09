export type Brief = {
  id: string;
  user_id: string | null;
  brand_name: string;
  product: string;
  goal: string;
  tone: string;
  raw_notes: string | null;
  created_at: string;
};

export type ReviewStatus = "unreviewed" | "approved" | "edited";
export type StoryStatus = "draft" | "ready" | "submitted";

export type Story = {
  id: string;
  user_id: string | null;
  brief_id: string;
  title: string;
  summary: string | null;
  summary_source: string | null;
  summary_confidence: number | null;
  summary_review_status: ReviewStatus;
  status: StoryStatus;
  created_at: string;
};

export type Scene = {
  id: string;
  user_id: string | null;
  story_id: string;
  sequence: number;
  visual_prompt: string;
  visual_prompt_source: string | null;
  visual_prompt_confidence: number | null;
  visual_prompt_review_status: ReviewStatus;
  voiceover_text: string | null;
  duration_sec: number;
  created_at: string;
};

export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoJob = {
  id: string;
  user_id: string | null;
  story_id: string;
  status: VideoJobStatus;
  provider: string;
  external_job_id: string | null;
  output_url: string | null;
  error_message: string | null;
  created_at: string;
};

export type ReviewDecision = "accepted" | "rejected";

export type Review = {
  id: string;
  user_id: string | null;
  video_job_id: string;
  decision: ReviewDecision;
  feedback: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  object_type: string;
  object_id: string | null;
  payload_snapshot: unknown;
  risk_level: string | null;
  outcome: string | null;
  created_at: string;
};
