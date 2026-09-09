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
        {label && <label className="label-caps text-on-surface-variant mb-2 block">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "border-outline-variant text-body-md text-on-surface w-full border-0 border-b bg-transparent px-0 py-2 transition-colors",
            "focus:border-primary focus:ring-0 focus:outline-none",
            "disabled:bg-surface-container-low disabled:cursor-not-allowed",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-error mt-1 text-sm">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
