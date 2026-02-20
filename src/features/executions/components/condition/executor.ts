import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { conditionChannel } from "@/inngest/channels/condition";

type ConditionRule = {
  left: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
  right?: string;
};

type ConditionData = {
  variableName?: string;
  combinator?: "AND" | "OR";
  rules?: ConditionRule[];
};

function getValueFromPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return acc[key];
    }
    return undefined;
  }, obj);
}

export const conditionExecutor: NodeExecutor<ConditionData> =
  async ({ data, nodeId, context, publish }) => {
    await publish(
      conditionChannel().status({
        nodeId,
        status: "loading",
      })
    );

    try {
      if (
        !data.variableName ||
        !data.rules ||
        data.rules.length === 0
      ) {
        throw new NonRetriableError(
          "Condition node misconfigured"
        );
      }

      const results = data.rules.map((rule) => {
        const leftValue = getValueFromPath(context, rule.left);
        const rightValue = rule.right;

        switch (rule.operator) {
          case "equals":
            return String(leftValue) === String(rightValue);

          case "not_equals":
            return String(leftValue) !== String(rightValue);

          case "contains":
            return String(leftValue).includes(
              String(rightValue)
            );

          case "greater_than":
            return Number(leftValue) > Number(rightValue);

          case "less_than":
            return Number(leftValue) < Number(rightValue);

          default:
            return false;
        }
      });

      const passed =
        data.combinator === "OR"
          ? results.some(Boolean)
          : results.every(Boolean); // default AND

      await publish(
        conditionChannel().status({
          nodeId,
          status: passed ? "success" : "error",
        })
      );

      return {
        ...context,
        __branch: passed ? "true" : "false",
        [data.variableName]: {
          passed,
        },
      };
    } catch (error) {
      await publish(
        conditionChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw error;
    }
  };
