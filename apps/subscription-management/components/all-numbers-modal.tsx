import { ChevronRight, Check, AlertCircle } from "lucide-react";
import type { PhoneNumber } from "@/lib/types";
import { ProviderIcon } from "./provider-icon";
import {
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";

interface AllNumbersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  numbers: PhoneNumber[];
  onSelectNumber?: (number: PhoneNumber) => void;
}

const providerLabel: Record<string, string> = {
  xl: "XL Axiata",
  axis: "AXIS",
  smartfren: "Smartfren",
  other: "Lainnya",
};

type RowStatus = "aktif" | "outstanding" | "nonaktif";

function getRowStatus(number: PhoneNumber): RowStatus {
  if (number.status === "suspend" || number.status === "nonaktif")
    return "nonaktif";
  if (number.outstanding) return "outstanding";
  return "aktif";
}

function RowStatusBadge({ status }: { status: RowStatus }) {
  if (status === "aktif") {
    return (
      <Badge variant="success" size="lg" className="font-bold">
        <Check size={16} strokeWidth={3} />
        Aktif
      </Badge>
    );
  }
  if (status === "outstanding") {
    return (
      <Badge variant="warning" size="lg" className="font-bold">
        <AlertCircle size={16} />
        Outstanding
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" size="lg" className="font-bold">
      <AlertCircle size={16} />
      Nonaktif
    </Badge>
  );
}

function NumberRow({
  number,
  onSelect,
}: {
  number: PhoneNumber;
  onSelect?: (number: PhoneNumber) => void;
}) {
  const status = getRowStatus(number);
  const label =
    providerLabel[number.provider ?? "other"] ?? providerLabel.other;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(number)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-faint px-4 py-3 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex min-w-0 items-center gap-3">
        <ProviderIcon number={number} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm text-ink-soft/60">{label}</p>
          <p className="mt-0.5 text-lg font-extrabold text-foreground">
            {number.msisdn}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <RowStatusBadge status={status} />
        <ChevronRight size={18} className="text-ink-soft/30" />
      </div>
    </button>
  );
}

/** Radix Dialog listing every registered number, grouped by active/inactive. */
export function AllNumbersModal({
  open,
  onOpenChange,
  customerName,
  numbers,
  onSelectNumber,
}: AllNumbersModalProps) {
  const activeNumbers = numbers.filter((n) => getRowStatus(n) !== "nonaktif");
  const inactiveNumbers = numbers.filter((n) => getRowStatus(n) === "nonaktif");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl scrollbar-none">
        <DialogHeader>
          <DialogTitle className="text-center">Semua Nomor</DialogTitle>
        </DialogHeader>

        <p className="text-xl font-bold text-foreground">
          {customerName} • {numbers.length} Nomor
        </p>

        {activeNumbers.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-bold text-foreground">
              Nomor Aktif ({activeNumbers.length} Nomor)
            </p>
            <div className="flex flex-col gap-3">
              {activeNumbers.map((number) => (
                <NumberRow
                  key={number.id}
                  number={number}
                  onSelect={onSelectNumber}
                />
              ))}
            </div>
          </div>
        )}

        {inactiveNumbers.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-foreground">
              Nonaktif ({inactiveNumbers.length} Nomor)
            </p>
            <div className="flex flex-col gap-3">
              {inactiveNumbers.map((number) => (
                <NumberRow
                  key={number.id}
                  number={number}
                  onSelect={onSelectNumber}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
