"use client";

import { useActionState, useEffect, useState } from "react";
import { updateScene, type UpdateSceneState } from "@/lib/actions/scenes";
import { StatusBadge } from "@/app/components/StatusBadge";
import type { Scene } from "@/lib/types";

const initialState: UpdateSceneState = { error: null, success: false };

export function SceneEditor({ scene }: { scene: Scene }) {
  const [state, formAction, pending] = useActionState(
    updateScene.bind(null, scene.id, scene.story_id),
    initialState,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (state.success) {
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  const confidencePct =
    scene.visual_prompt_confidence != null
      ? Math.round(scene.visual_prompt_confidence * 100)
      : null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Scene {scene.sequence}</h3>
        <div className="flex items-center gap-2">
          {confidencePct != null && (
            <span className="text-xs text-neutral-400">
              {confidencePct}% confidence
            </span>
          )}
          <StatusBadge status={scene.visual_prompt_review_status} />
        </div>
      </div>

      <form action={formAction} className="mt-3 space-y-3">
        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-500">
            Visual prompt
          </label>
          <textarea
            name="visual_prompt"
            defaultValue={scene.visual_prompt}
            rows={2}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500">
            Voiceover
          </label>
          <input
            name="voiceover_text"
            defaultValue={scene.voiceover_text ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {savedFlash && (
            <span className="text-xs text-green-600">Saved</span>
          )}
          <span className="text-xs text-neutral-400">
            {scene.duration_sec}s
          </span>
        </div>
      </form>
    </div>
  );
}
