"use server";

import { revalidatePath } from "next/cache";
import { generateApiKey } from "@/lib/api-keys";
import { requireWorkspace } from "@/lib/session";

export async function createApiKey(formData: FormData) {
  const { supabase, workspace } = await requireWorkspace();

  const name = String(formData.get("name") ?? "Embed key").trim() || "Embed key";
  const botId = String(formData.get("bot_id") ?? "").trim() || null;

  if (botId) {
    const { data: bot } = await supabase
      .from("bots")
      .select("id")
      .eq("id", botId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();

    if (!bot) return { error: "Invalid bot selected." };
  }

  const { raw, hash, prefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    workspace_id: workspace.id,
    bot_id: botId,
    name,
    key_prefix: prefix,
    key_hash: hash,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
  return { success: "API key created. Copy it now — it won't be shown again.", key: raw };
}

export async function revokeKeyForm(keyId: string) {
  await revokeApiKey(keyId);
}

export async function revokeApiKey(keyId: string) {
  const { supabase, workspace } = await requireWorkspace();

  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", keyId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
  return { success: "API key revoked." };
}
