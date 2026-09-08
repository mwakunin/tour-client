import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export default function Card({ title, description, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("bg-surface-container-lowest shadow-elevated rounded-none", className)}
      {...props}
    >
      {(title || description) && (
        <div className="border-outline-variant/40 border-b px-8 py-4">
          {title && <h3 className="text-headline-sm text-on-surface">{title}</h3>}
          {description && (
            <p className="text-body-md text-on-surface-variant mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="p-8">{children}</div>
    </div>
  );
}
