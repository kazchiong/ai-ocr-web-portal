import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { saveImageFromFile } from "@/app/lib/save-file";
import { runOCR, rateOCRConfidence } from "@/app/lib/ocr";
import { extractCombined } from "@/app/lib/parsing";

export const runtime = "nodejs";

// POST /api/captures -> upload image(s), OCR, parse, save to DB
export async function POST(req: Request) {
    try {
        const form = await req.formData();

        // allow multiple images with the same key "image"
        const all = form.getAll("image");

        const files = all.filter((x): x is File => x instanceof File);

        if (files.length === 0) {
            return NextResponse.json(
                {
                    error:
                        'image (File) is required in multipart/form-data with key "image"',
                },
                { status: 400 }
            );
        }

        // process at most 2 images (as requested)
        // const toProcess = files.slice(0, 2);

        // helper to process one image end-to-end
        async function processOne(image: File) {
            // accept all image/* types only
            if (typeof image.type !== "string" || !image.type.startsWith("image/")) {
                return {
                    ok: false,
                    error: `Unsupported file type: ${image.type || "(missing type)"}`,
                };
            }

            // 1) save image to /public/uploads
            const { publicUrl } = await saveImageFromFile(image);

            // 2) run OCR using OpenAI Vision
            const buf = Buffer.from(await image.arrayBuffer());
            const ocrText = await runOCR(buf, image.type);
            const ocrConfidence = await rateOCRConfidence(ocrText);

            // 3) use AI + regex to extract structured information
            const {
                institution,
                medication,
                dosage,
                medicationDisplay: parsedMedicationDisplay,
                totalTabs,
                patientName,
                patientIc,
            } = await extractCombined(ocrText);

            // 4) insert into MySQL Capture table
            // const [result]: any = await db.execute(
            //     `
            //         INSERT INTO Capture_data (
            //             ocrText,
            //             institution,
            //             medication,
            //             dosage,
            //             totalTabs,
            //             patientName,
            //             patientIc
            //         )
            //         VALUES (?, ?, ?, ?, ?, ?, ?)
            //     `,
            //     [
            //         //publicUrl,
            //         ocrText,
            //         institution,
            //         medication,
            //         dosage,
            //         totalTabs,
            //         patientName,
            //         patientIc,
            //     ]
            // );

            //const insertedId = result.insertId;

            // combine medication + dosage for display purposes
            const medicationDisplay = parsedMedicationDisplay ? parsedMedicationDisplay: (medication && dosage ? `${medication} ${dosage}` : medication);

            return {
                ok: true,
                capture: {
                    //imageUrl: publicUrl,
                    ocrText,
                    ocrConfidence,
                    institution,
                    medication,
                    dosage,
                    medicationDisplay,
                    totalTabs,
                    patientName,
                    patientIc,
                },
                parsed: {
                    ocrConfidence,
                    institution,
                    medication,
                    dosage,
                    totalTabs,
                    patientName,
                    patientIc,
                },
            };
        }

        const settled = await Promise.allSettled(files.map(processOne));

        const results = settled.map((r, idx) => {
            const meta = { _idx: idx, _name: files[idx].name };

            if (r.status === "fulfilled") return { ...r.value, ...meta };

            return {
                ok: false,
                ...meta,
                error: r.reason?.message ?? String(r.reason),
            };
        });


        const anySuccess = results.some((r) => r.ok);
        const allFailed = results.every((r) => !r.ok);

        return NextResponse.json(
            {
                ok: anySuccess,
                processed: files.length,
                results,
            },
            { status: allFailed ? 500 : 201 }
        );
    
    } 
    
    catch (error: any) {
        console.error("POST /api/captures error:", error);
        return NextResponse.json(
            {
                error: "Insert failed",
                detail: error?.message ?? String(error),
            },
            { status: 500 }
        );
    }
}

// GET /api/captures -> list last 50 rows
export async function GET() {
    try {
        const [rows]: any = await db.query(
            "SELECT * FROM Capture_data ORDER BY id DESC LIMIT 50"
        );
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error("GET /api/captures error:", error);
        return NextResponse.json(
            {
                error: "DB read failed",
                detail: error?.message ?? String(error),
            },
            { status: 500 }
        );
    }
}
