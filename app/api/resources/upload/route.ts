import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const courseId = formData.get("courseId") as string;

    if (!file || !title || !type) {
      return NextResponse.json(
        { error: "Fichier, titre et type requis" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Seuls PDF et fichiers texte sont acceptés" },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer).toString("base64");

    // Create resource
    const resource = await prisma.resources.create({
      data: {
        title,
        type: type === "PDF" ? "PDF" : "TEXT",
        content,
        fileName: file.name,
        fileSize: file.size,
        userId: session.user.id as string,
      },
    });

    // If courseId provided, associate with course
    if (courseId) {
      await prisma.courseResources.create({
        data: {
          courseId,
          resourceId: resource.id,
        },
      });
    }

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
