import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            "border-outline-variant text-primary focus:ring-secondary/40 h-4 w-4 rounded",
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-body-md text-on-surface ml-2">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
