import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/api-key";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
     console.log("🔥 GATEWAY ROUTE HIT");
  try {
    const { slug } = await params;

    // 1. Get API key
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    // 2. Hash API key
    const keyHash = hashApiKey(apiKey);

    // 3. Find API key
    const keyRecord = await db.apiKey.findUnique({
      where: { keyHash },
      include: { api: true },
    });

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // 4. Check API key status
    if (keyRecord.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "API key has been revoked" },
        { status: 401 }
      );
    }

    // 5. Check API association
    if (!keyRecord.api) {
      return NextResponse.json(
        { error: "API key is not attached to an API" },
        { status: 404 }
      );
    }

    // 6. Check slug
    if (keyRecord.api.slug !== slug) {
      return NextResponse.json(
        {
          error: "API not found",
        },
        { status: 404 }
      );
    }

    // 7. RATE LIMIT
    const rateLimit = await checkRateLimit(keyRecord.id);

    console.log("RATE LIMIT RESULT:", rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetIn: rateLimit.resetIn,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "Retry-After": String(rateLimit.resetIn),
          },
        }
      );
    }

    // 8. Read request body
    const body = await req.text();

    // 9. Start response timer
    const startTime = Date.now();

    // 10. Forward request to target API
    const response = await fetch(keyRecord.api.endpoint, {
      method: "POST",
      headers: {
        "Content-Type":
          req.headers.get("content-type") || "application/json",
      },
      body: body || undefined,
    });

    // 11. Calculate response time
    const responseTime = Date.now() - startTime;

    // 12. Read target response
    const responseText = await response.text();

    // 13. Save usage
    await db.apiRequest.create({
      data: {
        statusCode: response.status,
        responseTime,
        userId: keyRecord.userId,
        apiId: keyRecord.api.id,
        apiKeyId: keyRecord.id,
      },
    });

    // 14. Update API key usage
    await db.apiKey.update({
      where: {
        id: keyRecord.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });

    // 15. Return target API response
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",

        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetIn),
      },
    });
  } catch (error) {
    console.error("GATEWAY_ERROR:", error);

    return NextResponse.json(
      {
        error: "Gateway request failed",
      },
      { status: 500 }
    );
  }
}