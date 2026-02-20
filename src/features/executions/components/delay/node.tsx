"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { DelayDialog, DelayFormValues, DelayUnit } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchDelayRealtimeToken } from "./actions";
import { DELAY_CHANNEL_NAME } from "@/inngest/channels/delay";

type DelayNodeData = {
  amount?: string;
  unit?: DelayUnit;
  jitter?: boolean;
};

type DelayNodeType = Node<DelayNodeData>;

export const DelayNode = memo((props: NodeProps<DelayNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: DELAY_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDelayRealtimeToken,
  });

  const handleSubmit = (values: DelayFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node
      )
    );
  };

  const description = props.data?.amount
    ? `Wait ${props.data.amount} ${props.data.unit}`
    : "Not configured";

  return (
    <>
      <DelayDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/delay.svg"
        name="Delay"
        status={status}
        description={description}
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
});

DelayNode.displayName = "DelayNode";