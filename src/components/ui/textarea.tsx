/**
 * Textarea component — shadcn/ui style.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-black-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-black-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
