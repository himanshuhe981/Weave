"use client"
import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import type { Execution } from "@/generated/prisma/client";
// import  { Executionstatus } from "@/generated/prisma/client"; // --
import { formatDistanceToNow } from "date-fns";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";


export const ExecutionsList = () => {
    
    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionItem data={execution} />}
            emptyView={<ExecutionsEmpty/>}
        />
    );

};

export const ExecutionsHeader = () => {
    return (
            <EntityHeader 
              title="Executions"
              description="View your workflow execution history"
            />
    );
};

export const ExecutionsPagination = () => {
    const executions= useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({...params, page})}
        />
    );
};

export const ExecutionsContainer = ({
    children
}:{
    children: React.ReactNode
}) => {
    return (
        <EntityContainer

            header={<ExecutionsHeader/>}
            pagination={<ExecutionsPagination/>}
        >
            {children}
        </EntityContainer>

    );
};

export const ExecutionsLoading = () => {
    return <LoadingView message="Loading Executions..."/>
};

export const ExecutionsError = () => {
    return <ErrorView message="Error Loading Executions"/>;
};

export const ExecutionsEmpty = () => {

    const router = useRouter();
    return (
            <EmptyView
                message="You haven't executed  any workflows yet. get started by running your first workflow"
            />
    );
};

const Executionstatus = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    RUNNING: "RUNNING",
} as const;

// const getStatusIcon = (status: Executionstatus) => {
const getStatusIcon = (status: Execution["status"]) => {
    switch (status) {
        case Executionstatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600 "/>;
        case Executionstatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600 "/>;
        case Executionstatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin "/>;
       default :
            return <ClockIcon className="size-5 text-muted-foreground "/>;

    }
}

const formatStatus = (status: Execution["status"]) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
    data,
}: {
    data: Execution & {
        workflow: {
            id: string;
            name: string;
        };
    };
}) => {

    const duration = data.completedAt
        ? Math.round(
            (new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000, 
        )
        : null;

        const subtitle = (
            <>
                {data.workflow.name} &bull; Started{" "}
                {formatDistanceToNow(data.startedAt, {addSuffix: true})}
                {duration !== null && <> &bull; Took {duration}s </> }
            </>
        )

    return (
        <EntityItem 
            href={`/executions/${data.id}`}
            title={formatStatus(data.status)}
            subtitle={subtitle}
            image={
                <div className="size-8 flex items-center justify-center">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    )
}