"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, useState, type ReactNode } from "react";
import { BaseNode } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { type NodeStatus, NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";

interface BaseTriggerNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        children,
        status = "initial",
        onSettings,
        onDoubleClick,
    }: BaseTriggerNodeProps) => {
        const { setNodes, setEdges } = useReactFlow();
        // Track hover so the "double-click to configure" hint only shows on hover
        const [isHovered, setIsHovered] = useState(false);

        const handleDelete = () => {
            setNodes((ns) => ns.filter((n) => n.id !== id));
            setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
        };

        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={handleDelete}
                onSettings={onSettings}
                // Show hint only while hovered AND this node has a settings handler
                showHint={isHovered && !!onDoubleClick}
            >
                <NodeStatusIndicator status={status} variant="border">
                    <BaseNode
                        status={status}
                        onDoubleClick={onDoubleClick}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Icon absolutely centred in the 56px squircle */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {typeof Icon === "string" ? (
                                <Image src={Icon} alt={name} width={18} height={18} className="object-contain" />
                            ) : (
                                <Icon className="size-[18px] text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                            )}
                        </div>

                        {children}

                        {/* Source nail — thread originates here */}
                        <BaseHandle id="source-1" type="source" position={Position.Right} />
                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>
        );
    },
);

BaseTriggerNode.displayName = "BaseTriggerNode";
