import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { NodeStatus } from "./node-status-indicator";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";

// 1. Define the props interface exactly like your tutor's code
interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: NodeStatus;
}

// 2. Use forwardRef so React Flow can correctly measure and handle the node
export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <div
        ref={ref} // Important: Pass the ref to the div
        className={cn(
          "bg-card text-card-foreground relative rounded-sm border border-muted-foreground",
          "hover:bg-accent",
          className
        )}
        tabIndex={0}
        {...props}
      >
        {props.children}
        {status === "error" && (
          <XCircleIcon className="absolute right-1 bottom-1 size-2 text-red-700 stroke-3"/>
        )}
        {status === "success" && (
          <CheckCircle2Icon className="absolute right-1 bottom-1 size-2 text-green-700 stroke-3"/>
        )}
        {status === "loading" && (
          <Loader2Icon className="absolute right-0.25 bottom-0.25 size-1. text-blue-700 stroke-3 animate-spin"/>
        )}
      </div>
    );
  }
);

BaseNode.displayName = "BaseNode";

// --- The rest of your helper components can stay as they are ---

export function BaseNodeHeader({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <header
      {...props}
      className={cn(
        "mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-3 py-2",
        className
      )}
    />
  );
}

export function BaseNodeHeaderTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn("user-select-none flex-1 font-semibold", className)}
      {...props}
    />
  );
}

export function BaseNodeContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="base-node-content"
      className={cn("flex flex-col gap-y-2 p-3", className)}
      {...props}
    />
  );
}

export function BaseNodeFooter({ 
    className, 
    ...props 
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn(
        "flex flex-col items-center gap-y-2 border-t px-3 pt-2 pb-3",
        className
      )}
      {...props}
    />
  );
}


// ------------ original react flow componenets-------------------

// import type { ComponentProps } from "react";

// import { cn } from "@/lib/utils";
// import { NodeStatus } from "./node-status-indicator";

// interface BaseNodeProps extends
// HTMLAttributes<HTMLDivElement>{
//   status?: NodeStatus;
// }

// export function BaseNode({ className, ...props }: ComponentProps<"div">) {
//   return (
//     <div
//       className={cn(
//         "bg-card text-card-foreground relative rounded-md border",
//         "hover:ring-1",
//         // React Flow displays node elements inside of a `NodeWrapper` component,
//         // which compiles down to a div with the class `react-flow__node`.
//         // When a node is selected, the class `selected` is added to the
//         // `react-flow__node` element. This allows us to style the node when it
//         // is selected, using Tailwind's `&` selector.
//         "[.react-flow\\_\\_node.selected_&]:border-muted-foreground",
//         "[.react-flow\\_\\_node.selected_&]:shadow-lg",
//         className,
//       )}
//       tabIndex={0}
//       {...props}
//     />
//   );
// }

// /**
//  * A container for a consistent header layout intended to be used inside the
//  * `<BaseNode />` component.
//  */
// export function BaseNodeHeader({
//   className,
//   ...props
// }: ComponentProps<"header">) {
//   return (
//     <header
//       {...props}
//       className={cn(
//         "mx-0 my-0 -mb-1 flex flex-row items-center justify-between gap-2 px-3 py-2",
//         // Remove or modify these classes if you modify the padding in the
//         // `<BaseNode />` component.
//         className,
//       )}
//     />
//   );
// }

// /**
//  * The title text for the node. To maintain a native application feel, the title
//  * text is not selectable.
//  */
// export function BaseNodeHeaderTitle({
//   className,
//   ...props
// }: ComponentProps<"h3">) {
//   return (
//     <h3
//       data-slot="base-node-title"
//       className={cn("user-select-none flex-1 font-semibold", className)}
//       {...props}
//     />
//   );
// }

// export function BaseNodeContent({
//   className,
//   ...props
// }: ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="base-node-content"
//       className={cn("flex flex-col gap-y-2 p-3", className)}
//       {...props}
//     />
//   );
// }

// export function BaseNodeFooter({ className, ...props }: ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="base-node-footer"
//       className={cn(
//         "flex flex-col items-center gap-y-2 border-t px-3 pt-2 pb-3",
//         className,
//       )}
//       {...props}
//     />
//   );
// }
