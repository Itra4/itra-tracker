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
    const { date, clientSource, approximateSize, weightLbs, notes } = body;

    if (!date || !clientSource || !approximateSize) {
      return NextResponse.json(
        { error: "Date, Client/Source, and Quantity are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const inbound = await prisma.inboundLoad.create({
      data: {
        date: new Date(date),
        clientSource,
        approximateSize,
        weightLbs:
          weightLbs !== undefined && weightLbs !== null && weightLbs !== ""
            ? parseFloat(weightLbs)
            : null,
        notes: notes || null,
        createdById: userId,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "CREATED_INBOUND",
        details: `Created inbound load from ${clientSource} (${approximateSize})${
          weightLbs ? ` – ${weightLbs} lbs` : ""
        }`,
        entityType: "InboundLoad",
        entityId: inbound.id,
      },
    });

    return NextResponse.json(inbound, { status: 201 });
  } catch (error) {
    console.error("Error creating inbound load:", error);
    return NextResponse.json(
      { error: "Failed to create inbound load" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loads = await prisma.inboundLoad.findMany({
      orderBy: { date: "desc" },
      include: {
        createdBy: {
          select: { name: true },
        },
      },
      take: 100,
    });

    return NextResponse.json(loads);
  } catch (error) {
    console.error("Error fetching inbound loads:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbound loads" },
      { status: 500 }
    );
  }
}
