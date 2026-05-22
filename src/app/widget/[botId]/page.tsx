import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { botId } = await params;
  const { key } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col bg-background p-4">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle className="text-base">ChatForge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end">
          <p className="mb-4 rounded-xl bg-white/5 p-3 text-sm text-muted-foreground">
            Widget UI + live chat arrives in Step 6–7. Bot: {botId.slice(0, 8)}…
          </p>
          <p className="text-xs text-muted-foreground">
            API key: {key ? "present" : "missing"}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
