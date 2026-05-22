"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState = { error: "" as string | undefined };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updatePassword(formData);
      return result ?? initialState;
    },
    initialState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Új jelszó</CardTitle>
          <CardDescription>Adj meg egy új jelszót (min. 6 karakter).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Új jelszó
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={pending}>
              Jelszó mentése
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Bejelentkezés
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
