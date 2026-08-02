import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "this-month";

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (range === "last-month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (range === "this-quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
    } else {
      // this-month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Inbound weights in range
    const inboundLoads = await prisma.inboundLoad.findMany({
      where: {
        date: { gte: start, lte: end },
        weightLbs: { not: null },
      },
      select: { weightLbs: true },
    });

    const totalInboundLbs = inboundLoads.reduce(
      (sum, l) => sum + (l.weightLbs || 0),
      0
    );

    // Outbound in range
    const outboundShipments = await prisma.outboundShipment.findMany({
      where: {
        dateShipped: { gte: start, lte: end },
      },
      select: {
        weightLbs: true,
        category: true,
      },
    });

    const totalOutboundLbs = outboundShipments.reduce(
      (sum, s) => sum + (s.weightLbs || 0),
      0
    );

    // Outbound by category
    const byCategory: Record<string, number> = {};
    for (const s of outboundShipments) {
      if (s.weightLbs) {
        byCategory[s.category] = (byCategory[s.category] || 0) + s.weightLbs;
      }
    }

    const variance = totalInboundLbs - totalOutboundLbs;

    return NextResponse.json({
      range,
      start: start.toISOString(),
      end: end.toISOString(),
      totalInboundLbs: Math.round(totalInboundLbs * 10) / 10,
      totalOutboundLbs: Math.round(totalOutboundLbs * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      inboundLoadCount: inboundLoads.length,
      outboundShipmentCount: outboundShipments.length,
      byCategory,
    });
  } catch (error) {
    console.error("Mass balance error:", error);
    return NextResponse.json(
      { error: "Failed to load mass balance data" },
      { status: 500 }
    );
  }
}
