"use client";

import { useState } from "react";
import { v5 as uuidv5 } from "uuid";

import { Breadcrumb, PageHeader, QueueBar } from "@repo/ui";
import { InfoBlock } from "@/components/info-block";
import { PhoneNumberList } from "./_components/phone-number-list";
import { PretopostForm } from "./_components/pretopost-form";
import { CustomerProfile, PhoneNumber } from "@repo/ui/lib/types";

const NAMESPACE = "6f0a1f2a-1c1d-4a3a-9c9a-1f0a2f3a4b5c";
const id = (seed: string) => uuidv5(seed, NAMESPACE);

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// TODO: replace with server-side data fetching from the backend
const mockPlanSummary = {
  msisdn: "081234567890",
  email: "customer@example.com",
  servicePlan: "Prepaid XL 30",
  mobileBalance: 50000,
};

export const customerProfile: CustomerProfile = {
  id: id("customer-fazhar"),
  nik: "317282319920022",
  birthDate: "20 July 1999",
  fullName: "Fazhar Dwitiawan Putra",
  gender: "Laki-Laki",
  maritalStatus: "Married",
  address:
    "The Hills D8/1 Grand Residence, Jl. Raya Pondok Cabe 3-7, Pondok Cabe, Pamulang Tangerang Selatan",
  isBirthdayToday: true,
  religion: "",
  occupation: "",
  motherName: "Gr******ri",
  income: "Up to Rp2.000.000",
};

function getNumbersByNik(nik: string): {
  numbers: PhoneNumber[];
  totalCount: number;
} {
  return {
    numbers: [
      { id: "1", msisdn: "628787700099", provider: "xl" },
      {
        id: "2",
        msisdn: "628123450011",
        provider: "axis",
        status: "suspend",
      },
      {
        id: "3",
        msisdn: "628123450022",
        provider: "smartfren",
        status: "nonaktif",
      },
      {
        id: "4",
        msisdn: "628222450033",
        provider: "xl",
        status: "suspend",
        outstanding: true,
      },
      {
        id: "5",
        msisdn: "628123450044",
        provider: "axis",
        outstanding: true,
      },
      { id: "6", msisdn: "628123450022", provider: "smartfren" },
      { id: "7", msisdn: "628123450033", provider: "xl" },
      { id: "8", msisdn: "628123450044", provider: "axis" },
    ],
    totalCount: 8,
  };
}

export default function PreToPostPage() {
  const { numbers, totalCount } = getNumbersByNik(customerProfile.nik);

  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(
    numbers.find((n) => n.status !== "suspend" && n.status !== "nonaktif") ??
      numbers[0] ??
      null,
  );

  return (
    <>
      <QueueBar
        queue={{
          id: "Q-001",
          queueNumber: "Q-001",
          customerName: mockPlanSummary.email,
          handlingTime: "02:15",
          longestTimeInQueue: "02:15",
        }}
        className="sticky top-16 z-30 mb-4"
      />

      {/* Container */}
      <div className="mb-6 px-6">
        <Breadcrumb
          trail={[{ label: "Dashboard", href: "/" }, "Prepaid to Postpaid"]}
        />
        <PageHeader title="Prepaid to Postpaid" className="py-6" />

        {/* Content */}
        <div>
          {/* registered numbers */}
          <PhoneNumberList
            numbers={numbers}
            totalCount={totalCount}
            customerName=""
            selectedId={selectedNumber?.id}
            onSelect={setSelectedNumber}
          />

          {/* Plan Summary Bar */}
          <div className="grid mt-6 grid-cols-1 rounded-xl border bg-muted/50 p-4 sm:grid-cols-3">
            <InfoBlock
              label="MSISDN"
              value={mockPlanSummary.msisdn}
              valueClassName="text-lg"
            />

            <div className="border-l pl-2">
              <InfoBlock
                label="Service Plan"
                value={mockPlanSummary.servicePlan}
                valueClassName="text-lg"
              />
            </div>
            <div className="border-l pl-2">
              <InfoBlock
                label="Mobile Balance"
                value={formatRupiah(mockPlanSummary.mobileBalance)}
                valueClassName="text-lg"
              />
            </div>
          </div>

          <PretopostForm selectedNumber={selectedNumber} />
        </div>
      </div>
    </>
  );
}
