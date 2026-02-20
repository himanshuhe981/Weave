"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1)
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
  template: z.string().min(1, "Transformation template is required"),
  strict: z.boolean(),
});

export type JsonTransformFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: JsonTransformFormValues) => void;
  defaultValues?: Partial<JsonTransformFormValues>;
}

export const JsonTransformDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<JsonTransformFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      template: defaultValues.template || "",
      strict: defaultValues.strict ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        template: defaultValues.template || "",
        strict: defaultValues.strict ?? true,
      });
    }
  }, [open, defaultValues, form]);

  const watchVariable = form.watch("variableName") || "myTransform";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>JSON Transform</DialogTitle>
          <DialogDescription>
            Transform context data using Handlebars templates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              onSubmit(values);
              onOpenChange(false);
            })}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="transformedData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Accessible as: {`{{${watchVariable}}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transformation Template</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[200px] font-mono text-sm"
                      placeholder={`{
  "name": "{{user.name}}",
  "email": "{{user.email}}"
}`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {"{{variables}}"} or {"{{json object}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
  control={form.control}
  name="strict"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel>Strict Mode</FormLabel>
        <FormDescription>
          Fail execution if a variable is missing.
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};