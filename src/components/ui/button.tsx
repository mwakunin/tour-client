import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "label-caps inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-primary bg-transparent text-primary hover:shadow-[inset_0_0_0_1px_var(--color-primary)]",
        secondary:
          "border border-secondary bg-transparent text-secondary hover:bg-secondary-container hover:text-on-secondary-container",
        danger: "bg-error text-on-error hover:bg-error-container hover:text-on-error-container",
        ghost:
          "bg-transparent text-on-surface underline decoration-outline-variant underline-offset-4 hover:text-primary hover:decoration-primary",
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        // `disabled` must be destructured out rather than left in `props`:
        // `{...props}` is spread AFTER this line, so an explicitly passed
        // `disabled` used to overwrite the computed value and `isLoading` never
        // disabled anything. A slow submit could be fired twice.
        disabled={isLoading || disabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 animate-spin" size={16} aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
export { buttonVariants };
