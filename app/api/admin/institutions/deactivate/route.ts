import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  if(body.action == "activate"){
    await db.query("UPDATE institutions SET active = 1 WHERE id = ?", [body.id]);
  }
  else if(body.action == "deactivate"){
    await db.query("UPDATE institutions SET active = 0 WHERE id = ?", [body.id]);
  }
  else{
    return NextResponse.json({ success: false });
  }
  return NextResponse.json({ success: true });
}
