import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/session";
import { BotForm } from "@/components/dashboard/bot-form";
import { EmbedCode } from "@/components/dashboard/embed-code";

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, workspace } = await requireWorkspace();

  const { data: bot } = await supabase
    .from("bots")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!bot) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BotForm
        bot={{
          id: bot.id,
          name: bot.name,
          system_prompt: bot.system_prompt,
          welcome_message: bot.welcome_message,
          primary_color: bot.primary_color,
          is_active: bot.is_active,
        }}
      />
      <EmbedCode botId={bot.id} appUrl={appUrl} />
    </div>
  );
}
