import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
} from '../hooks/useTaskQueries.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '../../../shared/components/ui/dialog.jsx';
import { Button } from '../../../shared/components/ui/button.jsx';
import { Input } from '../../../shared/components/ui/input.jsx';
import { Textarea } from '../../../shared/components/ui/textarea.jsx';
import { Badge } from '../../../shared/components/ui/badge.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/components/ui/select.jsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../shared/components/ui/avatar.jsx';
import { Separator } from '../../../shared/components/ui/separator.jsx';
import { PriorityIcon } from './PriorityIcon.jsx';
import { usePermission } from '../../../core/hooks/usePermission.js';
import { formatDate } from '../../../shared/utils/date.js';
import {
  STATUSES,
  PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '../constants/taskConstants.js';

export function TaskModal({
  workspaceId,
  projectId,
  taskId,
  open,
  onClose,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const { data: task, isLoading } = useTask(workspaceId, taskId);
  const { mutate: update } = useUpdateTask(workspaceId, projectId);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(
    workspaceId,
    projectId,
  );
  const { hasMinRole } = usePermission();

  function handleUpdate(data) {
    update({ workspaceId, taskId, data });
  }

  function handleTitleSave() {
    if (titleValue.trim() && titleValue !== task?.title) {
      handleUpdate({ title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  }

  function handleDelete() {
    deleteTask({ workspaceId, taskId }, { onSuccess: onClose });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : task ? (
          <>
            <DialogHeader className="space-y-3 pr-8">
              {isEditingTitle ? (
                <Input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                />
              ) : (
                <h2
                  className="text-lg font-semibold cursor-text hover:bg-muted px-1 -mx-1 rounded transition-colors"
                  onClick={() => {
                    setTitleValue(task.title);
                    setIsEditingTitle(true);
                  }}
                >
                  {task.title}
                </h2>
              )}

              {task.epicId && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: task.epicId.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {task.epicId.title}
                  </span>
                </div>
              )}
            </DialogHeader>

            <div className="grid grid-cols-[1fr_200px] gap-6 mt-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Description
                  </p>
                  <Textarea
                    defaultValue={task.description}
                    placeholder="Add a description..."
                    rows={4}
                    className="text-sm resize-none"
                    onBlur={(e) => {
                      if (e.target.value !== task.description) {
                        handleUpdate({ description: e.target.value });
                      }
                    }}
                  />
                </div>

                {task.labels?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Labels
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.labels.map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Status
                  </p>
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleUpdate({ status: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Priority
                  </p>
                  <Select
                    value={task.priority}
                    onValueChange={(v) => handleUpdate({ priority: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <PriorityIcon priority={p} size="xs" />
                            <span>{PRIORITY_LABELS[p]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Assignees
                  </p>
                  {task.assignees?.length ? (
                    <div className="flex flex-col gap-1.5">
                      {task.assignees.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-1.5"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {user.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">
                            {user.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Unassigned
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Due date
                  </p>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    defaultValue={
                      task.dueDate
                        ? new Date(task.dueDate)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      handleUpdate({
                        dueDate: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Created by {task.createdBy?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {hasMinRole('member') && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete task
                </Button>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
