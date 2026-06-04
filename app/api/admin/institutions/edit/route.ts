import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

interface Body {
  action: "get" | "update";
  id: number;
  name?: string;
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { action, id } = body;

    if (action === "get") {
      const [rows]: any = await db.query(
        "SELECT id, name FROM institutions WHERE id = ?",
        [id]
      );

      if (!rows.length) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ institution: rows[0] });
    }

    if (action === "update") {
      const { name } = body;
      await db.query(
        `UPDATE institutions SET name=? WHERE id = ?`,
        [name, id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
