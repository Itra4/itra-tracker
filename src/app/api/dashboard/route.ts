import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Inbound this month
    const inboundThisMonth = await prisma.inboundLoad.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Outbound weight this month
    const outboundThisMonth = await prisma.outboundShipment.findMany({
      where: {
        dateShipped: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        weightLbs: true,
        category: true,
        downstreamVendor: true,
      },
    });

    const totalOutboundLbs = outboundThisMonth.reduce(
      (sum, s) => sum + (s.weightLbs || 0),
      0
    );

    // Weight by category (this month)
    const byCategory: Record<string, number> = {};
    for (const s of outboundThisMonth) {
      if (s.weightLbs) {
        byCategory[s.category] = (byCategory[s.category] || 0) + s.weightLbs;
      }
    }

    // Weight by vendor (this month)
    const byVendor: Record<string, number> = {};
    for (const s of outboundThisMonth) {
      if (s.weightLbs) {
        byVendor[s.downstreamVendor] =
          (byVendor[s.downstreamVendor] || 0) + s.weightLbs;
      }
    }

    // All-time quick totals
    const totalInboundAllTime = await prisma.inboundLoad.count();
    const allOutbound = await prisma.outboundShipment.findMany({
      select: { weightLbs: true },
    });
    const totalOutboundLbsAllTime = allOutbound.reduce(
      (sum, s) => sum + (s.weightLbs || 0),
      0
    );

    return NextResponse.json({
      inboundThisMonth,
      totalOutboundLbsThisMonth: totalOutboundLbs,
      byCategory,
      byVendor,
      totalInboundAllTime,
      totalOutboundLbsAllTime,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
