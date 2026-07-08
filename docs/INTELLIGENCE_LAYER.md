# Intelligence Layer

## Messy Inputs
- Raw brief: "FreshBrew — make something fun for Gen Z, coffee, 30 sec, launch in June"
- Unstructured tone notes, partial brand guidelines

## Auto-Structure Output (Story Generation)
```json
{
  "title": "FreshBrew Morning Spark",
  "summary": "Five-scene upbeat coffee journey targeting Gen Z morning routines.",
  "summary_confidence": 0.87,
  "scenes": [
    { "sequence": 1, "visual_prompt": "Alarm rings; hand grabs FreshBrew can from bedside table, golden sunrise light.", "voiceover": "Your morning just got legendary.", "duration_sec": 6, "confidence": 0.91 },
    { "sequence": 2, "visual_prompt": "Skate park, group of friends sharing FreshBrew, slow-mo pour.", "voiceover": "Brewed for the bold.", "duration_sec": 6, "confidence": 0.88 }
  ]
}
```

## Events to Track
- Brief created
- Story generated (AI)
- Scene edited by human (review_status → 'edited')
- Video job submitted / completed / failed
- Review decision logged

## Scoring Rules (rule-based v1)
- **Story confidence** = mean(scene confidences) — shown as % badge
- **Acceptance rate** = accepted reviews / total reviews (dashboard KPI)
- **Scenes needing review** = count where review_status = 'unreviewed'

## What Gets Ranked
- Scenes sorted by confidence asc → reviewer attention queue
- Dashboard sorts VideoJobs by created_at desc

## v1 vs Later
- **v1:** GPT story + scene generation, confidence badges, review queue
- **Later:** Auto-score brief quality, suggest tone improvements, learn from accepted vs rejected videos
