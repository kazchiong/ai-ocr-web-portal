import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
    const {capture_id} = await req.json();
    //delete from database
    await db.query(`DELETE FROM captures WHERE id = ?`,
        [capture_id]
    )
    return NextResponse.json({ success: true});
}
