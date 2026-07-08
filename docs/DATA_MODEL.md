# Data Model

## briefs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner (nullable until lockdown) |
| brand_name | text | |
| product | text | |
| goal | text | |
| tone | text | e.g. energetic, warm, premium |
| raw_notes | text | freeform client input |
| created_at | timestamptz | |

## stories
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| brief_id | uuid FK briefs | |
| title | text | |
| summary | text | AI-generated |
| summary_source | text | 'gpt-4o' |
| summary_confidence | numeric | 0–1 |
| summary_review_status | text | 'unreviewed'\|'approved'\|'edited' |
| status | text | 'draft'\|'ready'\|'submitted' |
| created_at | timestamptz | |

## scenes
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| story_id | uuid FK stories | |
| sequence | int | order within story |
| visual_prompt | text | AI-generated |
| visual_prompt_source | text | 'gpt-4o' |
| visual_prompt_confidence | numeric | |
| visual_prompt_review_status | text | 'unreviewed'\|'approved'\|'edited' |
| voiceover_text | text | |
| duration_sec | int | default 6 |
| created_at | timestamptz | |

## video_jobs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| story_id | uuid FK stories | |
| status | text | 'queued'\|'processing'\|'completed'\|'failed' |
| provider | text | 'runway'\|'kling' |
| external_job_id | text | API reference |
| output_url | text | signed storage URL |
| error_message | text | |
| created_at | timestamptz | |

## reviews
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | reviewer |
| video_job_id | uuid FK video_jobs | |
| decision | text | 'accepted'\|'rejected' |
| feedback | text | |
| created_at | timestamptz | |

## RLS
All tables: RLS enabled. v1 permissive read+write policies for anonymous demo. Lock-down sprint replaces with `auth.uid() = user_id`.
