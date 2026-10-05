"use client";

import { useState } from "react";
import { AlertCircle, LayoutGrid } from "lucide-react";
import type { PhoneNumber } from "@/lib/types";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui";
import { ProviderIcon } from "./provider-icon";
import { AllNumbersModal } from "./all-numbers-modal";

interface PhoneNumberListProps {
  numbers: PhoneNumber[];
  totalCount: number;
  onViewAll?: () => void;
  customerName?: string;
  selectedId?: string;
  onSelect?: (number: PhoneNumber) => void;
}

/**
 * Horizontally scrollable list of the customer's registered numbers with
 * selection, status markers and an "all numbers" dialog. Shared across
 * profile, reload and pretopost flows.
 */
export function PhoneNumberList({
  numbers,
  totalCount,
  onViewAll,
  customerName = "Pelanggan",
  selectedId,
  onSelect,
}: PhoneNumberListProps) {
  const showViewAll = numbers.length > 1;
  const [isAllNumbersOpen, setIsAllNumbersOpen] = useState(false);

  // Fallback: without an explicit selection, prefer the first active number.
  const effectiveSelectedId =
    selectedId ??
    numbers.find((n) => n.status !== "suspend" && n.status !== "nonaktif")?.id;

  function handleViewAll() {
    setIsAllNumbersOpen(true);
    onViewAll?.();
  }

  return (
    <>
      <h3 className="text-section-title">
        Nomor Pelanggan Terdaftar ({numbers.length})
      </h3>

      <div className="mt-4 flex items-center gap-3 min-w-0 ">
        <div className="scrollbar-none flex w-0 flex-1 gap-3 overflow-x-auto pb-1">
          {numbers.map((number) => {
            const isSuspend = number.status === "suspend";
            const isNonaktif = number.status === "nonaktif";
            const isSelected = number.id === effectiveSelectedId;

            return (
              <button
                key={number.id}
                type="button"
                onClick={() => onSelect?.(number)}
                aria-pressed={isSelected}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-pill border-2 py-2.5 text-sm font-semibold transition-colors",
                  number.iconOnly ? "px-2.5" : "px-4",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : isSuspend
                      ? "border-border text-ink-soft/40"
                      : isNonaktif
                        ? "border-border text-ink-soft/70"
                        : "border-border text-ink-soft/80 hover:border-primary/40",
                )}
              >
                <ProviderIcon number={number} />

                {!number.iconOnly && <span>{number.msisdn}</span>}

                {isSuspend && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                    <AlertCircle size={14} />
                    Suspend
                  </span>
                )}

                {isNonaktif && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                    <AlertCircle size={12} />
                    Nonaktif
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showViewAll && (
          <Button
            type="button"
            variant="outline"
            className="border-2 shrink-0"
            onClick={handleViewAll}
          >
            <LayoutGrid />
            Lihat Semua {totalCount}
          </Button>
        )}
      </div>

      <AllNumbersModal
        open={isAllNumbersOpen}
        onOpenChange={setIsAllNumbersOpen}
        customerName={customerName}
        numbers={numbers}
        onSelectNumber={(number) => {
          onSelect?.(number);
          setIsAllNumbersOpen(false);
        }}
      />
    </>
  );
}
