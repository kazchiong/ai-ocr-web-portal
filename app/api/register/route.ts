import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, first_name, last_name } = await req.json();

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { message: "Make sure no fields are empty!" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if ((existingUsers as any).length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const lower_email = email.toLowerCase();
    // Insert new user
    await db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      [lower_email, password, first_name, last_name]
    );

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
