import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Hook for post-upload work; not needed since we record the URL
        // in the form submit Server Action.
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    const status = (err as Error).message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
