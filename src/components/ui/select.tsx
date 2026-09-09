import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helpText, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label-caps text-on-surface-variant mb-2 block">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "border-outline-variant text-body-md text-on-surface w-full cursor-pointer appearance-none border-0 border-b bg-transparent px-0 py-2 transition-colors",
            "focus:border-primary focus:ring-0 focus:outline-none",
            error && "border-error",
            props.disabled && "cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-error mt-1 text-sm">{error}</p>}
        {helpText && !error && <p className="text-on-surface-variant mt-1 text-sm">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
