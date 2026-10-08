import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { generateApiKey } from "@/lib/api-key";

const createKeySchema = z.object({
  name: z.string().min(2).max(50),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const { id: apiId } = await params;

    const api = await db.api.findFirst({
      where: {
        id: apiId,
        ownerId: auth.userId,
      },
    });

    if (!api) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const result = createKeySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid key name" },
        { status: 400 }
      );
    }

    const { name } = result.data;

    const { key, prefix, keyHash } = generateApiKey();

    const apiKey = await db.apiKey.create({
      data: {
        name,
        prefix,
        keyHash,
        userId: auth.userId,
        apiId,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "API key created",
        apiKey,
        key,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_API_KEY_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const { id: apiId } = await params;

    const api = await db.api.findFirst({
      where: {
        id: apiId,
        ownerId: auth.userId,
      },
    });

    if (!api) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    const apiKeys = await db.apiKey.findMany({
      where: {
        apiId,
        userId: auth.userId,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        status: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("GET_API_KEYS_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}