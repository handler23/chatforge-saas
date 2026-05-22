import Link from "next/link";
import { Plus, Bot } from "lucide-react";
import { requireWorkspace } from "@/lib/session";
import { getPlanLimits } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BotsPage() {
  const { supabase, workspace } = await requireWorkspace();
  const limits = getPlanLimits(workspace.plan);

  const { data: bots } = await supabase
    .from("bots")
    .select("id, name, is_active, primary_color, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const count = bots?.length ?? 0;
  const atLimit = count >= limits.maxBots;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chatbots</h1>
          <p className="text-sm text-muted-foreground">
            {count} / {limits.maxBots} on {workspace.plan} plan
          </p>
        </div>
        {atLimit ? (
          <Button disabled>Bot limit reached</Button>
        ) : (
          <Link href="/dashboard/bots/new">
            <Button>
              <Plus className="h-4 w-4" />
              New chatbot
            </Button>
          </Link>
        )}
      </div>

      {!bots?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No chatbots yet</CardTitle>
            <CardDescription>Create your first AI assistant for a client website.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/bots/new">
              <Button>Create chatbot</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bots.map((bot) => (
            <Link key={bot.id} href={`/dashboard/bots/${bot.id}`}>
              <Card className="transition-transform hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 py-5">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${bot.primary_color}22`, color: bot.primary_color }}
                  >
                    <Bot className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{bot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bot.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <span className="text-sm text-indigo-400">Edit →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
