import { getQueueAggregates } from "@/lib/api/queues";
import { errorResponse } from "@/lib/http";

/**
 * Queue's published cross-application contract.
 *
 * This is the only Queue endpoint another application (the shell's information
 * widget) is allowed to read. It exposes aggregate counts only - no customer
 * identity, no queue rules, no actions.
 *
 * Route: GET /queue/api/summary
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const aggregates = await getQueueAggregates();
    return Response.json(aggregates, {
      headers: {
        // Deliberately private: the payload is derived from the caller's
        // session, and it changes as the queue moves.
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
