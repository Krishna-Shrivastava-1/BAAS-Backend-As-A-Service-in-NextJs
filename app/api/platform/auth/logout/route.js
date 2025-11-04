import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.set("authtoken", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return NextResponse.json({ success: true, message: "Logged out" });
}
