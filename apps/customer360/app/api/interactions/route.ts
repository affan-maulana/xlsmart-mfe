import { createInteraction } from "@/lib/api/customers";
import { errorResponse, UpstreamError } from "@/lib/http";
import { interactionSchema } from "@/lib/schemas";

/** Customer360 BFF: record a customer interaction. */
export async function POST(request: Request) {
  const parsed = interactionSchema.safeParse(await request.json().catch(() => null));

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
    const interaction = await createInteraction(parsed.data);
    return Response.json({ interaction }, { status: 201 });
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 401) {
      return Response.json({ message: "Your session has expired." }, { status: 401 });
    }
    return errorResponse(error);
  }
}
