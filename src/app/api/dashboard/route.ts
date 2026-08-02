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

    // Inbound this month (count)
    const inboundThisMonth = await prisma.inboundLoad.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Inbound weight this month (for mass balance)
    const inboundWithWeight = await prisma.inboundLoad.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        weightLbs: { not: null },
      },
      select: { weightLbs: true },
    });
    const totalInboundLbsThisMonth = inboundWithWeight.reduce(
      (sum, l) => sum + (l.weightLbs || 0),
      0
    );

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

    const varianceThisMonth = totalInboundLbsThisMonth - totalOutboundLbs;

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
      select: {
        weightLbs: true,
        settlementAmount: true,
        category: true,
        downstreamVendor: true,
      },
    });
    const totalOutboundLbsAllTime = allOutbound.reduce(
      (sum, s) => sum + (s.weightLbs || 0),
      0
    );

    // Best Buyer by Category
    type VendorStats = { totalLbs: number; totalDollars: number; loads: number };
    const categoryVendorMap: Record<string, Record<string, VendorStats>> = {};

    for (const s of allOutbound) {
      if (
        s.weightLbs != null &&
        s.weightLbs > 0 &&
        s.settlementAmount != null &&
        s.settlementAmount > 0
      ) {
        if (!categoryVendorMap[s.category]) categoryVendorMap[s.category] = {};
        if (!categoryVendorMap[s.category][s.downstreamVendor]) {
          categoryVendorMap[s.category][s.downstreamVendor] = {
            totalLbs: 0,
            totalDollars: 0,
            loads: 0,
          };
        }
        const entry = categoryVendorMap[s.category][s.downstreamVendor];
        entry.total
cat > src/app/api/dashboard/route.ts << 'EOF'
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

    // Inbound this month (count)
    const inboundThisMonth = await prisma.inboundLoad.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Inbound weight this month (for mass balance)
    const inboundWithWeight = await prisma.inboundLoad.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        weightLbs: { not: null },
      },
      select: { weightLbs: true },
    });
    const totalInboundLbsThisMonth = inboundWithWeight.reduce(
      (sum, l) => sum + (l.weightLbs || 0),
      0
    );

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

    const varianceThisMonth = totalInboundLbsThisMonth - totalOutboundLbs;

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
      select: {
        weightLbs: true,
        settlementAmount: true,
        category: true,
        downstreamVendor: true,
      },
    });
    const totalOutboundLbsAllTime = allOutbound.reduce(
      (sum, s) => sum + (s.weightLbs || 0),
      0
    );

    // Best Buyer by Category
    type VendorStats = { totalLbs: number; totalDollars: number; loads: number };
    const categoryVendorMap: Record<string, Record<string, VendorStats>> = {};

    for (const s of allOutbound) {
      if (
        s.weightLbs != null &&
        s.weightLbs > 0 &&
        s.settlementAmount != null &&
        s.settlementAmount > 0
      ) {
        if (!categoryVendorMap[s.category]) categoryVendorMap[s.category] = {};
        if (!categoryVendorMap[s.category][s.downstreamVendor]) {
          categoryVendorMap[s.category][s.downstreamVendor] = {
            totalLbs: 0,
            totalDollars: 0,
            loads: 0,
          };
        }
        const entry = categoryVendorMap[s.category][s.downstreamVendor];
        entry.totalLbs += s.weightLbs;
        entry.totalDollars += s.settlementAmount;
        entry.loads += 1;
      }
    }

    const bestBuyerByCategory: {
      category: string;
      bestBuyer: string;
      avgPerLb: number;
      loads: number;
      totalLbs: number;
    }[] = [];

    for (const [category, vendors] of Object.entries(categoryVendorMap)) {
      let best: { buyer: string; avgPerLb: number; loads: number; totalLbs: number } | null = null;
      for (const [buyer, stats] of Object.entries(vendors)) {
        const avg = stats.totalDollars / stats.totalLbs;
        if (!best || avg > best.avgPerLb) {
          best = { buyer, avgPerLb: avg, loads: stats.loads, totalLbs: stats.totalLbs };
        }
      }
      if (best) {
        bestBuyerByCategory.push({
          category,
          bestBuyer: best.buyer,
          avgPerLb: Math.round(best.avgPerLb * 100) / 100,
          loads: best.loads,
          totalLbs: Math.round(best.totalLbs * 10) / 10,
        });
      }
    }
    bestBuyerByCategory.sort((a, b) => b.avgPerLb - a.avgPerLb);

    return NextResponse.json({
      inboundThisMonth,
      totalOutboundLbsThisMonth: totalOutboundLbs,
      totalInboundLbsThisMonth: Math.round(totalInboundLbsThisMonth * 10) / 10,
      varianceThisMonth: Math.round(varianceThisMonth * 10) / 10,
      byCategory,
      byVendor,
      totalInboundAllTime,
      totalOutboundLbsAllTime,
      bestBuyerByCategory,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
