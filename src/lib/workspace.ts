import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function waitForProfile(userId: string, maxAttempts = 5) {
  const admin = createServiceClient();

  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (data) return true;
    await new Promise((r) => setTimeout(r, 300));
  }

  return false;
}

/** Creates default workspace using service role (reliable onboarding). */
export async function ensureDefaultWorkspace(
  userId: string,
  email: string,
  fullName?: string,
) {
  const admin = createServiceClient();

  const { data: existingMember } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMember) {
    return existingMember.workspace_id;
  }

  const hasProfile = await waitForProfile(userId);
  if (!hasProfile) {
    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName?.trim() || "",
    });

    if (profileError && !profileError.message.includes("duplicate")) {
      throw new Error(`Profile setup failed: ${profileError.message}`);
    }
  }

  const { data: ownedWorkspace } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (ownedWorkspace) {
    const { error: memberError } = await admin.from("workspace_members").upsert(
      {
        workspace_id: ownedWorkspace.id,
        user_id: userId,
        role: "owner",
      },
      { onConflict: "workspace_id,user_id" },
    );

    if (memberError) {
      throw new Error(`Workspace member link failed: ${memberError.message}`);
    }

    return ownedWorkspace.id;
  }

  const baseName = fullName?.trim() || email.split("@")[0] || "My Business";
  const baseSlug = slugify(baseName) || "workspace";
  const slug = `${baseSlug}-${userId.slice(0, 8)}`;

  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      name: `${baseName}'s Workspace`,
      slug,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (workspaceError || !workspace) {
    throw new Error(
      workspaceError?.message ?? "Failed to create workspace",
    );
  }

  const { error: memberError } = await admin.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
  });

  if (memberError) {
    throw new Error(`Workspace member failed: ${memberError.message}`);
  }

  return workspace.id;
}

export type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string | null;
};

export function parseWorkspace(
  workspaces: WorkspaceRow | WorkspaceRow[] | null | undefined,
): WorkspaceRow | null {
  if (!workspaces) return null;
  if (Array.isArray(workspaces)) return workspaces[0] ?? null;
  return workspaces;
}

export async function getUserWorkspace(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_members")
    .select(
      `
      role,
      workspaces (
        id,
        name,
        slug,
        plan,
        subscription_status
      )
    `,
    )
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return data;
}
