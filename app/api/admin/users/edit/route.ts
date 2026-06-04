import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface Body {
  action: "get" | "update";
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id?: number;
  institution_id?: number;
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = jwt.verify(token, process.env.JWT_SECRET!) as Body;

    const body: Body = await req.json();
    const { action, id } = body;

    if (user.id === id) {
      return NextResponse.json(
        { error: "You cannot edit your own account." },
        { status: 403 }
      );
    }
    if (user.role_id == 2) {
      const [rows]: any = await db.query(
        "SELECT institution_id FROM users WHERE id = ?",
        [id]
      );

      let editUser = null;
      if (rows.length) {
        editUser = rows[0];
      }
      if(editUser == null){
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if(user.institution_id != editUser.institution_id){
        return NextResponse.json({ error: "Trying to be funny?" }, { status: 405 });
        }
    }
    if (action === "get") {
      const [rows]: any = await db.query(
        "SELECT id, first_name, last_name, email, role_id, institution_id, created_at FROM users WHERE id = ?",
        [id]
      );

      if (!rows.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user: rows[0] });
    }

    if (action === "update") {
      const { first_name, last_name, email, role_id, institution_id } = body;
      await db.query(
        `UPDATE users SET first_name=?, last_name=?, email=?, role_id=?, institution_id=? WHERE id = ?`,
        [first_name, last_name, email, role_id, institution_id, id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
