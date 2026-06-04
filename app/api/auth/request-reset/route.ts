import { NextResponse } from "next/server";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { db } from "@/app/lib/db";
import { transporter } from "@/app/lib/mailer"; 

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `**@${domain}`;
  return `${name.slice(0, 2)}***${name.slice(-2)}@${domain}`;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = (rows as any[])[0];

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    if (user) {
      await db.query(
        "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE email=?",
        [token, expiry, email]
      );
    } else {
      // If user not found, still respond success (security)
      return NextResponse.json({
        success: true,
        message: `If this email exists, a password reset link has been sent to ${maskEmail(email)}.`,
      });
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    if (user) {
  try {
    await transporter.sendMail({
      from: `"MediVision AI" <${process.env.EMAIL_USER}>`,
      to: "jiaj04611@gmail.com", //IMPORTANT! as email does not exist, just send all emails to 
      subject: "Reset Your Password",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

  } catch (error) {
    console.error("Error sending reset email:", error);
  }
}


    return NextResponse.json({
      success: true,
      message: `If this email exists, a password reset link has been sent to ${maskEmail(email)}.`,
    });

  } catch (err) {
  console.error("Error in request-reset:", err);
  return NextResponse.json({ 
    success: false, 
    message: `Server error: ${err instanceof Error ? err.message : err}` 
  }, { status: 500 });
}}
