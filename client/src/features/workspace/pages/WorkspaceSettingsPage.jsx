import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import {
  useWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '../hooks/useWorkspaceQueries.js';
import { Button } from '../../../shared/components/ui/button.jsx';
import { Input } from '../../../shared/components/ui/input.jsx';
import { Label } from '../../../shared/components/ui/label.jsx';
import { Textarea } from '../../../shared/components/ui/textarea.jsx';
import { Separator } from '../../../shared/components/ui/separator.jsx';
import { PageShell } from '../../../shared/components/layout/PageShell.jsx';
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog.jsx';
import { FormError } from '../../auth/components/FormError.jsx';
import { MembersTable } from '../components/MembersTable.jsx';
import { InviteMemberForm } from '../components/InviteMemberForm.jsx';

const schema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().max(200).optional(),
});

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const { mutate: update, isPending: isUpdating } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    values: {
      name: workspace?.name ?? '',
      description: workspace?.description ?? '',
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function onSubmit(data) {
    update({ workspaceId, data });
  }

  return (
    <PageShell title="Workspace settings">
      <div className="max-w-2xl space-y-8">
        <section>
          <h2 className="text-base font-semibold mb-4">General</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace name</Label>
              <Input
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              <FormError message={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} {...register('description')} />
            </div>
            <Button type="submit" disabled={!isDirty || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </form>
        </section>

        <Separator />

        <section>
          <h2 className="text-base font-semibold mb-4">Members</h2>
          <InviteMemberForm workspaceId={workspaceId} />
          <div className="mt-4">
            <MembersTable
              members={workspace?.members ?? []}
              workspaceId={workspaceId}
            />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-base font-semibold text-destructive mb-2">
            Danger zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting a workspace permanently removes all projects, tasks, and
            data.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete workspace
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete workspace"
        description={`This will permanently delete "${workspace?.name}" and all its data. This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() =>
          deleteWorkspace(workspaceId, {
            onSuccess: () => navigate('/workspaces'),
          })
        }
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </PageShell>
  );
}
