import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await params;

    const apiKey = await db.apiKey.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    await db.apiKey.update({
      where: {
        id,
      },
      data: {
        status: "REVOKED",
      },
    });

    return NextResponse.json({
      message: "API key revoked",
    });
  } catch (error) {
    console.error("REVOKE_API_KEY_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}