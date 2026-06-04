import { db } from "@/app/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
      const token = (await cookies()).get("token")?.value;
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
  
  const { id } = await req.json();
  if (user.role_id == 2) {
      const [rows]: any = await db.query(
        "SELECT institution_id FROM users WHERE id = ?",
        [id]
      );

      let editUser = null;
      if (rows.length) {
        editUser = rows[0];
      }

      if(user.institution_id != editUser.institution_id && editUser != null){
        return NextResponse.json({ error: "Trying to be funny?" }, { status: 405 });
        }
    }
  console.log("Deleting user:", id);

  await db.query("DELETE FROM users WHERE id = ?", [id]);

  return NextResponse.json({ success: true });
}
