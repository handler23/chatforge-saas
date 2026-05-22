import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, workspace } = await requireWorkspace();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, visitor_id, created_at, bots(name)")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const botName = Array.isArray(conversation.bots)
    ? conversation.bots[0]?.name
    : (conversation.bots as { name: string } | null)?.name;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/dashboard/conversations"
        className="text-sm text-indigo-400 hover:underline"
      >
        ← Back to conversations
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{botName ?? "Conversation"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visitor {conversation.visitor_id} ·{" "}
            {new Date(conversation.created_at).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages?.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                m.role === "user"
                  ? "ml-8 bg-indigo-500/20 text-foreground"
                  : "mr-8 bg-white/5 text-muted-foreground",
              )}
            >
              <span className="mb-1 block text-xs font-medium uppercase opacity-60">
                {m.role}
              </span>
              {m.content}
            </div>
          ))}
          {!messages?.length && (
            <p className="text-sm text-muted-foreground">No messages.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
