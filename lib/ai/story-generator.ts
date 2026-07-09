import type { Brief } from "@/lib/types";

export type GeneratedScene = {
  sequence: number;
  visual_prompt: string;
  voiceover: string;
  duration_sec: number;
  confidence: number;
};

export type GeneratedStory = {
  title: string;
  summary: string;
  summary_confidence: number;
  source: string;
  scenes: GeneratedScene[];
};

const SCENE_BEATS = [
  (b: Brief) =>
    `Opening hook: everyday moment interrupted by ${b.product}, ${b.tone.split(",")[0].trim()} lighting and framing.`,
  (b: Brief) =>
    `${b.brand_name}'s ${b.product} shown in use — clean product hero shot, tone: ${b.tone}.`,
  (b: Brief) =>
    `People reacting positively to ${b.product}; energy builds toward the brand promise.`,
  (b: Brief) =>
    `Close-up detail shot of ${b.product} — texture, craft, or feature that supports "${b.goal}".`,
  (b: Brief) =>
    `Closing logo card: ${b.brand_name} wordmark, tagline capturing "${b.goal}".`,
];

function templateFallback(brief: Brief): GeneratedStory {
  const scenes: GeneratedScene[] = SCENE_BEATS.map((beat, i) => ({
    sequence: i + 1,
    visual_prompt: beat(brief),
    voiceover:
      i === SCENE_BEATS.length - 1
        ? `${brief.brand_name}. ${brief.goal}.`
        : `${brief.tone.split(",")[0].trim()} energy, made for you.`,
    duration_sec: 6,
    confidence: 0.6,
  }));

  return {
    title: `${brief.brand_name} — ${brief.goal}`.slice(0, 80),
    summary: `Five-scene ${brief.tone.split(",")[0].trim().toLowerCase()} story for ${brief.brand_name} ${brief.product}, built from the brief without AI (no OPENAI_API_KEY configured).`,
    summary_confidence: 0.6,
    source: "template-fallback",
    scenes,
  };
}

const OPENAI_SCHEMA_PROMPT = `You are a commercial video story writer. Given a brief (brand, product, goal, tone, raw notes),
produce a JSON object with this exact shape:
{
  "title": string,
  "summary": string,
  "summary_confidence": number (0-1),
  "scenes": [
    { "sequence": number, "visual_prompt": string, "voiceover": string, "duration_sec": number, "confidence": number (0-1) }
  ]
}
Produce exactly 5 scenes totalling 30 seconds (duration_sec should sum to 30). Return ONLY the JSON object, no markdown fences.`;

async function openAiGenerate(brief: Brief): Promise<GeneratedStory> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: OPENAI_SCHEMA_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            brand_name: brief.brand_name,
            product: brief.product,
            goal: brief.goal,
            tone: brief.tone,
            raw_notes: brief.raw_notes,
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");

  let parsed: {
    title: string;
    summary: string;
    summary_confidence: number;
    scenes: GeneratedScene[];
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned malformed JSON");
  }

  if (!parsed.title || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
    throw new Error("OpenAI response missing required fields");
  }

  return { ...parsed, source: "gpt-4o" };
}

export async function generateStoryDraft(brief: Brief): Promise<GeneratedStory> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await openAiGenerate(brief);
    } catch {
      // Fall through to deterministic fallback so the workflow never dead-ends.
      return templateFallback(brief);
    }
  }
  return templateFallback(brief);
}
