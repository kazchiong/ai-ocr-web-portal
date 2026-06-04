import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE reset_token=? AND reset_token_expiry>NOW()",
      [token]
    );
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?",
      [hashedPassword, user.id]
    );

    return NextResponse.json({ success: true, message: "Password has been reset successfully!" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
