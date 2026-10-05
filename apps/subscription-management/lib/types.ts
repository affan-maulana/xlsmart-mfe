export type StatusTone = "good" | "warn" | "bad";

export interface StatusPillData {
  id: string;
  label: string;
  tone: StatusTone;
}

export interface PostpaidPackageOption {
  id: string;
  price: number;
  salePrice: number;
  image: string;
}

export interface AgentQueueInfo {
  id: string;
  queueNumber: string;
  customerName: string;
  handlingTime: string;
  longestTimeInQueue: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  crrCode: string;
  location: string;
  avatarUrl: string;
  hasNotification: boolean;
}

export interface CustomerProfile {
  id: string;
  nik: string;
  birthDate: string;
  fullName: string;
  gender: "Laki-Laki" | "Perempuan";
  maritalStatus: "Married" | "Single";
  address: string;
  isBirthdayToday: boolean;
  religion: string;
  occupation: string;
  motherName: string;
  income: string;
}

export interface SubscriptionSummary {
  id: string;
  productSubscriptionTotal: number;
  mobileTotal: number;
  mobileBreakdown: { active: number; inactive: number };
  homeTotal: number;
  homeBreakdown: { active: number; inactive: number };
  billingPostpaid: number;
  billingHome: number;
}

export interface BillingAlert {
  id: string;
  message: string;
  dueDate: string;
  actionLabel: string;
}

export interface PendingCase {
  id: string;
  message: string;
  actionLabel: string;
}

export interface PhoneNumber {
  id: string;
  msisdn: string;
  provider?: "xl" | "axis" | "smartfren" | "other";
  status?: "active" | "suspend" | "nonaktif";
  outstanding?: boolean;
  iconOnly?: boolean;
}

export interface PlanDetail {
  id: string;
  planName: string;
  planType: "Prepaid" | "Postpaid";
  customerType: string;
  customerTag: string;
  serviceStatus: "Aktif" | "Nonaktif";
  activeSince: string;
  mobileBalance: number;
  averageArpu: number;
  email: string;
  iccid: string;
  individualId: string;
  contactRole: string;
  specialStatus: string | null;
  gracePeriod: string;
  deviceInfo: string;
  firstEventDate: string;
}

export interface ConnectivityMetric {
  id: string;
  label: string;
  value: string;
  tone: StatusTone;
  pillLabel: string;
}

export interface UsageMetric {
  id: string;
  label: string;
  value: string;
  tone: StatusTone;
  pillLabel: string;
}

export interface PromoBanner {
  id: string;
  eyebrow?: string;
  title: string;
  highlight: string;
  price: string;
  priceUnit: string;
  imageUrl: string;
  theme: "gradient" | "dark";
}

export interface PostpaidPlanDetail {
  planName: string;
  planType: string;
  customerTag: string;
  customerType: string;
  serviceStatus: string;
  activeSince: string;
  status: "active" | "inactive";
  inactiveSince?: string;
  mobileBalance: number;
  averageArpu: number;
  billingOpen: number;
  dueDate: string;
  paymentMethod: string;
  creditCardNumber?: string;
  msisdn: string;
  creditCardExpiry?: string;
  iccid: string;
  estimatedBilling: number;
  creditLimit: number;
  unbill: number;
  ppsBalance: number;
  deposit: number;
  creditClass: string;
  billingCycle: string;
  creditLimitType: string;
  gracePeriod: string;
  billingDelivery: string;
  dealerBalance: number;
  lastPayment: string;
  faId: string;
  specialStatus: string;
  deviceImsi: string;
  firstEventDate: string;
  contactRole: string;
  email: string;
  outstanding: number;
}

export interface HomePlanDetail {
  planName: string;
  customerType: string;
  serviceStatus: string;
  activeSince: string;
  billingOpen: number;
  dueDate: string;
  userId: string;
  firstActivation: string;
  installAddress: string;
  activePlanPeriod: string;
  individualId: string;
  lastPaymentAmount: string;
  billingPayment: string;
  device: string;
  addOnActive: string;
  customerTypeDetail: string;
  incidentStatus: string;
  deviceImsi1: string;
  deviceImsi1Date: string;
  creditAdjustment: string;
  email: string;
  outstanding: number;
}

export interface ForeignCustomerProfile {
  id: string;
  passportNumber: string;
  birthDate: string;
  fullName: string;
  gender: "Laki-Laki" | "Perempuan";
  maritalStatus: "Married" | "Single";
  nationality: string;
  address: string;
  isBirthdayToday: boolean;
  religion: string;
  occupation: string;
  motherName: string;
  income: string;
}

export interface DenomOption {
  id: string;
  /** Nominal pulsa, e.g. 10000 for "Rp 10.000". */
  amount: number;
  /** What the customer pays, may differ from `amount` (admin fee etc.). */
  price: number;
  bonusDays: number;
  /** Extra perk shown next to the bonus days, e.g. "Bonus 500MB". */
  bonusLabel?: string;
}

/** Small "Servis Plan" summary box shown above the denom picker. */
export interface IsiPulsaPlanSummary {
  planName: string;
  planType: string;
  mobileBalance: number;
}

export interface MandatoryInfoItem {
  id: string;
  title: string;
}

export interface PlaybookInteraction {
  id: string;
  question: string;
  answer: string;
  /** Optional extra line under the answer, e.g. a "cek disini" link label. */
  note?: string;
  checked?: boolean;
}

export interface ServicePlaybook {
  title: string;
  interactions: PlaybookInteraction[];
  elapsedTime: string;
  stageLabel: string;
}

export interface PaymentMethodOption {
  id: string;
  name: string;
  adminFee: number;
  caption?: string;
  iconSrc?: string;
  type: PaymentMethodType;
}

export interface PaymentMethodGroup {
  id: string;
  title: string;
  methods: PaymentMethodOption[];
}

export interface PostpaidPackage {
  id: string;
  name: string;
  summary: string;
  duration: string;
  detail: PostpaidPackageDetail;
  salePrice: number;
  price: number;
  image: string;
  recommended?: boolean;
}

export interface PostpaidPackageDetail {
  id: string;
  quota: string;
  call: string;
  callToAll: string;
  smsToAll: string;
}

export interface PaketOption {
  id: string;
  provider: string;
  planName: string;
  quotaLabel: string;
  durationLabel: string;
  locationLabel: string;
  originalPrice?: number;
  price: number;
  recommended?: boolean;
}

export interface PaketOption {
  id: string;
  provider: string; // "xl"
  planName: string; // "Flex Mini" | "FlexMax"
  quotaLabel: string; // "120 GB"
  durationLabel: string; // "28 Hari"
  locationLabel: string; // "Jakarta"
  price: number;
  originalPrice?: number;
  recommended?: boolean;
}

export type PaketCategory = "semua" | "flexmini" | "flexmax";

export interface PaketFilterState {
  search: string;
  category: PaketCategory;
  tipePembayaran: string | null;
  masaBerlangganan: string | null;
}

export interface BillingLineItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface BillingDetail {
  items: BillingLineItem[];
  adminFee: number;
}

export type PaymentMethodType =
  "ewallet" | "qris" | "credit_card" | "virtual_account" | "cash" | "invoice";

export interface PendingPaymentInfo {
  orderId: string;
  pembelian: string;
  metodePembayaran: string; // group title, e.g. "Dompet Digital"
  msisdn: string;
  totalTagihan: number;
  methodName: string; // e.g. "Dana"
  virtualAccountOrAccountNumber: string; // nomor VA / nomor HP dana
  expiresInSeconds: number; // durasi countdown
  instructions: string[];
}

export type PaymentStatusVariant =
  "ewallet" | "virtual_account" | "credit_card" | "qris" | "cash" | "invoice";

export interface OrderSummaryField {
  label: string;
  value: string;
}

export interface VABankTab {
  id: string;
  label: string;
  steps: string[];
}

export interface CreditCardStatusStep {
  id: string;
  label: string;
  description: string;
  status: "done" | "pending";
  actionLabel?: string;
}
