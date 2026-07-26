import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const document = await prisma.controlledDocument.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: { select: { name: true } },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
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

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    // Support both JSON and FormData (for file upload)
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        currentVersion: formData.get("currentVersion") as string,
        status: formData.get("status") as string,
        changeDescription: formData.get("changeDescription") as string,
        approvedBy: formData.get("approvedBy") as string,
      };
      file = formData.get("file") as File | null;
    } else {
      body = await req.json();
    }

    let fileName: string | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), "public", "documents");
      await mkdir(uploadsDir, { recursive: true });
      fileName = `${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      await writeFile(path.join(uploadsDir, fileName), buffer);
    }

    // Update the main document record
    const updated = await prisma.controlledDocument.update({
      where: { id },
      data: {
        currentVersion: body.currentVersion || undefined,
        status: body.status || undefined,
        currentFileName: fileName || undefined,
      },
    });

    // Create a new version history entry
    if (body.currentVersion || body.changeDescription) {
      await prisma.documentVersion.create({
        data: {
          controlledDocumentId: id,
          version: body.currentVersion || updated.currentVersion,
          changeDescription: body.changeDescription || "Updated",
          changedById: userId,
          approvedBy: body.approvedBy || null,
          fileName: fileName || null,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: "UPDATED_DOCUMENT",
        details: `Updated document ${updated.documentNumber} to v${updated.currentVersion}`,
        entityType: "ControlledDocument",
        entityId: id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
