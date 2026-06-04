import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function saveImageFromFile(file: File) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const mime = file.type || "";

    const extMap: Record<string, string> = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/webp": ".webp",
        "image/heic": ".heic",
        "image/heif": ".heif",
        "image/bmp": ".bmp",
        "image/tiff": ".tif",
        "image/gif": ".gif",
        "image/avif": ".avif",
    };

    // 1) prefer MIME mapping
    let ext = extMap[mime];

    // 2) if unknown MIME, try keep the original filename extension (e.g. ".png")
    if (!ext) {
        const nameExt = path.extname(file.name || "").toLowerCase();
        if (nameExt) ext = nameExt;
    }

    // 3) final fallback
    if (!ext) ext = ".img";

    const filename = randomUUID() + ext;
    const fullPath = path.join(uploadsDir, filename);

    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return { publicUrl, fullPath };
}
