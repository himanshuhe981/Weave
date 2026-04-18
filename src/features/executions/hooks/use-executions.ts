import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/**
 * hook to fetch all Executions using suspense
 */
export const useSuspenseExecutions = () => {
    const trpc = useTRPC();
    const [params] = useExecutionsParams();

    return useSuspenseQuery({
        ...trpc.executions.getMany.queryOptions(params),
        refetchInterval: (query) => {
            const items = query.state.data?.items;
            if (!items) return false;
            const hasRunning = items.some((item: any) => item.status === "RUNNING");
            return hasRunning ? 2000 : false;
        }
    });
};

/**
 * hook to fetch a single Execution using suspense
 */
export const useSuspenseExecution = (id: string) => {
    const trpc = useTRPC();
    return useSuspenseQuery({
        ...trpc.executions.getOne.queryOptions({ id }),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "RUNNING" ? 2000 : false;
        }
    });
};

/** Delete a single execution and refresh the list */
export const useDeleteExecution = () => {
    const trpc        = useTRPC();
    const queryClient = useQueryClient();
    return useMutation(
        trpc.executions.deleteOne.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.executions.getMany.queryKey() });
            },
        })
    );
};

/** Delete ALL executions and refresh the list */
export const useDeleteAllExecutions = () => {
    const trpc        = useTRPC();
    const queryClient = useQueryClient();
    return useMutation(
        trpc.executions.deleteAll.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.executions.getMany.queryKey() });
            },
        })
    );
};