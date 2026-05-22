"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormState = { error?: string; success?: string };
const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await requestPasswordReset(formData);
      return result ?? initialState;
    },
    initialState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Jelszó visszaállítás</CardTitle>
          <CardDescription>
            Küldünk egy linket a(z) handlermartin9@gmail.com típusú címedre (bármely
            regisztrált email).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="handlermartin9@gmail.com"
                defaultValue="handlermartin9@gmail.com"
              />
            </div>

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

            <Button type="submit" className="w-full" loading={pending}>
              Link küldése
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Vissza a bejelentkezéshez
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
