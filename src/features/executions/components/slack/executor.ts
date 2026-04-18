import type { NodeExecutor } from "@/features/executions/types" 
import { NonRetriableError } from "inngest";
import { decode } from "html-entities"
import Handlebars from "handlebars";
import { slackChannel } from "@/inngest/channels/slack";
import ky from "ky";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

 
Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context,null,2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
});

type SlackData = {
    variableName?: string;
    credentialId?: string;
    webhookUrl?: string;
    content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = 
async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {

   await publish(
    slackChannel().status({
        nodeId,
        status: "loading"
    }),
   );

   
   
   if (!data.content){
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Slack node: Message content is  required");
   }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

 
try {
    const result = await step.run("slack-webhook", async () => {
        let targetUrl = data.webhookUrl;

        // Decrypt credential if credentialId is present
        if (data.credentialId) {
            const credential = await prisma.credential.findUnique({
                where: {
                    id: data.credentialId,
                    userId,
                }
            });
            if (!credential) {
                await publish(
                    slackChannel().status({
                        nodeId,
                        status: "error",
                    })
                );
                throw new NonRetriableError("Slack node: Credential not found");
            }
            targetUrl = decrypt(credential.value);
        }

        if (!targetUrl) {
            await publish(
                slackChannel().status({
                    nodeId,
                    status: "error",
                })
            );
            throw new NonRetriableError("Slack node: Webhook URL or Credential is required");
        }

        await ky.post(targetUrl, {
            json: {
                content: content, // The Key depends on workflow config
            },
        });

        if (!data.variableName){
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw new NonRetriableError("Slack node: Variable name is missing");
   }

        return  {
            ...context,
            [data.variableName]: {
                messageContent: content.slice(0,2000),
            },
        }

    });  

        await publish(
            slackChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return result;

} catch (error) {
    await publish(
        slackChannel().status({
            nodeId,
            status: "error",
        }),
    );
    throw error;
}

};