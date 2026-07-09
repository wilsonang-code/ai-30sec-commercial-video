import { createClient } from "@/lib/supabase/server";

export async function logAudit(entry: {
  action: string;
  object_type: string;
  object_id?: string | null;
  payload_snapshot?: unknown;
  risk_level?: "low" | "medium" | "high" | "critical";
  outcome?: "success" | "failure";
}) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    action: entry.action,
    object_type: entry.object_type,
    object_id: entry.object_id ?? null,
    payload_snapshot: entry.payload_snapshot ?? null,
    risk_level: entry.risk_level ?? "low",
    outcome: entry.outcome ?? "success",
  });
}
