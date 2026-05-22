import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserWorkspace,
  parseWorkspace,
  type WorkspaceRow,
} from "@/lib/workspace";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function requireWorkspace(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string };
  workspace: WorkspaceRow;
}> {
  const { supabase, user } = await requireUser();
  const membership = await getUserWorkspace(user.id);
  const workspace = parseWorkspace(
    membership?.workspaces as WorkspaceRow | WorkspaceRow[] | null,
  );

  if (!workspace) {
    redirect("/login?error=no_workspace");
  }

  return {
    supabase,
    user: { id: user.id, email: user.email! },
    workspace,
  };
}
