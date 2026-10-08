import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

export async function requireUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { userId };
}