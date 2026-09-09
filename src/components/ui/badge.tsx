import { HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva("label-caps inline-flex items-center rounded-full px-2.5 py-0.5", {
  variants: {
    variant: {
      default: "bg-surface-container-high text-on-surface-variant",
      primary: "bg-primary text-on-primary",
      secondary: "bg-secondary-container text-on-secondary-container",
      success: "bg-secondary-container text-on-secondary-container",
      warning: "bg-tertiary-container text-on-tertiary-container",
      danger: "bg-error-container text-on-error-container",
      info: "bg-primary-container text-on-primary-container",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
