import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { conditionChannel } from "@/inngest/channels/condition";

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

type ConditionData = {
  variableName?: string;
  combinator?: "AND" | "OR";
  rules?: Rule[];
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
    try {
      await publish(
        conditionChannel().status({
          nodeId,
          status: "loading",
        })
      );

      if (!data.variableName || !data.rules?.length) {
        throw new NonRetriableError("Condition node misconfigured");
      }

      const results = data.rules.map((rule) => {
        const leftValue = getValueFromPath(context, rule.left);

        if (rule.right === undefined) {
          throw new NonRetriableError(
            `Right value missing for rule: ${rule.left}`
          );
        }

        const rightValue = rule.right;

        switch (rule.operator) {
          case "equals":
            return String(leftValue) === String(rightValue);

          case "not_equals":
            return String(leftValue) !== String(rightValue);

          case "contains":
            return String(leftValue).includes(String(rightValue));

          case "greater_than":
            return Number(leftValue) > Number(rightValue);

          case "less_than":
            return Number(leftValue) < Number(rightValue);

          default:
            throw new NonRetriableError("Invalid condition operator");
        }
      });

      const passed =
        data.combinator === "OR"
          ? results.some(Boolean)
          : results.every(Boolean);

      await publish(
        conditionChannel().status({
          nodeId,
          status: "success", // FALSE is NOT error
        })
      );

      return {
        ...context,
        __branch: passed ? "true" : "false",
        [data.variableName]: { passed },
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