"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { createApiKey, revokeKeyForm } from "@/app/dashboard/api-keys/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  bot_id: string | null;
  is_active: boolean;
  created_at: string;
  bots?: { name: string } | { name: string }[] | null;
};

type BotOption = { id: string; name: string };

type FormState = { error?: string; success?: string; key?: string };

export function ApiKeyManager({
  keys,
  bots,
}: {
  keys: ApiKeyRow[];
  bots: BotOption[];
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await createApiKey(formData);
      if (result?.key) {
        toast.success("Key created — copy it now!");
      }
      return result ?? {};
    },
    {} as FormState,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate API key</CardTitle>
          <CardDescription>Used to authenticate the embed widget on customer sites.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key name</label>
              <Input name="name" placeholder="Website embed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link to bot (optional)</label>
              <select
                name="bot_id"
                className="flex h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground"
              >
                <option value="">All bots in workspace</option>
                {bots.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {state?.error && (
              <p className="text-sm text-red-300">{state.error}</p>
            )}
            {state?.success && (
              <p className="text-sm text-emerald-300">{state.success}</p>
            )}
            {state?.key && (
              <div className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 p-4">
                <p className="mb-2 text-xs font-medium text-indigo-200">Copy now (shown once):</p>
                <code className="break-all text-sm text-white">{state.key}</code>
              </div>
            )}

            <Button type="submit" loading={pending}>
              Generate key
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {keys.map((key) => {
                const botName = Array.isArray(key.bots)
                  ? key.bots[0]?.name
                  : key.bots?.name;

                return (
                  <li
                    key={key.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{key.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {key.key_prefix}••••••
                        {botName ? ` · ${botName}` : ""}
                        {!key.is_active && " · revoked"}
                      </p>
                    </div>
                    {key.is_active && (
                      <form action={revokeKeyForm.bind(null, key.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
