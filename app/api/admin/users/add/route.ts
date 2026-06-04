import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (user.role_id == 1) {
      return NextResponse.json(
        { message: "You should know better..." },
        { status: 405 }
      );
    }    const { email, password, first_name, last_name } = await req.json();

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
    const email_prefix = lower_email.split("@")[1];

    const [rows] = await db.query(
      "SELECT id FROM institutions WHERE prefix = ?",
      [email_prefix]
    ) as any;
    const institution_id = rows.length > 0 ? rows[0].id : null; // or throw error

    if (institution_id == null){
      return NextResponse.json(
      { message: "The email address you have provided is not valid!" },
      { status: 400 }
    );
    }
    if(institution_id !== user.institution_id && user.role_id !==3){
      return NextResponse.json(
      { message: "You cannot create a user that is not from your institution!" },
      { status: 400 }
      )
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user
    await db.query(
      "INSERT INTO users (email, password, first_name, last_name, institution_id) VALUES (?, ?, ?, ?, ?)",
      [lower_email, hashedPassword, first_name, last_name,institution_id]
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
