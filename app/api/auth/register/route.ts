import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("REGISTER BODY:", body);

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      console.log("REGISTER VALIDATION ERROR:", result.error);

      return NextResponse.json(
        {
          error: "Invalid email or password",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}