import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useWorkspaces,
  useDeleteWorkspace,
} from '../hooks/useWorkspaceQueries.js';
import { useWorkspaceStore } from '../../../core/store/workspaceStore.js';
import { Button } from '../../../shared/components/ui/button.jsx';
import { PageShell } from '../../../shared/components/layout/PageShell.jsx';
import { EmptyState } from '../../../shared/components/feedback/EmptyState.jsx';
import { WorkspaceSkeleton } from '../../../shared/components/feedback/WorkspaceSkeleton.jsx';
import { WorkspaceCard } from '../components/WorkspaceCard.jsx';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal.jsx';
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog.jsx';

export default function WorkspacesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const { data: workspaces, isLoading } = useWorkspaces();
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();
  const { setCurrentWorkspace } = useWorkspaceStore();

  function handleSelect(workspace) {
    setCurrentWorkspace(workspace);
    navigate(`/workspace/${workspace._id}/projects`);
  }

  if (isLoading) return <WorkspaceSkeleton />;

  return (
    <PageShell
      title="Workspaces"
      description="Manage your workspaces and teams"
      action={
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New workspace
        </Button>
      }
    >
      {!workspaces?.length ? (
        <EmptyState
          title="No workspaces yet"
          description="Create your first workspace to start collaborating"
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create workspace
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace._id}
              workspace={workspace}
              onSelect={() => handleSelect(workspace)}
              onSettings={() =>
                navigate(`/workspace/${workspace._id}/settings`)
              }
              onDelete={() => setDeleteTarget(workspace)}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete workspace"
        description={`"${deleteTarget?.name}" and all its data will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() =>
          deleteWorkspace(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  );
}
