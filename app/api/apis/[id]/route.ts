import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

const updateApiSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  endpoint: z.string().url().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await params;

    const api = await db.api.findFirst({
      where: {
        id,
        ownerId: auth.userId,
      },
    });

    if (!api) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ api });
  } catch (error) {
    console.error("GET_API_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireUser();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await params;

    const existingApi = await db.api.findFirst({
      where: {
        id,
        ownerId: auth.userId,
      },
    });

    if (!existingApi) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const result = updateApiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const api = await db.api.update({
      where: {
        id,
      },
      data: result.data,
    });

    return NextResponse.json({
      message: "API updated",
      api,
    });
  } catch (error) {
    console.error("UPDATE_API_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

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

    const existingApi = await db.api.findFirst({
      where: {
        id,
        ownerId: auth.userId,
      },
    });

    if (!existingApi) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    await db.api.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "API deleted",
    });
  } catch (error) {
    console.error("DELETE_API_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}