import { createQueue, listQueues } from "@/lib/api/queues";
import { errorResponse } from "@/lib/http";
import { createQueueSchema } from "@/lib/schemas";

/** Queue BFF: list queues. */
export async function GET() {
  try {
    return Response.json({ queues: await listQueues() });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Queue BFF: open a new queue. */
export async function POST(request: Request) {
  const parsed = createQueueSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      {
        message: "Check the highlighted fields",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    return Response.json({ queue: await createQueue(parsed.data) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
