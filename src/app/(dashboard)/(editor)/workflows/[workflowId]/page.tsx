import { Editor, EditorError, EditorLoading } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        workflowId: string;
    }>;
    searchParams: Promise<{
        demo?: string;
    }>;
}

const Page = async ({ params, searchParams }: PageProps) => {
    await requireAuth();
    const { workflowId } = await params;
    const { demo } = await searchParams;

    prefetchWorkflow(workflowId);

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<EditorError />}>
                <Suspense fallback={<EditorLoading />}>
                    <div className="flex flex-col h-full w-full overflow-hidden">
                        <EditorHeader workflowId={workflowId} />
                        <main className="flex-1 min-h-0 overflow-hidden">
                            <Editor
                                workflowId={workflowId}
                                demoType={
                                    demo === "summarizer" || demo === "triage"
                                        ? demo
                                        : undefined
                                }
                            />
                        </main>
                    </div>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};

export default Page;