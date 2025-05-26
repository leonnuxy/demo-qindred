import * as React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(({ className, autosize = false, value, ...props }, ref) => {
  const textareaRef = useRef(null);
  const combinedRef = (node) => {
    textareaRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Adjust height on mount and when value changes if autosize is enabled
  useEffect(() => {
    if (autosize) {
      adjustHeight();
    }
  }, [value, autosize]);

  return (
    <textarea
      ref={combinedRef}
      value={value}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onChange={(e) => {
        props.onChange?.(e);
        if (autosize) {
          adjustHeight();
        }
      }}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };