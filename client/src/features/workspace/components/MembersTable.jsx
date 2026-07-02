import { useState } from 'react';
import { MoreHorizontal, Shield, UserMinus } from 'lucide-react';
import {
  useUpdateMemberRole,
  useRemoveMember,
} from '../hooks/useWorkspaceQueries.js';
import { useAuthStore } from '../../../core/store/authStore.js';
import { usePermission } from '../../../core/hooks/usePermission.js';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar.jsx';
import { Badge } from '../../../shared/components/ui/badge.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu.jsx';
import { Button } from '../../../shared/components/ui/button.jsx';
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog.jsx';

const ROLE_BADGE = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
};

export function MembersTable({ members, workspaceId }) {
  const { user } = useAuthStore();
  const { hasMinRole } = usePermission();
  const [removeTarget, setRemoveTarget] = useState(null);

  const { mutate: updateRole } = useUpdateMemberRole();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMember();

  const canManage = hasMinRole('admin');

  return (
    <div className="border rounded-lg divide-y">
      {members.map((member) => {
        const memberUser = member.userId;
        const isCurrentUser =
          (memberUser._id ?? memberUser.id) ===
          (user?.id ?? user?._id);
        const initials = memberUser.name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase() ?? '?';

        return (
          <div
            key={memberUser._id ?? memberUser.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={memberUser.avatar} alt={memberUser.name} />
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {memberUser.name}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {memberUser.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={ROLE_BADGE[member.role]}>{member.role}</Badge>

              {canManage && member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role === 'member' && (
                      <DropdownMenuItem
                        onClick={() =>
                          updateRole({
                            workspaceId,
                            memberId: memberUser._id,
                            role: 'admin',
                          })
                        }
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make admin
                      </DropdownMenuItem>
                    )}
                    {member.role === 'admin' && (
                      <DropdownMenuItem
                        onClick={() =>
                          updateRole({
                            workspaceId,
                            memberId: memberUser._id,
                            role: 'member',
                          })
                        }
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setRemoveTarget(member)}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove member"
        description={`Remove ${removeTarget?.userId?.name} from this workspace?`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={() =>
          removeMember(
            { workspaceId, memberId: removeTarget.userId._id },
            { onSuccess: () => setRemoveTarget(null) },
          )
        }
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
