"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@repo/ui";

import type { PostpaidPackage } from "@/lib/types/pretopost";

interface AllPostpaidPackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPackage?: (pkg: PostpaidPackage) => void;
}

const categories = ["All", "Ultimate", "Diamond", "Gold"];
const durations = ["All", "28 Days", "30 Days"];

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Searchable postpaid package catalog. Feature-local to pre-to-post.
 */
export function AllPostpaidPackagesModal({
  open,
  onOpenChange,
  onSelectPackage,
}: AllPostpaidPackagesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // TODO: fetch from backend instead of hardcoding
  const allPackages: PostpaidPackage[] = [];

  const filtered = allPackages.filter((pkg) => {
    const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || pkg.name.includes(selectedCategory);
    const matchDuration = selectedDuration === "All" || pkg.duration === selectedDuration;
    return matchSearch && matchCategory && matchDuration;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-center">Postpaid Packages</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted/50 pl-10"
          />
        </div>

        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-muted/50 flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger className="bg-muted/50 flex-1">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map((dur) => (
                <SelectItem key={dur} value={dur}>
                  {dur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid max-h-[400px] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  onSelectPackage?.(pkg);
                }}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                {pkg.image ? (
                  <img src={pkg.image} alt={pkg.name} className="mb-3 h-24 w-full object-contain" />
                ) : null}
                <p className="text-sm font-medium text-foreground">{pkg.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{pkg.duration}</p>
                {pkg.salePrice > 0 && (
                  <p className="text-muted-foreground text-xs line-through">
                    {formatRupiah(pkg.salePrice)}
                  </p>
                )}
                <p className="text-primary mt-0.5 text-sm font-bold">
                  {formatRupiah(pkg.price)}
                </p>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full py-8 text-center text-sm">
              No packages found
            </p>
          )}
        </div>

        {selectedPackageId && (
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Select Package
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
