import openai from "./openai";

// Use OpenAI Vision (Responses API) to read text from the uploaded image
export async function runOCR(buf: Buffer, mimeType?: string): Promise<string> {
    
    if (buf.byteLength > 5 * 1024 * 1024) { 
        throw new Error("Image too large. Please upload an image under 5MB.");
    }
    
    // Use the actual uploaded file MIME type if possible
    const safeMime =
        typeof mimeType === "string" && mimeType.startsWith("image/")
            ? mimeType
            : "image/png"; // fallback

    const base64 = buf.toString("base64");
    const dataUrl = `data:${safeMime};base64,${base64}`;

    // 2. asking OpenAI to act like a OCR engine
    // construct prompt asking AI to do OCR
    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0,
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text:
                            "You are an OCR engine. Read all the legible text from this prescription image and return ONLY the raw text, line by line. " +
                            "Do NOT add explanations. Do NOT correct anything. " +
                            "Do not skip short lines. " +
                            "Just output exactly what you see.",
                    },
                    {
                        type: "input_image",
                        image_url: dataUrl, // string, not { url: ... }
                        detail: "high",
                    },
                ],
            },
        ],
    });

    // 3. debug log to test
    console.log("OCR text length:", (response.output_text ?? "").length);

    // 4. extract text from the response
    const text = response.output_text;
    if (!text) throw new Error("OCR: model returned no text.");
    return text.trim();
}


// This evaluates OCR TEXT QUALITY only, not parsed fields.
export async function rateOCRConfidence(ocrText: string): Promise<number> {
    const prompt = `
    Given the following OCR output text from a prescription image,
    rate how confident you are that this text accurately reflects
    what is written in the image.

    Return ONLY a single number between 0 and 1 (example: 0.82).
    Do not include explanations or extra text.

    Lower confidence if:
    - text is very short
    - many garbled symbols or random characters
    - structure looks broken or incomplete

    Higher confidence if:
    - text is readable
    - prescription structure looks consistent

    OCR text:
    ${ocrText}
`;
    
    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0,
        input: prompt,
    });

    const raw = (response.output_text ?? "").trim();
    const score = Number(raw);

    // safe fallback
    if (!Number.isFinite(score)) return 0.5;

    return Math.max(0, Math.min(1, score));
}
