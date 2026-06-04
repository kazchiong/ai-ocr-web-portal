import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

  try {
    let sql = `
      SELECT 
        users.id,
        users.first_name,
        users.last_name,
        users.email,
        roles.role_name AS role,
        institutions.name AS institution,
        users.created_at
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
      LEFT JOIN institutions ON users.institution_id = institutions.id
    `;

    const params: any[] = [];

    // 🔥 Add WHERE only if not role 3
    if (user.role_id !== 3) {
      sql += ` WHERE users.institution_id = ?`;
      params.push(user.institution_id);
    }

    const [users] = await db.query(sql, params);
    return NextResponse.json({ users });
  } 

  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
  }
}
