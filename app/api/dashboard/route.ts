import { prisma } from "@/lib/prisma";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(lucia.sessionCookieName);

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionCookie.value);

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stats
    const totalIssues = await prisma.issues.count({
      where: { userId: user.id },
    });

    // Get user's reported issues
    const userIssuesRaw = await prisma.issues.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const userIssues = userIssuesRaw.map((issue) => ({
      ...issue,
      created_at: issue.createdAt,
    }));

    // Get member since from user record
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true, name: true }
    });

    return NextResponse.json({
      fullName: dbUser?.name || "User",
      totalIssues,
      memberSince: dbUser?.createdAt,
      userIssues,
      impactLevel: totalIssues ? Math.min(totalIssues * 10, 100) : 0,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
