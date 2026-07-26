import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Update the shipment with the PDF filename
    await prisma.outboundShipment.update({
      where: { id },
      data: { pdfFileName: fileName },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "UPLOADED_PDF",
        details: `Uploaded buyer PDF for outbound ${id}: ${file.name}`,
        entityType: "OutboundShipment",
        entityId: id,
      },
    });

    // For now we return success.
    // Automatic line-item extraction will be added in a later improvement
    // once we can reliably test against real eSCO PDFs on your Mac.
    return NextResponse.json({
      success: true,
      fileName,
      message:
        "PDF uploaded successfully. Please enter the weight manually for now. Automatic extraction will be improved next.",
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
