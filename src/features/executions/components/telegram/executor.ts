import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { telegramChannel } from "@/inngest/channels/telegram";
import prisma from "@/lib/db";
import Cryptr from "cryptr";
import ky from "ky";

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set");
}

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);


type TelegramData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  content?: string;
};

export const telegramExecutor: NodeExecutor<TelegramData> =
  async ({ data, nodeId, context, step, publish, userId }) => {

    if (!data.credentialId || !data.chatId || !data.content) {
      await publish(
        telegramChannel().status({ nodeId, status: "error" })
      );
      throw new NonRetriableError("Missing required Telegram fields");
    }

    await publish(
      telegramChannel().status({ nodeId, status: "loading" })
    );

    try {
      const result = await step.run("telegram-send", async () => {

        const credential = await prisma.credential.findUniqueOrThrow({
          where: {
            id: data.credentialId,
            userId,
          },
        });

        if (credential.type !== "TELEGRAM") {
          throw new NonRetriableError("Invalid credential type");
        }

        const botToken = cryptr.decrypt(credential.value);

        const rawContent = Handlebars.compile(data.content!)(context);
        const content = decode(rawContent);

        await ky.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            json: {
              chat_id: data.chatId,
              text: content.slice(0, 4096),
            },
          }
        );

        return {
          ...context,
          [data.variableName || "telegram"]: {
            messageContent: content,
          },
        };
      });

      await publish(
        telegramChannel().status({ nodeId, status: "success" })
      );

      return result;

    } catch (error) {
      await publish(
        telegramChannel().status({ nodeId, status: "error" })
      );

      throw error;
    }
  };

