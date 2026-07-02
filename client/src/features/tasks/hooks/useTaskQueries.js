import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService.js';
import { toast } from 'sonner';

export const taskKeys = {
  all: ['tasks'],
  grouped: (workspaceId, projectId, filters) => [
    ...taskKeys.all,
    'grouped',
    workspaceId,
    projectId,
    filters,
  ],
  detail: (workspaceId, taskId) => [
    ...taskKeys.all,
    'detail',
    workspaceId,
    taskId,
  ],
};

export function useGroupedTasks(workspaceId, projectId, filters = {}) {
  return useQuery({
    queryKey: taskKeys.grouped(workspaceId, projectId, filters),
    queryFn: () =>
      taskService.getGrouped({ workspaceId, projectId, filters }),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useTask(workspaceId, taskId) {
  return useQuery({
    queryKey: taskKeys.detail(workspaceId, taskId),
    queryFn: () => taskService.getById({ workspaceId, taskId }),
    enabled: !!workspaceId && !!taskId,
  });
}

export function useCreateTask(workspaceId, projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.create,
    onSuccess: (task) => {
      queryClient.setQueryData(
        taskKeys.grouped(workspaceId, projectId, {}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            [task.status]: [...(old[task.status] ?? []), task],
          };
        },
      );
      toast.success('Task created');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to create task',
      );
    },
  });
}

export function useUpdateTask(workspaceId, projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.update,
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.grouped(workspaceId, projectId, {}),
      });

      const previousTasks = queryClient.getQueryData(
        taskKeys.grouped(workspaceId, projectId, {}),
      );

      queryClient.setQueryData(
        taskKeys.grouped(workspaceId, projectId, {}),
        (old) => {
          if (!old) return old;
          const updated = { ...old };
          for (const status of Object.keys(updated)) {
            updated[status] = updated[status].map((t) =>
              t._id === taskId ? { ...t, ...data } : t,
            );
          }
          return updated;
        },
      );

      return { previousTasks };
    },
    onError: (error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          taskKeys.grouped(workspaceId, projectId, {}),
          context.previousTasks,
        );
      }
      toast.error(error.response?.data?.message ?? 'Update failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.grouped(workspaceId, projectId, {}),
      });
    },
  });
}

export function useDeleteTask(workspaceId, projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.delete,
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.grouped(workspaceId, projectId, {}),
      });

      const previousTasks = queryClient.getQueryData(
        taskKeys.grouped(workspaceId, projectId, {}),
      );

      queryClient.setQueryData(
        taskKeys.grouped(workspaceId, projectId, {}),
        (old) => {
          if (!old) return old;
          const updated = { ...old };
          for (const status of Object.keys(updated)) {
            updated[status] = updated[status].filter(
              (t) => t._id !== taskId,
            );
          }
          return updated;
        },
      );

      return { previousTasks };
    },
    onError: (error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          taskKeys.grouped(workspaceId, projectId, {}),
          context.previousTasks,
        );
      }
      toast.error(error.response?.data?.message ?? 'Delete failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.grouped(workspaceId, projectId, {}),
      });
    },
  });
}

export function useReorderTasks(workspaceId, projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.reorder,
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.grouped(workspaceId, projectId, {}),
      });
      toast.error('Failed to save order — reloading board');
    },
  });
}
