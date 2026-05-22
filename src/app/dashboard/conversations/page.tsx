import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireWorkspace } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConversationsPage() {
  const { supabase, workspace } = await requireWorkspace();

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id,
      visitor_id,
      created_at,
      updated_at,
      bots ( name )
    `,
    )
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Chat history from your embedded widgets.
        </p>
      </div>

      {!conversations?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No conversations yet</CardTitle>
            <CardDescription>
              When visitors use the widget on a website, threads appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {conversations.map((c) => {
            const botName = Array.isArray(c.bots)
              ? c.bots[0]?.name
              : (c.bots as { name: string } | null)?.name;

            return (
              <Link key={c.id} href={`/dashboard/conversations/${c.id}`}>
                <Card className="transition-transform hover:-translate-y-0.5">
                  <CardContent className="flex items-center gap-4 py-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                      <MessageSquare className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {botName ?? "Chatbot"} · visitor {c.visitor_id.slice(0, 8)}…
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(c.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm text-indigo-400">View →</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
