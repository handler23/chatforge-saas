import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPlanLimits } from "@/lib/plans";

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateWidgetAccess(botId: string, apiKey: string) {
  const admin = createServiceClient();
  const keyHash = hashApiKey(apiKey);
  const prefix = apiKey.slice(0, 12);

  const { data: keyRow } = await admin
    .from("api_keys")
    .select("id, workspace_id, bot_id, is_active")
    .eq("key_prefix", prefix)
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();

  if (!keyRow) {
    return { error: "Invalid API key" as const };
  }

  if (keyRow.bot_id && keyRow.bot_id !== botId) {
    return { error: "API key not valid for this bot" as const };
  }

  const { data: bot } = await admin
    .from("bots")
    .select("id, workspace_id, name, system_prompt, welcome_message, primary_color, is_active")
    .eq("id", botId)
    .eq("workspace_id", keyRow.workspace_id)
    .maybeSingle();

  if (!bot || !bot.is_active) {
    return { error: "Bot not found or inactive" as const };
  }

  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, plan")
    .eq("id", keyRow.workspace_id)
    .single();

  if (!workspace) {
    return { error: "Workspace not found" as const };
  }

  await admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  return { bot, workspace, admin };
}

export async function checkAndIncrementUsage(
  admin: ReturnType<typeof createServiceClient>,
  workspaceId: string,
  plan: string,
) {
  const limits = getPlanLimits(plan);
  const yearMonth = new Date().toISOString().slice(0, 7);

  const { data: usage } = await admin
    .from("usage_monthly")
    .select("id, message_count")
    .eq("workspace_id", workspaceId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  const count = usage?.message_count ?? 0;
  if (count >= limits.maxMessages) {
    return { error: "Monthly message limit reached. Please upgrade your plan." as const };
  }

  if (usage) {
    await admin
      .from("usage_monthly")
      .update({ message_count: count + 1 })
      .eq("id", usage.id);
  } else {
    await admin.from("usage_monthly").insert({
      workspace_id: workspaceId,
      year_month: yearMonth,
      message_count: 1,
    });
  }

  return { ok: true as const };
}
