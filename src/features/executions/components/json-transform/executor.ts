import type { NodeExecutor } from "@/features/executions/types";
import { jsonTransformChannel } from "@/inngest/channels/json-transform";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

type JsonTransformData = {
  variableName?: string;
  template?: string;
  strict?: boolean;
};

Handlebars.registerHelper("json", (context) =>
  new Handlebars.SafeString(JSON.stringify(context, null, 2))
);

export const jsonTransformExecutor: NodeExecutor<JsonTransformData> =
  async ({ data, nodeId, context, publish }) => {

    await publish(
      jsonTransformChannel().status({ nodeId, status: "loading" })
    );

    if (!data.variableName || !data.template) {
      await publish(
        jsonTransformChannel().status({ nodeId, status: "error" })
      );
      throw new NonRetriableError("JSON Transform node misconfigured");
    }

    try {
      const compiled = Handlebars.compile(data.template,{
        strict: data.strict ?? true,
      });
      const resultString = compiled(context);

      let result: unknown;

      try {
        result = JSON.parse(resultString);
      } catch {
        throw new NonRetriableError(
          `JSON Transform produced invalid JSON:\n${resultString}`
        );
      }

      await publish(
        jsonTransformChannel().status({ nodeId, status: "success" })
      );

      return {
        ...context,
        [data.variableName]: result,
      };

    } catch (error) {
      await publish(
        jsonTransformChannel().status({ nodeId, status: "error" })
      );
      throw error;
    }
  };