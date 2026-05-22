"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Bot } from "lucide-react";
import { signIn, signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

const initialState = { error: "" as string | undefined };

export function AuthForm({ mode, redirectTo }: { mode: AuthMode; redirectTo?: string }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await action(formData);
      return result ?? initialState;
    },
    initialState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ChatForge</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Log in" : "Sign up free"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Access your chatbot dashboard"
                : "Start with a free workspace for your business"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {redirectTo && (
                <input type="hidden" name="redirect" value={redirectTo} />
              )}

              {mode === "register" && (
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@business.com"
                  required
                  autoComplete="email"
                  defaultValue=""
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {state?.error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {state.error}
                </p>
              )}

              <Button type="submit" className="w-full" loading={pending}>
                {mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>

            {mode === "login" && (
              <p className="mt-3 text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-indigo-400 hover:underline"
                >
                  Elfelejtett jelszó?
                </Link>
              </p>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  Nincs fiókod?{" "}
                  <Link href="/register" className="text-indigo-400 hover:underline">
                    Regisztráció
                  </Link>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <Link href="/login" className="text-indigo-400 hover:underline">
                    Log in
                  </Link>
                </>
              )}
            </p>

            <Link
              href="/"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
