import "server-only";

import { bffFetch, errorResponse } from "@/lib/http";
import type { SubmitPreToPostResponse } from "@/lib/types/pretopost";

/**
 * Server-side service for the pre-to-post conversion workflow.
 * Talks to the Subscription Management backend via bffFetch, which adds the
 * Bearer token from the HttpOnly cookie automatically.
 */
export const pretopostService = {
  submitPreToPost: (payload: {
    packageId: string;
    email: string;
    phoneNumber?: string;
  }) =>
    bffFetch<SubmitPreToPostResponse>({
      path: "/v1/subscription/pre-to-post/submit",
      method: "POST",
      body: payload,
    }),

  /** Returns an error response for BFF route handlers. */
  errorResponse,
};
