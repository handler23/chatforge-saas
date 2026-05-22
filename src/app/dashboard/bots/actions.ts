"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPlanLimits } from "@/lib/plans";
import { requireWorkspace } from "@/lib/session";

export async function createBot(formData: FormData) {
  const { supabase, workspace } = await requireWorkspace();

  const limits = getPlanLimits(workspace.plan);
  const { count } = await supabase
    .from("bots")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  if ((count ?? 0) >= limits.maxBots) {
    return {
      error: `Bot limit reached for ${workspace.plan} plan (${limits.maxBots} max). Upgrade billing to add more.`,
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Bot name is required." };

  const { data, error } = await supabase
    .from("bots")
    .insert({
      workspace_id: workspace.id,
      name,
      system_prompt: String(formData.get("system_prompt") ?? "").trim() ||
        "You are a helpful customer support assistant.",
      welcome_message: String(formData.get("welcome_message") ?? "").trim() ||
        "Hi! How can I help you today?",
      primary_color: String(formData.get("primary_color") ?? "#6366f1"),
      is_active: formData.get("is_active") === "on",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/bots");
  redirect(`/dashboard/bots/${data.id}`);
}

export async function updateBot(botId: string, formData: FormData) {
  const { supabase, workspace } = await requireWorkspace();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Bot name is required." };

  const { error } = await supabase
    .from("bots")
    .update({
      name,
      system_prompt: String(formData.get("system_prompt") ?? "").trim(),
      welcome_message: String(formData.get("welcome_message") ?? "").trim(),
      primary_color: String(formData.get("primary_color") ?? "#6366f1"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", botId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/bots/${botId}`);
  revalidatePath("/dashboard/bots");
  return { success: "Chatbot saved." };
}

export async function deleteBot(botId: string) {
  const { supabase, workspace } = await requireWorkspace();

  const { error } = await supabase
    .from("bots")
    .delete()
    .eq("id", botId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/bots");
  redirect("/dashboard/bots");
}
