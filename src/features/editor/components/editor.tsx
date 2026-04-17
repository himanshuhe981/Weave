"use client"
import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge,
    type Node, 
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    Background,
    Controls,
    MiniMap,
    Panel

} from '@xyflow/react';
import '@xyflow/react/dist/style.css'
import { ErrorView, LoadingView } from "@/components/entity-components"
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { nodeComponents } from '@/config/node-components';
import { AddNodeButton } from './add-node-button';
import { useSetAtom } from 'jotai';
import { editorAtom } from '../store/atoms';
import { NodeType } from '@prisma/client';
import { ExecuteWorkflowButton } from './execute-workflow-button';
import { DemoSetupPanel } from './demo-setup-panel';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export const EditorLoading = () => {
    return <LoadingView message="Loading editor..."/>;
};

export const EditorError = () => {
    return <ErrorView message="Error Loading Editor"/>;
};


export const Editor = ({
    workflowId,
    demoType,
}: {
    workflowId: string;
    demoType?: "summarizer" | "triage";
}) => {
    const {data: workflow } = useSuspenseWorkflow(workflowId);

    const setEditor = useSetAtom(editorAtom);

    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.edges);
    // Auto-open on first load if it's a demo; user can close and reopen via button
    const [showDemoPanel, setShowDemoPanel] = useState(!!demoType);

    const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  },[nodes]);

    return (
        <div className='size-full relative'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                onInit={setEditor}
                fitView
                snapGrid={[10,10]}
                snapToGrid
                panOnScroll
                panOnDrag={true}
                deleteKeyCode={['Backspace', 'Delete']}
                proOptions={{
                    hideAttribution: true,
                }}
            >
                <Background/>
                <Controls/>
                <MiniMap/>
                <Panel position="top-right">
                    <AddNodeButton/>
                </Panel>
                {hasManualTrigger && (
                    <Panel position="bottom-center">
                        <ExecuteWorkflowButton workflowId={workflowId}/>
                    </Panel>
                )}
            </ReactFlow>

            {/* Demo setup panel — absolutely positioned outside the flow canvas to avoid pointer conflicts */}
            <AnimatePresence>
                {demoType && showDemoPanel && (
                    <DemoSetupPanel
                        workflowId={workflowId}
                        demoType={demoType}
                        onClose={() => setShowDemoPanel(false)}
                    />
                )}
            </AnimatePresence>

            {/* Persistent "reopen" button — only visible when panel is closed and this is a demo */}
            <AnimatePresence>
                {demoType && !showDemoPanel && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        onClick={() => setShowDemoPanel(true)}
                        className="
                            absolute top-3 right-3 z-50
                            flex items-center gap-2 px-3 py-2
                            bg-background/90 backdrop-blur-sm
                            border border-border/70 rounded-lg shadow-md
                            text-sm font-medium text-foreground
                            hover:bg-muted/80 transition-colors
                        "
                    >
                        <BookOpen className="size-4 text-primary" />
                        Setup Guide
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}