import { NextResponse } from "next/server";

import { pretopostService } from "@/lib/services/pretopost";
import { pretopostSubmitSchema } from "@/lib/schemas/pretopost";

/**
 * POST /subscription-management/api/pre-to-post/submit
 *
 * BFF proxy for the pre-to-post conversion workflow.
 * The JWT arrives as an HttpOnly cookie; bffFetch converts it to a Bearer
 * header for the Go backend. The browser never holds or sends the token.
 */
export async function POST(request: Request) {
  const parsed = pretopostSubmitSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
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
    const data = await pretopostService.submitPreToPost(parsed.data);
    return NextResponse.json({ success: true, message: "Submission received", data }, { status: 201 });
  } catch (error) {
    return pretopostService.errorResponse(error);
  }
}
