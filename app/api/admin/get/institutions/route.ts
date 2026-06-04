import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function POST(req: Request) {
    try {
        const [institutions] = await db.query(`
            SELECT * FROM institutions
        `);
        return NextResponse.json({ institutions });
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Database error occurred" });
    }
}
