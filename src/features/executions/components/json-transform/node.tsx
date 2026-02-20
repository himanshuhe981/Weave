"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { JsonTransformDialog, JsonTransformFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchJsonTransformRealtimeToken } from "./actions";
import { JSON_TRANSFORM_CHANNEL_NAME } from "@/inngest/channels/json-transform";

type JsonTransformNodeData = {
  variableName?: string;
  template?: string;
  strict?: boolean;
};

type JsonTransformNodeType = Node<JsonTransformNodeData>;

export const JsonTransformNode = memo(
  (props: NodeProps<JsonTransformNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: JSON_TRANSFORM_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchJsonTransformRealtimeToken,
    });

    const handleSubmit = (values: JsonTransformFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? { ...node, data: { ...node.data, ...values } }
            : node
        )
      );
    };

    const description = props.data?.template
      ? props.data.template.slice(0, 50) + "..."
      : "Not configured";

    return (
      <>
        <JsonTransformDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={props.data}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/json.svg"
          name="JSON Transform"
          status={status}
          description={description}
          onSettings={() => setDialogOpen(true)}
          onDoubleClick={() => setDialogOpen(true)}
        />
      </>
    );
  }
);

JsonTransformNode.displayName = "JsonTransformNode";