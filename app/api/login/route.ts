import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const lower_email = email.toLowerCase();

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [lower_email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Remove sensitive data
    const safeUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      institution_id: user.institution_id,
    };

    const token = jwt.sign(
      safeUser,
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json(
      { message: "Login successful", user: safeUser },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
