import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
export async function POST(req: Request) {
    try {
        const [roles] = await db.query(`
            SELECT * FROM roles
        `);

        return NextResponse.json({ roles });
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Database error occurred" });
    }
}
