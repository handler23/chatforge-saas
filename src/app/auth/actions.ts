"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultWorkspace } from "@/lib/workspace";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Email és jelszó kötelező." };
  }

  if (password.length < 6) {
    return { error: "A jelszó legalább 6 karakter legyen." };
  }

  let userId: string | undefined;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    const lower = signUpError.message.toLowerCase();
    if (lower.includes("already registered") || lower.includes("already exists")) {
      return signIn(formData);
    }
    return { error: mapAuthError(signUpError.message) };
  }

  userId = signUpData.user?.id;

  if (!signUpData.session) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      return {
        error: `Fiók létezik, de bejelentkezés sikertelen: ${mapAuthError(signInError.message, email)}`,
      };
    }

    userId = signInData.user?.id;

    if (!signInData.session) {
      return {
        error:
          "Fiók létrejött, de nincs session. Kapcsold ki a Confirm email-t Supabase-ben, vagy erősítsd meg az emailt.",
      };
    }
  }

  if (!userId) {
    return { error: "Regisztráció sikertelen — nincs user ID." };
  }

  try {
    await ensureDefaultWorkspace(userId, email, fullName);
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? `Workspace hiba: ${e.message}`
          : "Workspace létrehozás sikertelen. Ellenőrizd a SUPABASE_SERVICE_ROLE_KEY-t a .env.local-ban.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email és jelszó kötelező." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error.message, email) };
  }

  if (!data.user) {
    return { error: "Bejelentkezés sikertelen." };
  }

  try {
    await ensureDefaultWorkspace(
      data.user.id,
      data.user.email ?? email,
      data.user.user_metadata?.full_name,
    );
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? `Bejelentkezés OK, de workspace: ${e.message}`
          : "Workspace beállítás sikertelen.",
    };
  }

  const redirectTo = String(formData.get("redirect") ?? "/dashboard");
  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

function mapAuthError(message: string, email?: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return [
      "Hibás email vagy jelszó.",
      "Supabase → Users: töröld a teszt usert és regisztrálj újra, vagy állíts új jelszót.",
      email ? `Próbált email: ${email}` : null,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (lower.includes("email not confirmed")) {
    return "Az email nincs megerősítve. Kapcsold ki a Confirm email-t, vagy nyisd meg a megerősítő linket.";
  }

  if (lower.includes("email signups are disabled")) {
    return "Email regisztráció ki van kapcsolva Supabase-ben.";
  }

  return message;
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Add meg az email címed." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/reset-password`,
  });

  if (error) {
    return { error: mapAuthError(error.message, email) };
  }

  return {
    success: `Ha létezik fiók a(z) ${email} címen, küldtünk egy jelszó-visszaállító linket.`,
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "A jelszó legalább 6 karakter legyen." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
