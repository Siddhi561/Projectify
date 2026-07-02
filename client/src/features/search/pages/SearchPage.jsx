import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../../../core/store/workspaceStore.js';
import { usePaginatedSearch } from '../hooks/useSearch.js';
import { useDebounce } from '../../../shared/hooks/useDebounce.js';
import { Input } from '../../../shared/components/ui/input.jsx';
import { PageShell } from '../../../shared/components/layout/PageShell.jsx';
import { SearchResultCard } from '../components/SearchResultCard.jsx';
import { EmptyState } from '../../../shared/components/feedback/EmptyState.jsx';
import { Button } from '../../../shared/components/ui/button.jsx';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id ?? currentWorkspace?._id;

  const debouncedQuery = useDebounce(query, 350);

  const { data, isLoading, isFetching } = usePaginatedSearch(
    workspaceId,
    debouncedQuery,
    page,
  );

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  return (
    <PageShell title="Search">
      <div className="max-w-2xl space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search tasks by title or description..."
            value={query}
            onChange={handleQueryChange}
            className="pl-9 h-10"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {!debouncedQuery ? (
          <p className="text-sm text-muted-foreground">
            Type at least 2 characters to search
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : !tasks.length ? (
          <EmptyState
            title="No results"
            description={`No tasks matched "${debouncedQuery}"`}
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {pagination?.total ?? 0} result
              {pagination?.total !== 1 ? 's' : ''} for &quot;
              {debouncedQuery}&quot;
            </p>

            <div className="space-y-2">
              {tasks.map((task) => (
                <SearchResultCard
                  key={task._id}
                  task={task}
                  workspaceId={workspaceId}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage || isFetching}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || isFetching}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
