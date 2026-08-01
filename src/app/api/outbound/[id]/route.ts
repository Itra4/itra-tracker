import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await prisma.outboundShipment.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        lineItems: true,
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error fetching outbound:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const userId = (session.user as any).id;

    const updated = await prisma.outboundShipment.update({
      where: { id },
      data: {
        weightLbs:
          body.weightLbs !== undefined
            ? body.weightLbs != null
              ? parseFloat(body.weightLbs)
              : null
            : undefined,
        settlementAmount:
          body.settlementAmount !== undefined
            ? body.settlementAmount != null && body.settlementAmount !== ""
              ? parseFloat(body.settlementAmount)
              : null
            : undefined,
        note: body.note !== undefined ? body.note : undefined,
        category: body.category || undefined,
        downstreamVendor: body.downstreamVendor || undefined,
        pdfFileName: body.pdfFileName || undefined,
      },
    });

    // If line items were extracted, replace them
    if (body.lineItems && Array.isArray(body.lineItems)) {
      await prisma.outboundLineItem.deleteMany({
        where: { outboundShipmentId: id },
      });

      if (body.lineItems.length > 0) {
        await prisma.outboundLineItem.createMany({
          data: body.lineItems.map((item: any) => ({
            outboundShipmentId: id,
            category: item.category,
            weightLbs: parseFloat(item.weightLbs),
          })),
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: "UPDATED_OUTBOUND",
        details: `Updated outbound shipment ${id}`,
        entityType: "OutboundShipment",
        entityId: id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating outbound:", error);
    return NextResponse.json(
      { error: "Failed to update shipment" },
      { status: 500 }
    );
  }
}
