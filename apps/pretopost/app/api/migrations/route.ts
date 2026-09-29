import { createMigration, listMigrations } from "@/lib/api/migrations";
import { errorResponse } from "@/lib/http";
import { createMigrationSchema } from "@/lib/schemas";

/** PreToPost BFF: list and raise migration requests. */

export async function GET() {
  try {
    return Response.json({ requests: await listMigrations() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const parsed = createMigrationSchema.safeParse(await request.json().catch(() => null));

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
    return Response.json({ request: await createMigration(parsed.data) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
