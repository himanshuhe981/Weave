"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebhookTriggerDialog = ({
  open,
  onOpenChange,
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const webhookUrl = `${baseUrl}/api/webhooks/${workflowId}`;

  const curlExample = `curl -X POST ${webhookUrl}
-H "Content-Type: application/json"
-d '{"email":"test@example.com"}'`;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">

        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold">
            Webhook Trigger
          </DialogTitle>
          <DialogDescription className="text-base">
            Send a POST request to this endpoint to trigger your workflow.
          </DialogDescription>
        </DialogHeader>

        {/* Main Grid */}
        <div className="mt-6 grid gap-8 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* URL */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Webhook URL
              </p>

              <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
                <span className="font-mono text-sm break-all">
                  {webhookUrl}
                </span>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copy(webhookUrl, "URL")}
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* How to Use */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                How it works
              </h3>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Send a POST request to the webhook URL</li>
                <li>• Include JSON in the request body</li>
                <li>• Workflow runs automatically</li>
              </ul>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* Example */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Example Request
              </h3>

              <div className="rounded-lg border bg-muted/40 p-4 overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
{curlExample}
                </pre>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => copy(curlExample, "cURL command")}
              >
                Copy cURL
              </Button>
            </div>

            {/* Variables */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Available Variables
              </h3>

              <div className="space-y-2">
                <code className="block rounded-md bg-muted/40 px-3 py-2 text-sm">
                  {"{{webhook.body}}"}
                </code>
                <code className="block rounded-md bg-muted/40 px-3 py-2 text-sm">
                  {"{{webhook.headers}}"}
                </code>
                <code className="block rounded-md bg-muted/40 px-3 py-2 text-sm">
                  {"{{webhook.query}}"}
                </code>
                <code className="block rounded-md bg-muted/40 px-3 py-2 text-sm">
                  {"{{json webhook.body}}"}
                </code>
              </div>
            </div>

          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};