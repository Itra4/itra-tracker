import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.controlledDocument.findMany({
      orderBy: { documentNumber: "asc" },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            changedBy: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin should create documents
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      documentNumber,
      title,
      currentVersion,
      status,
      changeDescription,
      approvedBy,
    } = body;

    if (!documentNumber || !title || !currentVersion) {
      return NextResponse.json(
        { error: "Document number, title, and version are required" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const document = await prisma.controlledDocument.create({
      data: {
        documentNumber,
        title,
        currentVersion,
        status: status || "DRAFT",
        versions: {
          create: {
            version: currentVersion,
            changeDescription: changeDescription || "Initial version",
            changedById: userId,
            approvedBy: approvedBy || null,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "CREATED_DOCUMENT",
        details: `Created document ${documentNumber} – ${title} (v${currentVersion})`,
        entityType: "ControlledDocument",
        entityId: document.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
