import { requireWorkspace } from "@/lib/session";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

export default async function ApiKeysPage() {
  const { supabase, workspace } = await requireWorkspace();

  const [{ data: keys }, { data: bots }] = await Promise.all([
    supabase
      .from("api_keys")
      .select("id, name, key_prefix, bot_id, is_active, created_at, bots(name)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bots")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .order("name"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Secure keys for embedding chatbots on client websites.
        </p>
      </div>
      <ApiKeyManager keys={keys ?? []} bots={bots ?? []} />
    </div>
  );
}
