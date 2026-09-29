import { applyTicketAction } from "@/lib/api/queues";
import { errorResponse } from "@/lib/http";
import { ticketActionSchema } from "@/lib/schemas";

/** Queue BFF: ticket operations (call next, serve, no-show, recall). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ queueId: string }> },
) {
  const { queueId } = await params;
  const parsed = ticketActionSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      {
        message: "Check the ticket action",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  if (parsed.data.action !== "recall" && !parsed.data.counter) {
    return Response.json({ message: "Counter is required." }, { status: 422 });
  }

  try {
    return Response.json({
      tickets: await applyTicketAction(queueId, parsed.data.action, parsed.data.counter),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
