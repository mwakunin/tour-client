import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label-caps text-on-surface-variant mb-2 block">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "border-outline-variant text-body-md text-on-surface w-full border-0 border-b bg-transparent px-0 py-2 transition-colors",
            "focus:border-primary focus:ring-0 focus:outline-none",
            error && "border-error",
            props.disabled && "cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        />
        {error && <p className="text-error mt-1 text-sm">{error}</p>}
        {helpText && !error && <p className="text-on-surface-variant mt-1 text-sm">{helpText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
