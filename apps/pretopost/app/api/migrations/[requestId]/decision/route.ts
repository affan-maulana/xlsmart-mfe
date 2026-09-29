import { decideMigration } from "@/lib/api/migrations";
import { errorResponse } from "@/lib/http";
import { migrationDecisionSchema } from "@/lib/schemas";

/** PreToPost BFF: record an approve/reject decision. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;
  const parsed = migrationDecisionSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid decision" },
      { status: 422 },
    );
  }

  try {
    return Response.json({
      request: await decideMigration(requestId, parsed.data.decision, parsed.data.note),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
