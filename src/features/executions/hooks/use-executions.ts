// import { useTRPC } from "@/trpc/client"
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { useExecutionsParams } from "./use-executions-params";


// /**
//  * hook to fetch all Executions using suspense
//  */

// export const useSuspenseExecutions = () => {
//     const trpc = useTRPC();
//     const [params] = useExecutionsParams();

//     return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));

// };

// /**
//  *  hook to fetch a single Execution using suspense
//  */

// export const useSuspenseExecution = (id: string) => {
//     const trpc = useTRPC();
//     return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
// };

// ------------------ //Ai recommended solution to get exact status of workflow faster --------------


import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/**
 * hook to fetch all Executions using suspense
 */
export const useSuspenseExecutions = () => {
    const trpc = useTRPC();
    const [params] = useExecutionsParams();

    return useSuspenseQuery({
        ...trpc.executions.getMany.queryOptions(params),
        // SMART POLLING: Only poll if at least one item is still RUNNING
        refetchInterval: (query) => {
            const items = query.state.data?.items;
            if (!items) return false;
            
            const hasRunning = items.some((item: any) => item.status === "RUNNING");
            return hasRunning ? 2000 : false; // 2 seconds if running, OFF if finished
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
        // SMART POLLING: Only poll if THIS specific item is RUNNING
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "RUNNING" ? 2000 : false;
        }
    });
};