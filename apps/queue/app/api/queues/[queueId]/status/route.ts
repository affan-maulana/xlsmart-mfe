import { changeQueueStatus } from "@/lib/api/queues";
import { errorResponse } from "@/lib/http";
import { changeQueueStatusSchema } from "@/lib/schemas";

/** Queue BFF: queue lifecycle transition. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ queueId: string }> },
) {
  const { queueId } = await params;
  const parsed = changeQueueStatusSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid status" },
      { status: 422 },
    );
  }

  try {
    return Response.json({ queue: await changeQueueStatus(queueId, parsed.data.status) });
  } catch (error) {
    return errorResponse(error);
  }
}
