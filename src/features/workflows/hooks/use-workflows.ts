


/**
 * hook to fetch all workflows using suspense
 */

import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

export const useSuspenseWorkflows = () => {
    const trpc = useTRPC();
    const [params] = useWorkflowsParams();

    return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));

};

export const useWorkflowUsage = () => {
    const trpc = useTRPC();
    return useQuery(trpc.workflows.getUsage.queryOptions());
};

/**
 * Hook to create a new workflow
 */

export const useCreateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.create.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" created `);
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                );
                queryClient.invalidateQueries(
                    trpc.workflows.getUsage.queryOptions(),
                );
            },
            onError: (error) => {
                toast.error(`Failed to create workflow: ${error.message}`);

            },
        }),
    );
};

/**
 * Hook to deploy a demo workflow
 */
export const useDeployDemo = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const router = useRouter();

    return useMutation(
        trpc.workflows.deployDemo.mutationOptions({
            onSuccess: (data) => {
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                );
                queryClient.invalidateQueries(
                    trpc.workflows.getUsage.queryOptions(),
                );
                // Redirect to editor with ?demo=<type> so the setup panel opens
                router.push(`/workflows/${data.id}?demo=${data.demoType}`);
            },
            onError: (error) => {
                toast.error(`Failed to deploy demo: ${error.message}`);
            },
        }),
    );
};

/**
 * Hook to remove a workflow
 */

export const useRemoveWorkflow = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.workflows.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" removed`);
                queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryFilter({ id: data.id}),
                );
                queryClient.invalidateQueries(
                    trpc.workflows.getUsage.queryOptions(),
                );
            }
        })
    )
}

/**
 *  hook to fetch a single workflow using suspense
 */

export const useSuspenseWorkflow = (id: string) => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
}

/**
 * Hook to update a workflow name
 */

export const useUpdateWorkflowName = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.updateName.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" updated `);
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                );

                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryOptions({ id: data.id }),
                );
            },
            onError: (error) => {
                toast.error(`Failed to update workflow: ${error.message}`);

            },
        }),
    );
};
/**
 * Hook to update a workflow 
 */

export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.update.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" Saved `);
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                );

                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryOptions({ id: data.id }),
                );
            },
            onError: (error) => {
                toast.error(`Failed to save workflow: ${error.message}`);

            },
        }),
    );
};
/**
 * Hook to execute a workflow 
 */

export const useExecuteWorkflow = () => {
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.execute.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" executed `);
                
            },
            onError: (error) => {
                toast.error(`Failed to execute workflow: ${error.message}`);

            },
        }),
    );
};
