import Link from "next/link";
import { Bot, MessageSquare, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getUserWorkspace,
  parseWorkspace,
  type WorkspaceRow,
} from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const membership = user ? await getUserWorkspace(user.id) : null;
  const ws = parseWorkspace(
    membership?.workspaces as WorkspaceRow | WorkspaceRow[] | null,
  );

  let botCount = 0;
  let messageCount = 0;

  if (ws?.id) {
    const { count: bots } = await supabase
      .from("bots")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", ws.id);
    botCount = bots ?? 0;

    const yearMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage_monthly")
      .select("message_count")
      .eq("workspace_id", ws.id)
      .eq("year_month", yearMonth)
      .maybeSingle();
    messageCount = usage?.message_count ?? 0;
  }

  const plan = ws?.plan ?? "free";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage chatbots, conversations, and billing from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
            <Zap className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize text-foreground">{plan}</p>
            <p className="text-xs text-muted-foreground">
              Status: {ws?.subscription_status ?? "incomplete"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chatbots
            </CardTitle>
            <Bot className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{botCount}</p>
            <Link href="/dashboard/bots" className="text-xs text-indigo-400 hover:underline">
              Manage bots →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages this month
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{messageCount}</p>
            <p className="text-xs text-muted-foreground">Resets each calendar month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>
            Step 5 adds bot creation. For now, explore the dashboard shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/bots">
            <Button>Create chatbot</Button>
          </Link>
          <Link href="/dashboard/api-keys">
            <Button variant="secondary">API keys</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
