import { cn } from "@/lib/utils/cn";

interface CharCountProps {
  value?: string | null;
  max: number;
  /** Optional floor (e.g. overview needs 100) — shown once the user starts typing */
  min?: number;
  className?: string;
}

/**
 * Live "142/200" readout that turns red the moment a field passes its limit, so
 * an over-long value is visible while typing instead of coming back as a failed
 * save with nothing pointing at the culprit.
 */
export default function CharCount({ value, max, min, className }: CharCountProps) {
  const length = value?.length ?? 0;
  const tooLong = length > max;
  const tooShort = min !== undefined && length > 0 && length < min;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        tooLong || tooShort ? "font-medium text-red-600" : "text-gray-500",
        className
      )}
    >
      {length.toLocaleString()}/{max.toLocaleString()}
      {tooShort ? ` · ${min} minimum` : ""}
    </span>
  );
}
