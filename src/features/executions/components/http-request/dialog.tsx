"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, INPUT_CLS, MONO_INPUT_CLS, InfoBanner } from "@/components/node-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";
import { GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const METHOD_COLORS: Record<string, string> = {
    GET:    "text-emerald-600 dark:text-emerald-400",
    POST:   "text-blue-600   dark:text-blue-400",
    PUT:    "text-amber-600  dark:text-amber-400",
    PATCH:  "text-purple-600 dark:text-purple-400",
    DELETE: "text-red-600    dark:text-red-400",
};

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore",
    }),
    method: z.enum(METHODS),
    endpoint: z.string().min(1, "Endpoint URL is required"),
    body: z.string().optional(),
});

export type HttpRequestFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: HttpRequestFormValues) => void;
    defaultValues?: Partial<HttpRequestFormValues>;
}

export const HttpRequestDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<HttpRequestFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            method: defaultValues.method || "GET",
            endpoint: defaultValues.endpoint || "",
            body: defaultValues.body || "",
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            method: defaultValues.method || "GET",
            endpoint: defaultValues.endpoint || "",
            body: defaultValues.body || "",
        });
    }, [open, defaultValues, reset]);

    const varName       = watch("variableName") || "myApiCall";
    const method        = watch("method");
    const showBody      = ["POST", "PUT", "PATCH"].includes(method);

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={GlobeIcon}
            title="HTTP Request"
            subtitle="Call any external API and use the response in downstream nodes"
            badge="Action"
            formId="http-form"
            wide
        >
            <form id="http-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <DialogSection title="Request">
                            <FieldRow label="Output variable name" required error={errors.variableName?.message}>
                                <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myApiCall" />
                            </FieldRow>

                            <FieldRow label="Method & URL" required error={errors.endpoint?.message}>
                                <div className="flex gap-2">
                                    <Controller
                                        control={control}
                                        name="method"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[110px] shrink-0 font-mono text-sm font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {METHODS.map(m => (
                                                        <SelectItem key={m} value={m}>
                                                            <span className={cn("font-bold font-mono text-sm", METHOD_COLORS[m])}>{m}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <input
                                        {...register("endpoint")}
                                        className={cn(INPUT_CLS, "flex-1")}
                                        placeholder="https://api.example.com/data"
                                    />
                                </div>
                            </FieldRow>

                            <p className="text-[10px] text-zinc-400">
                                The URL supports <code className="font-mono">{"{{variables}}"}</code> — e.g. <code className="font-mono">{"https://api.example.com/users/{{webhook.body.id}}"}</code>
                            </p>
                        </DialogSection>

                        {showBody && (
                            <DialogSection title="Request Body" hint="JSON (POST/PUT/PATCH only)">
                                <FieldRow label="Body">
                                    <textarea
                                        {...register("body")}
                                        rows={6}
                                        className={MONO_INPUT_CLS}
                                        placeholder={'{\n  "userId": "{{webhook.body.id}}",\n  "summary": "{{myGemini.text}}"\n}'}
                                    />
                                </FieldRow>
                                <InfoBanner variant="tip">
                                    Use <code className="font-mono text-[10px]">{"{{json variableName}}"}</code> to embed a full object as a valid JSON value in the body.
                                </InfoBanner>
                            </DialogSection>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <DialogSection title="Output Variables" hint="click to copy">
                            <VarChip variable={`${varName}.body`} label="Full response body (parsed JSON or text)" />
                            <VarChip variable={`${varName}.body.fieldName`} label="Specific field from response JSON" description='e.g. myApiCall.body.id' />
                            <VarChip variable={`${varName}.status`} label="HTTP status code" description="200, 201, 404, 500…" />
                            <VarChip variable={`${varName}.ok`} label="true if status 200–299" />
                            <VarChip variable={`${varName}.headers`} label="Response headers" />
                            <VarChip variable={`json ${varName}.body`} label="Full body as JSON string" description="for AI prompts" />
                        </DialogSection>

                        <DialogSection title="Common Patterns">
                            <div className="space-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <p>• <strong>Fetch user data:</strong> GET then reference <code className="font-mono">{"{{myApiCall.body.name}}"}</code></p>
                                <p>• <strong>Create record:</strong> POST with body, check <code className="font-mono">{"{{myApiCall.ok}}"}</code></p>
                                <p>• <strong>Chain requests:</strong> Use output of one HTTP node as input to the next URL</p>
                                <p>• <strong>Auth headers:</strong> Add <code className="font-mono">Authorization: Bearer {"{{credential.token}}"}</code> (coming soon — use hardcoded for now)</p>
                            </div>
                        </DialogSection>

                        <InfoBanner variant="warning">
                            The response body is automatically parsed as JSON when the <code className="font-mono text-[10px]">Content-Type</code> is <code className="font-mono text-[10px]">application/json</code>. Otherwise it&apos;s a raw string.
                        </InfoBanner>
                    </div>
                </div>
            </form>
        </NodeDialog>
    );
};