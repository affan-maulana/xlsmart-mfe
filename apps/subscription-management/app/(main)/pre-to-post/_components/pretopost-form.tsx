"use client";

import { useState } from "react";
import { v5 as uuidv5 } from "uuid";
import Image from "next/image";

import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  cn,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
} from "@repo/ui";
import { AllPostpaidPackagesModal } from "@/components/pre-to-post/all-postpaid-packages-modal";
import { usePretopostSubmit } from "@/hooks/use-pretopost-submit";
import type { PostpaidPackageOption } from "@/lib/types/pretopost";
import { MandatoryInfoItem, PhoneNumber } from "@repo/ui/lib/types";
import { ServicePlaybook } from "@/lib/types";

const NAMESPACE = "6f0a1f2a-1c1d-4a3a-9c9a-1f0a2f3a4b5c";
const id = (seed: string) => uuidv5(seed, NAMESPACE);

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

const playbook: ServicePlaybook = {
  title: "Service Playbook",
  elapsedTime: "00:01",
  stageLabel: "Tahap 0/3",
  interactions: [
    {
      id: id("interaksi-1"),
      question: "Pelanggan WNI atau WNA?",
      answer: "Pastikan kewarganegaraan sesuai dokumen identitas yang dibawa",
    },
    {
      id: id("interaksi-2"),
      question: "Mau pakai eSIM atau uSIM?",
      answer: "Kalau pilih eSIM, pastikan HP pelanggan support eSIM,",
      note: "cek disini",
    },
    {
      id: id("interaksi-3"),
      question: "Email aktif buat dikirimin konfirmasi?",
      answer: "Wajib diisi kalau eSIM, pastikan email valid & aktif",
    },
  ],
};

const postPaidSelectedId = "postPaid-2";

const postpaidOptions: PostpaidPackageOption[] = [
  {
    id: id("postPaid-1"),
    price: 100000,
    salePrice: 0,
    image: "images/postpaid_packages/xl-prio.png",
  },
  {
    id: id("postPaid-2"),
    price: 200000,
    salePrice: 150000,
    image: "images/postpaid_packages/xl-ultra-5g-max.png",
  },
  {
    id: id("postPaid-3"),
    price: 250000,
    salePrice: 200000,
    image: "images/postpaid_packages/xl-ultra5g.png",
  },
];

const items: MandatoryInfoItem[] = [
  { id: id("info-1"), title: "Nomor akan aktif setelah 4 hari masa kerja" },
  { id: id("info-2"), title: "Proses Aktivasi akan dikenakan biaya Rp 5.000" },
  {
    id: id("info-3"),
    title:
      "Kartu perdana yang sudah diaktifkan tidak dapat dikembalikan/ditukar",
  },
  {
    id: id("info-4"),
    title:
      "NIK yang didaftarkan harus sesuai dengan KTP asli pelanggan yang hadir",
  },
];

const packageCategories = ["All", "Ultimate", "Diamond", "Gold"];

const BRAND_LOGO_SRC = "/icons/xllogo2.svg";

interface PretopostFormProps {
  selectedNumber: PhoneNumber | null;
}

export function PretopostForm({ selectedNumber }: PretopostFormProps) {
  const { submit, isSubmitting, error, fieldErrors } = usePretopostSubmit();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    postPaidSelectedId,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAllPackagesOpen, setIsAllPackagesOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(
      playbook.interactions.map((item) => [item.id, item.checked ?? false]),
    ),
  );

  const completedCount = Object.values(checked).filter(Boolean).length;

  const handlePostPaidSelect = (option: PostpaidPackageOption) => {
    setSelectedPackageId(option.id);
  };

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleProses() {
    const result = await submit({
      packageId: selectedPackageId ?? "",
      email,
      phoneNumber: phoneNumber || undefined,
    });

    if (result) {
      // TODO: navigate to result page
      alert(`Order ${result.orderId} submitted: ${result.message}`);
    }
  }

  return (
    <>
      <h2 className="mt-6 text-base font-medium tracking-wide">
        Complete Prepaid to Postpaid Change Information
      </h2>

      {error && (
        <div className="bg-destructive/10 text-destructive mt-4 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        {/* Package Picker + Contact Form */}
        <div className="flex flex-col gap-4">
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col gap-4 p-6">
              {/* Package Selection */}
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-foreground">
                  Pilih Paket Postpaid
                  <span className="text-destructive">*</span>
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm font-medium"
                  onClick={() => setIsAllPackagesOpen(true)}
                >
                  Lihat semua paket
                </Button>
              </div>

              {/* <FieldError message={fieldErrors?.packageId} /> */}

              <div className="mt-4 flex flex-wrap gap-2">
                {packageCategories.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isSelected}
                      className={cn(
                        "rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-card text-primary"
                          : "border-border bg-faint text-foreground hover:bg-accent",
                      )}
                      // onClick={() => handleSelectCategory(category)}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {postpaidOptions.map((option) => {
                  const isPostPaidSelected = postPaidSelectedId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handlePostPaidSelect(option)}
                      aria-pressed={isPostPaidSelected}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left transition-colors",
                        isPostPaidSelected
                          ? "border-transparent"
                          : "border-border bg-faint hover:border-primary/40",
                      )}
                      style={
                        isPostPaidSelected
                          ? {
                              backgroundImage:
                                "linear-gradient(hsl(var(--card)), hsl(var(--card))), var(--gradient-brand)",
                              backgroundOrigin: "border-box",
                              backgroundClip: "padding-box, border-box",
                            }
                          : undefined
                      }
                    >
                      <img
                        src={option.image}
                        alt={option.id}
                        className="mb-3 h-30 w-full border-b border-border pb-3"
                      />

                      {option.salePrice > 0 && (
                        <p className="text-xs text-ink-muted line-through">
                          {formatRupiah(option.salePrice)}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm font-bold text-info">
                        {formatRupiah(option.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col gap-4 p-6">
              <Field
                label="Email"
                htmlFor="email"
                required
                error={fieldErrors.email}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  invalid={Boolean(fieldErrors.email)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field
                label="Alternative Phone Number"
                htmlFor="phone"
                error={fieldErrors.phoneNumber}
              >
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  invalid={Boolean(fieldErrors.phoneNumber)}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1">
              Save as Draft
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleProses}
            >
              {isSubmitting ? "Processing..." : "Process"}
            </Button>
          </div>
        </div>

        {/* Sidebar: Mandatory Info + Service Playbook */}
        <div className="flex flex-col gap-5">
          <Accordion
            type="single"
            collapsible
            defaultValue="mandatory-info"
            className="overflow-hidden rounded-2xl border border-[#FDB934] bg-[#FFE3AE]"
          >
            <AccordionItem value="mandatory-info" className="border-b-0">
              <AccordionTrigger className="px-5 hover:no-underline">
                Mandatory Info
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      index !== items.length - 1
                        ? "border-b border-border py-3"
                        : "py-3"
                    }
                  >
                    <p className="text-xs font-semibold text-muted-foreground">
                      Info {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion
            type="single"
            collapsible
            defaultValue="service-playbook"
            className="overflow-hidden rounded-2xl border border-[#EDEEFF] bg-info-subtle"
          >
            <AccordionItem value="service-playbook" className="border-b-0">
              <AccordionTrigger className="px-5 hover:no-underline bg-[#EDEEFF]">
                <span className="flex items-center gap-2">
                  <Image src={BRAND_LOGO_SRC} alt="" width={18} height={18} />
                  {playbook.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="border-t border-primary/10 bg-card px-5">
                  {playbook.interactions.map((item, index) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggle(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") toggle(item.id);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 py-3",
                        index !== playbook.interactions.length - 1 &&
                          "border-b border-primary/10",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Interaksi {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          Q : {item.question}
                        </p>
                        <p className="mt-1 text-sm text-ink-soft/70">
                          A : {item.answer}
                          {item.note && (
                            <>
                              {" "}
                              <span className="cursor-pointer underline">
                                {item.note}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <Checkbox
                        checked={checked[item.id]}
                        onCheckedChange={() => toggle(item.id)}
                        aria-label={`Tandai interaksi ${index + 1} selesai`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-[#EDEEFF] px-5 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {playbook.elapsedTime}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Waktu Berjalan
                    </p>
                  </div>
                  <p className="text-sm font-bold text-info">
                    Tahap {completedCount}/{playbook.interactions.length}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <AllPostpaidPackagesModal
        open={isAllPackagesOpen}
        onOpenChange={setIsAllPackagesOpen}
      />
    </>
  );
}
