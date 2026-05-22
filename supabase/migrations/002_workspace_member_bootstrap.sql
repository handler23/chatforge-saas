-- Allow workspace owner to add themselves as first member
create policy "Owners insert self as member"
  on public.workspace_members for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );
