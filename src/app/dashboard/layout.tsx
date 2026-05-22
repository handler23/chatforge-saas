import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ensureDefaultWorkspace,
  getUserWorkspace,
  parseWorkspace,
  type WorkspaceRow,
} from "@/lib/workspace";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  try {
    await ensureDefaultWorkspace(
      user.id,
      user.email,
      user.user_metadata?.full_name,
    );
  } catch {
    redirect("/login?error=workspace_setup");
  }

  const membership = await getUserWorkspace(user.id);
  const workspace = parseWorkspace(
    membership?.workspaces as WorkspaceRow | WorkspaceRow[] | null,
  );
  const workspaceName = workspace?.name ?? "My Workspace";

  return (
    <DashboardShell email={user.email} workspaceName={workspaceName}>
      {children}
    </DashboardShell>
  );
}
