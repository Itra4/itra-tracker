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
      select: { pdfFileName: true, pdfData: true },
    });

    if (!shipment?.pdfData) {
      return NextResponse.json({ error: "No PDF found" }, { status: 404 });
    }

    const buffer = Buffer.from(shipment.pdfData, "base64");
    const fileName = shipment.pdfFileName || "buyer-report.pdf";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json(
      { error: "Failed to load PDF" },
      { status: 500 }
    );
  }
}