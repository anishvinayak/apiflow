import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";

export async function GET() {
  try {
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    const { userId } = auth;

    // Get user's APIs
    const apis = await db.api.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const apiIds = apis.map((api) => api.id);

    // Total API keys
    const totalApiKeys = await db.apiKey.count({
      where: {
        userId,
      },
    });

    // Total requests
    const totalRequests = await db.apiRequest.count({
      where: {
        userId,
      },
    });

    // Successful requests: 2xx
    const successfulRequests = await db.apiRequest.count({
      where: {
        userId,
        statusCode: {
          gte: 200,
          lt: 300,
        },
      },
    });

    // Failed requests: 4xx + 5xx
    const failedRequests = await db.apiRequest.count({
      where: {
        userId,
        statusCode: {
          gte: 400,
        },
      },
    });

    // Average response time
    const responseStats = await db.apiRequest.aggregate({
      where: {
        userId,
      },
      _avg: {
        responseTime: true,
      },
    });

    // Requests per API
    const requestsPerApi = await Promise.all(
      apis.map(async (api) => {
        const count = await db.apiRequest.count({
          where: {
            userId,
            apiId: api.id,
          },
        });

        return {
          id: api.id,
          name: api.name,
          slug: api.slug,
          requests: count,
        };
      })
    );

    // Recent requests
    const recentRequests = await db.apiRequest.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        statusCode: true,
        responseTime: true,
        createdAt: true,
        api: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      overview: {
        totalApis: apis.length,
        totalApiKeys,
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime: Math.round(
          responseStats._avg.responseTime ?? 0
        ),
      },

      requestsPerApi,

      recentRequests,
    });
  } catch (error) {
    console.error("ANALYTICS_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}