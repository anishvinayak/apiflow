import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

export async function GET() {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const apiKeys = await db.apiKey.findMany({
      where: {
        userId: auth.userId,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        status: true,
        createdAt: true,
        lastUsedAt: true,
        api: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      apiKeys,
    });
  } catch (error) {
    console.error("GET_API_KEYS_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}