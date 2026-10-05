/**
 * Subscription Management backend types.
 * These describe the shape of data coming from the Go service — they are not
 * shared with any other application.
 */

export interface PostpaidPackageOption {
  id: string;
  price: number;
  salePrice: number;
  image: string;
}

export interface PostpaidPackageDetail {
  id: string;
  quota: string;
  call: string;
  callToAll: string;
  smsToAll: string;
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

export interface PreToPostPlanSummary {
  msisdn: string;
  email: string;
  servicePlan: string;
  mobileBalance: number;
}

export interface SubmitPreToPostResponse {
  success: boolean;
  orderId: string;
  status: "pending" | "completed" | "failed";
  message: string;
  packageId: string;
  email: string;
  phoneNumber: string | null;
}
