"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createBot, deleteBot, updateBot } from "@/app/dashboard/bots/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type BotFormValues = {
  id?: string;
  name: string;
  system_prompt: string;
  welcome_message: string;
  primary_color: string;
  is_active: boolean;
};

type FormState = { error?: string; success?: string };

export function BotForm({ bot }: { bot?: BotFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(bot?.id);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      if (isEdit && bot?.id) {
        return (await updateBot(bot.id, formData)) ?? {};
      }
      const result = await createBot(formData);
      if (result && "error" in result) return { error: result.error };
      return {};
    },
    {} as FormState,
  );

  async function handleDelete() {
    if (!bot?.id) return;
    if (!confirm("Delete this chatbot permanently?")) return;
    await deleteBot(bot.id);
    router.push("/dashboard/bots");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit chatbot" : "New chatbot"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input name="name" defaultValue={bot?.name ?? ""} required placeholder="Support Bot" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System prompt</label>
            <textarea
              name="system_prompt"
              rows={4}
              defaultValue={bot?.system_prompt ?? "You are a helpful customer support assistant."}
              className="flex w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Welcome message</label>
            <Input
              name="welcome_message"
              defaultValue={bot?.welcome_message ?? "Hi! How can I help you today?"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand color</label>
            <Input
              name="primary_color"
              type="color"
              defaultValue={bot?.primary_color ?? "#6366f1"}
              className="h-11 w-full max-w-[120px] cursor-pointer p-1"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={bot?.is_active ?? true}
              className="rounded border-white/20"
            />
            Active (visible on website)
          </label>

          {state?.error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {state.success}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={pending}>
              {isEdit ? "Save changes" : "Create chatbot"}
            </Button>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
