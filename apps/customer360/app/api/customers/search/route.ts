import { searchCustomers } from "@/lib/api/customers";
import { errorResponse } from "@/lib/http";
import { searchSchema } from "@/lib/schemas";

/**
 * Customer360 BFF: search.
 *
 * Route handlers are the browser-facing half of this domain's BFF. The JWT
 * arrives automatically as an HttpOnly cookie and is converted to a Bearer
 * header for the Go service - the browser never holds or sends the token.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? "Invalid query" }, {
      status: 422,
    });
  }

  try {
    const customers = await searchCustomers(parsed.data.q, request.signal);
    return Response.json({ query: parsed.data.q, customers });
  } catch (error) {
    return errorResponse(error);
  }
}
