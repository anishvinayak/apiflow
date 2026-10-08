import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

const createApiSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500).optional(),
  endpoint: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await req.json();

    const result = createApiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid API data",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, slug, description, endpoint } = result.data;

    const existingApi = await db.api.findUnique({
      where: { slug },
    });

    if (existingApi) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const api = await db.api.create({
      data: {
        name,
        slug,
        description,
        endpoint,
        ownerId: auth.userId,
      },
    });

    return NextResponse.json(
      {
        message: "API created",
        api,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_API_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const apis = await db.api.findMany({
      where: {
        ownerId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ apis });
  } catch (error) {
    console.error("GET_APIS_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}