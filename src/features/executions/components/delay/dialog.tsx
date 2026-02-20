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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";

const formSchema = z.object({
  amount: z.string().min(1, "Delay amount required"),
  unit: z.enum(["minutes", "hours", "days", "milliseconds"]),
  jitter: z.boolean(),
});

export type DelayFormValues = z.infer<typeof formSchema>;

export type DelayUnit =
  | "minutes"
  | "hours"
  | "days"
  | "milliseconds";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DelayFormValues) => void;
  defaultValues?: Partial<DelayFormValues>;
}

export const DelayDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<DelayFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: defaultValues.amount || "5",
      unit: defaultValues.unit || "minutes",
      jitter: defaultValues.jitter ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: defaultValues.amount || "5",
        unit: defaultValues.unit || "minutes",
        jitter: defaultValues.jitter ?? false,
      });
    }
  }, [open, defaultValues, form]);

  const amount = form.watch("amount");
  const unit = form.watch("unit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Delay</DialogTitle>
          <DialogDescription>
            Pause workflow execution for a specified time.
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="5 or {{user.waitTime}}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Supports dynamic variables using {"{{}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="milliseconds">Milliseconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jitter"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <FormLabel>Enable Jitter</FormLabel>
                    <FormDescription>
                      Adds small random variation to delay.
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

            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              Workflow will wait approximately {amount} {unit}
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};