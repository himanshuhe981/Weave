"use client";

import { Node, NodeProps, useReactFlow, Handle, Position } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { ConditionDialog, ConditionFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchConditionRealtimeToken } from "./actions";
import { CONDITION_CHANNEL_NAME } from "@/inngest/channels/condition";

/* -------------------- Types -------------------- */

type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than";

type Rule = {
  left: string;
  operator: ConditionOperator;
  right?: string;
};

type ConditionNodeData = {
  variableName?: string;
  combinator?: "AND" | "OR";
  rules?: Rule[];
};

type ConditionNodeType = Node<ConditionNodeData>;

/* -------------------- Component -------------------- */

export const ConditionNode = memo(
  (props: NodeProps<ConditionNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: CONDITION_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchConditionRealtimeToken,
    });

    const handleSubmit = (values: ConditionFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? { ...node, data: { ...node.data, ...values } }
            : node
        )
      );
    };

    const nodeData = props.data;

    /* ---------- Configuration Check ---------- */

    const isConfigured =
      nodeData?.rules &&
      Array.isArray(nodeData.rules) &&
      nodeData.rules.length > 0 &&
      nodeData.rules.every(
        (rule) => rule.left && rule.operator
      );

    /* ---------- Description ---------- */

    const description = isConfigured
      ? `${nodeData.rules!.length} rule(s) • ${
          nodeData.combinator || "AND"
        }`
      : "Not configured";

    return (
      <>
        <ConditionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <div className="relative">
          {/* Input Handle */}
          <Handle type="target" id="target-1" position={Position.Left} />

          {/* TRUE Handle */}
          <Handle
            type="source"
            id="true"
            position={Position.Right}
            style={{ top: "30%", background: "#16a34a" }}
          />

          {/* FALSE Handle */}
          <Handle
            type="source"
            id="false"
            position={Position.Right}
            style={{ top: "70%", background: "#dc2626" }}
          />

          <BaseExecutionNode
            {...props}
            hideHandles
            id={props.id}
            icon="/logos/condition.svg"
            name="Condition"
            status={nodeStatus}
            description={description}
            onSettings={() => setDialogOpen(true)}
            onDoubleClick={() => setDialogOpen(true)}
          />
        </div>
      </>
    );
  }
);

ConditionNode.displayName = "ConditionNode";