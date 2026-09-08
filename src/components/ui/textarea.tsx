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
          <label htmlFor={textareaId} className="label-caps mb-2 block text-on-surface-variant">
            {label}
            {props.required && <span className="ml-1 text-error">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 text-body-md text-on-surface transition-colors",
            "focus:border-primary focus:ring-0 focus:outline-none",
            error && "border-error",
            props.disabled && "cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helpText && !error && (
          <p className="mt-1 text-sm text-on-surface-variant">{helpText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
