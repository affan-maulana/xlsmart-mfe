import "server-only";

import { bffFetch } from "../http";
import type { CustomerDetail, CustomerInteraction, CustomerSummary } from "../types";

/**
 * Customer360's server data access. Called by Server Components for page
 * rendering and by route handlers to serve the browser.
 */

export async function searchCustomers(
  query: string,
  signal?: AbortSignal,
): Promise<CustomerSummary[]> {
  const response = await bffFetch<{ customers: CustomerSummary[] }>({
    path: "/v1/customers",
    searchParams: { q: query },
    signal,
  });
  return response.customers ?? [];
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  try {
    return await bffFetch<CustomerDetail>({ path: `/v1/customers/${encodeURIComponent(id)}` });
  } catch (error) {
    if (error instanceof Error && error.message === "Not found.") return null;
    throw error;
  }
}

export async function listInteractions(id: string): Promise<CustomerInteraction[]> {
  const response = await bffFetch<{ interactions: CustomerInteraction[] }>({
    path: `/v1/customers/${encodeURIComponent(id)}/interactions`,
  });
  return response.interactions ?? [];
}

export async function createInteraction(
  input: Omit<CustomerInteraction, "id" | "createdAt" | "agentName">,
): Promise<CustomerInteraction> {
  const { customerId, ...rest } = input;
  return bffFetch<CustomerInteraction>({
    path: `/v1/customers/${encodeURIComponent(customerId)}/interactions`,
    method: "POST",
    body: rest,
  });
}
