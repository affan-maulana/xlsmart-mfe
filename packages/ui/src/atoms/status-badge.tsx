import Image from "next/image";
import type { StatusTone } from "../lib/types";
import { Badge, type BadgeProps } from "../ui/badge";
import { cn } from "../lib/utils";

const TONE_VARIANT: Record<StatusTone, NonNullable<BadgeProps["variant"]>> = {
  good: "success",
  warn: "warning",
  bad: "destructive",
};

const TONE_ICON: Record<StatusTone, string> = {
  good: "/icons/broadcastinggreen.svg",
  warn: "/icons/broadcastRed.svg",
  bad: "/icons/broadcastRed.svg",
};

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  label: string;
  tone: StatusTone;
}

/**
 * Domain status marker (`Baik` / `Cukup` / `Tinggi` …). Maps the business
 * `StatusTone` vocabulary onto the ui Badge foundation.
 * Consolidates the former `StatusBadge` + `StatusPill` duplicates.
 */
export function StatusBadge({
  label,
  tone,
  className,
  size = "md",
  ...props
}: StatusBadgeProps) {
  const iconSize = size === "lg" ? 16 : 14;
  return (
    <Badge
      variant={TONE_VARIANT[tone]}
      size={size}
      className={cn(className)}
      {...props}
    >
      <Image src={TONE_ICON[tone]} alt="" width={iconSize} height={iconSize} />
      {label}
    </Badge>
  );
}
