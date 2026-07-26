import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { dateShipped, category, downstreamVendor, weightLbs, note } = body;

    if (!dateShipped || !category || !downstreamVendor) {
      return NextResponse.json(
        { error: "Date, Category, and Downstream Vendor are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const outbound = await prisma.outboundShipment.create({
      data: {
        dateShipped: new Date(dateShipped),
        category,
        downstreamVendor,
        weightLbs: weightLbs ? parseFloat(weightLbs) : null,
        note: note || null,
        createdById: userId,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: "CREATED_OUTBOUND",
        details: `Created outbound: ${category} to ${downstreamVendor}`,
        entityType: "OutboundShipment",
        entityId: outbound.id,
      },
    });

    return NextResponse.json(outbound, { status: 201 });
  } catch (error) {
    console.error("Error creating outbound shipment:", error);
    return NextResponse.json(
      { error: "Failed to create outbound shipment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shipments = await prisma.outboundShipment.findMany({
      orderBy: { dateShipped: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
        lineItems: true,
      },
      take: 100,
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error("Error fetching outbound shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch outbound shipments" },
      { status: 500 }
    );
  }
}
