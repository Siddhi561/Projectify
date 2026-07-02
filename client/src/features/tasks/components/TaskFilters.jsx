import { X } from 'lucide-react';
import { useWorkspace } from '../../workspace/hooks/useWorkspaceQueries.js';
import { Button } from '../../../shared/components/ui/button.jsx';
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
import { PRIORITIES } from '../constants/taskConstants.js';

export function TaskFilters({
  workspaceId,
  filters,
  onChange,
  onClear,
  hasFilters,
}) {
  const { data: workspace } = useWorkspace(workspaceId);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={filters.priority ?? 'all'}
        onValueChange={(v) =>
          onChange('priority', v === 'all' ? undefined : v)
        }
      >
        <SelectTrigger className="h-7 text-xs w-32">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p} className="text-xs capitalize">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assignee ?? 'all'}
        onValueChange={(v) =>
          onChange('assignee', v === 'all' ? undefined : v)
        }
      >
        <SelectTrigger className="h-7 text-xs w-36">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          {workspace?.members?.map((m) => (
            <SelectItem
              key={m.userId._id}
              value={m.userId._id}
              className="text-xs"
            >
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={m.userId.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {m.userId.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {m.userId.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={onClear}
        >
          <X className="h-3 w-3 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
