import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label-caps mb-2 block text-on-surface-variant">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full border-0 border-b border-outline-variant bg-transparent px-0 py-2 text-body-md text-on-surface transition-colors",
            "focus:border-primary focus:ring-0 focus:outline-none",
            "disabled:cursor-not-allowed disabled:bg-surface-container-low",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
