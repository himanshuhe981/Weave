import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { memo } from "react";

export const ManualTriggerNode = memo((props: NodeProps) => {
    return (
        <>
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name="When clicking 'Execute workflow'"
            // status={nodeStatus}
            // onSettings={handleOpenSettings}
            // onDoubleClick={handleOpenSettings}
        /></>
    )
});