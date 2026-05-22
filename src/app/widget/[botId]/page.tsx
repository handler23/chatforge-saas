import { createServiceClient } from "@/lib/supabase/admin";
import { ChatWidget } from "@/components/widget/chat-widget";

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { botId } = await params;
  const { key } = await searchParams;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!key) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-sm text-slate-400">
        Missing API key in embed URL.
      </main>
    );
  }

  const admin = createServiceClient();
  const { data: bot } = await admin
    .from("bots")
    .select("welcome_message, primary_color, is_active")
    .eq("id", botId)
    .maybeSingle();

  if (!bot?.is_active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-sm text-slate-400">
        This chatbot is offline.
      </main>
    );
  }

  return (
    <ChatWidget
      botId={botId}
      apiKey={key}
      welcomeMessage={bot.welcome_message}
      primaryColor={bot.primary_color}
      appUrl={appUrl}
    />
  );
}
