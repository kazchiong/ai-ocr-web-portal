import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse body safely
    const body = await req.json();
    const { imageStr, ocrText, captureData, userId, institutionId } = body;

    // 2️⃣ Validate required fields
    if (!imageStr || !userId) {
      return NextResponse.json(
        { error: "Missing image or userId" },
        { status: 400 }
      );
    }

    // 3️⃣ Handle base64 safely
    if (!imageStr.includes(",")) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    const imageData = imageStr.split(",")[1];
    const buffer = Buffer.from(imageData, "base64");

    // 4️⃣ Ensure folder exists
    const dir = path.join(process.cwd(), "public/captures");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 5️⃣ Save image
    const fileName = `Capture_${Date.now()}.png`;
    const savePath = path.join(dir, fileName);
    fs.writeFileSync(savePath, buffer);

    // 6️⃣ Save capture
    const [result] = await db.query(
      `INSERT INTO captures (file_name, ocrText, user_id, institution_id)
       VALUES (?, ?, ?, ?)`,
      [fileName, ocrText ?? "", userId, institutionId ?? null]
    );

    const captureId = (result as any).insertId;

    // 7️⃣ Save capture_data (handle ARRAY correctly)
    if (Array.isArray(captureData) && captureData.length > 0) {
      const d = captureData[0]; // 🔥 important fix

      await db.query(
        `INSERT INTO capture_data
        (institution, medication, dosage, totalTabs, patientName, patientIc, captureId)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          d.institution ?? "",
          d.medication ?? "",
          d.dosage ?? "",
          d.totalTabs ?? 0,
          d.patientName ?? "",
          d.patientIc ?? "",
          captureId,
        ]
      );
    }

    // 8️⃣ ALWAYS return JSON
    return NextResponse.json({
      success: true,
      file: `/captures/${fileName}`,
    });

  } catch (error) {
    console.error("Upload error:", error);

    // 9️⃣ ALWAYS return JSON on error
    return NextResponse.json(
      { error: "Failed to save capture" },
      { status: 500 }
    );
  }
}
