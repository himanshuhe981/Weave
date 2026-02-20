"use client"
import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { useCallback } from "react";
import {
     Sheet,
     SheetContent,
     SheetDescription,
     SheetHeader,
     SheetTitle,
     SheetTrigger,    
} from "./ui/sheet";
import { NodeType } from "@prisma/client";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{className?: string}> | string;
};

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Runs the flow on clicking a button. Good for getting started quickly ",
        icon: MousePointerIcon,
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form",
        description: "Runs the flow when a Google Form is submitted",
        icon: "/logos/googleform.svg",
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe Event",
        description: "Runs the flow when a Stripe Event is captured",
        icon: "/logos/stripe.svg",
    },
];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Makes an Http request",
        icon: GlobeIcon,
    },
    {
        type: NodeType.GEMINI,
        label:"Gemini",
        description:"Uses Google Gemini to generate text",
        icon:"/logos/gemini.svg",
    },
    {
        type: NodeType.OPENAI,
        label:"OpenAI",
        description:"Uses OpenAi generate text",
        icon:"/logos/openai.svg",
    },
    {
        type: NodeType.ANTHROPIC,
        label:"Anthropic",
        description:"Uses Anthropic generate text",
        icon:"/logos/anthropic.svg",
    },
    {
        type: NodeType.DISCORD,
        label:"Discord",
        description:"Send a message to Discord",
        icon:"/logos/discord.svg",
    },
    {
        type: NodeType.SLACK,
        label:"Slack",
        description:"Send a message to Slack",
        icon:"/logos/slack.svg",
    },
    {
        type: NodeType.TELEGRAM,
        label: "Telegram",
        description: "Send a message to Telegram",
        icon: "/logos/telegram.svg",
    },
    {
        type: NodeType.CONDITION,
        label: "IF Condition",
        description: "Branch workflow based on condition",
        icon: "/logos/condition.svg",
    },
     {
        type: NodeType.JSON_TRANSFORM,
        label: "JSON Transform",
        description: "Transform and reshape JSON data using templates",
        icon: "/logos/json.svg",
    },


];

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function NodeSelector({
    open,
    onOpenChange,
    children
}: NodeSelectorProps) {
    const {setNodes, getNodes, screenToFlowPosition } = useReactFlow();

    const handleNodesSelect = useCallback((selection: NodeTypeOption) => {
        // Check if trying to add a manual trigger when one allready exists
        if (selection.type === NodeType.MANUAL_TRIGGER){
            const nodes = getNodes();
            const hasManualTrigger = nodes.some(
                    (node) => node.type === NodeType.MANUAL_TRIGGER,         
            );

            if(hasManualTrigger){
                toast.error("Only one trigger is allowed per workflow");
                return;
            }

        }

        setNodes((nodes) => {
            const hasInitialTrigger = nodes.some(
                (node) => node.type === NodeType.INITIAL,
            );
            
            const centerX = window.innerWidth/2;
            const centerY = window.innerHeight/2;

            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 0.5) * 200,
                y: centerY + (Math.random() - 0.5) * 200,
            });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type,
            };

            if (hasInitialTrigger){
                return [newNode];
            }

            return [...nodes, newNode];
        });

        onOpenChange(false);

    },[
        setNodes,
        getNodes,
        onOpenChange,
        screenToFlowPosition,
    ]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            What triggers this workflow?
                        </SheetTitle>
                        <SheetDescription>
                            A trigger is step that starts your workflow.
                        </SheetDescription>
                    </SheetHeader>
                    <div>
                        {triggerNodes.map((nodeType) => {
                            const Icon = nodeType.icon;
                            return (
                                <div key={nodeType.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() =>handleNodesSelect(nodeType) }
                                >
                                    <div className="flex items-center gap-6 w-full overflow-hidden">
                                        {typeof Icon === "string" ? (
                                            <img
                                                src={Icon}
                                                alt={nodeType.label}
                                                className="size-5 object-contain rounded-sm"
                                            />
                                        ) : ( <Icon className="size-5"/>
                                        )}
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium text-sm">
                                                {nodeType.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {nodeType.description}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <Separator/>
                    <div>
                        {executionNodes.map((nodeType) => {
                            const Icon = nodeType.icon;
                            return (
                                <div key={nodeType.type}
                                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() =>handleNodesSelect(nodeType)}
                                >
                                    <div className="flex items-center gap-6 w-full overflow-hidden">
                                        {typeof Icon === "string" ? (
                                            <img
                                                src={Icon}
                                                alt={nodeType.label}
                                                className="size-5 object-contain rounded-sm"
                                            />
                                        ) : ( <Icon className="size-5"/>
                                        )}
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium text-sm">
                                                {nodeType.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {nodeType.description}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </SheetContent>
            
        </Sheet>
    )
}
