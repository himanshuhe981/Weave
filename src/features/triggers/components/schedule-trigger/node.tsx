import { NodeProps } from "@xyflow/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { ScheduleTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchScheduleTriggerRealtimeToken } from "./actions";
import { SCHEDULE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/schedule-trigger";
import { useParams } from "next/navigation";

export const ScheduleTriggerNode = memo(
  (props: NodeProps) => {
    const [open, setOpen] = useState(false);

    const params = useParams();
    console.log("params:", params);
    const workflowId = params.workflowId as string;
    console.log("workflowId extracted:", workflowId);

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: SCHEDULE_TRIGGER_CHANNEL_NAME,
      topic: "status",
      refreshToken: fetchScheduleTriggerRealtimeToken,
    });

console.log("workflowId extracted:", workflowId);

    return (
      <>
        <ScheduleTriggerDialog
          open={open}
          onOpenChange={setOpen}
          nodeId={props.id}
          workflowId={workflowId}
          data={props.data}
        />

        <BaseTriggerNode
          {...props}
          icon="/logos/schedule.svg"
          name="Schedule"
          description="Run workflow on a schedule"
          status={nodeStatus}
          onSettings={() => setOpen(true)}
          onDoubleClick={() => setOpen(true)}
        />
      </>
    );
  }
);



ScheduleTriggerNode.displayName = "ScheduleTriggerNode";