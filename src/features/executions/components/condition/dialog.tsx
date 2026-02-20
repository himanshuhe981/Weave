"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";


// ---------------- SCHEMA ----------------

const ruleSchema = z.object({
  left: z.string().min(1, "Left value required"),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "greater_than",
    "less_than",
  ]),
  right: z.string().optional(),
});

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Must start with a letter or underscore",
    }),
  combinator: z.enum(["AND", "OR"]),
  rules: z.array(ruleSchema).min(1),
});

export type ConditionFormValues =
  z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ConditionFormValues) => void;
  defaultValues?: Partial<ConditionFormValues>;
}

// ---------------- COMPONENT ----------------

export const ConditionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName:
        defaultValues.variableName ||
        "conditionResult",
      combinator:
        defaultValues.combinator || "AND",
      rules:
        defaultValues.rules || [
          {
            left: "",
            operator: "equals",
            right: "",
          },
        ],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName:
          defaultValues.variableName ||
          "conditionResult",
        combinator:
          defaultValues.combinator || "AND",
        rules:
          defaultValues.rules || [
            {
              left: "",
              operator: "equals",
              right: "",
            },
          ],
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName =
    form.watch("variableName") ||
    "conditionResult";

  const handleSubmit = (
    values: ConditionFormValues
  ) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Condition Configuration
          </DialogTitle>
          <DialogDescription>
            Create multiple rules and choose
            AND / OR logic to control
            branching.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              handleSubmit
            )}
            className="space-y-6 mt-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Variable Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="conditionResult"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use in next nodes:
                    <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {`{{${watchVariableName}.passed}}`}
                    </code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Combinator */}
            <FormField
              control={form.control}
              name="combinator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Logic Operator
                  </FormLabel>
                  <Select
                    onValueChange={
                      field.onChange
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AND">
                        AND
                      </SelectItem>
                      <SelectItem value="OR">
                        OR
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* RULES */}
<div className="space-y-3">
  {form.watch("rules").map((_, index) => (
    <div
      key={index}
      className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-muted/40 p-3 rounded-lg"
    >
      {/* Left */}
      <Input
        placeholder="geminiNode.text"
        {...form.register(`rules.${index}.left`)}
        className="flex-1"
      />

      {/* Operator */}
      <Select
        onValueChange={(val) =>
          form.setValue(`rules.${index}.operator`, val as any)
        }
        value={form.watch(`rules.${index}.operator`)}
      >
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">Equals</SelectItem>
          <SelectItem value="not_equals">Not Equals</SelectItem>
          <SelectItem value="contains">Contains</SelectItem>
          <SelectItem value="greater_than">Greater Than</SelectItem>
          <SelectItem value="less_than">Less Than</SelectItem>
        </SelectContent>
      </Select>

      {/* Right */}
      <Input
        placeholder="Hello"
        {...form.register(`rules.${index}.right`)}
        className="flex-1"
      />

      {/* Delete */}
      {form.watch("rules").length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const rules = form.getValues("rules");
            form.setValue(
              "rules",
              rules.filter((_, i) => i !== index)
            );
          }}
          className="self-end md:self-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
        >
          ✕
        </Button>
      )}
    </div>
  ))}
</div>

<Button
  type="button"
  variant="secondary"
  className="mt-3 w-full md:w-auto"
  onClick={() =>
    form.setValue("rules", [
      ...form.getValues("rules"),
      {
        left: "",
        operator: "equals",
        right: "",
      },
    ])
  }
>
  + Add Rule
</Button>
            

            <DialogFooter>
              <Button type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
