import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Type for user object
interface UserPayload {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  role_id?: number;
  institution_id?: number;
}

export async function POST() {
  try {
    // Read the HttpOnly cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    // Verify JWT
    const user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    // Return only safe fields
    const safeUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      institution_id: user.institution_id,
    };
    return NextResponse.json({ loggedIn: true, user: safeUser });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ loggedIn: false });
  }
}
