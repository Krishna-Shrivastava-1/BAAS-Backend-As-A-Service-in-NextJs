import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(req) {
  const token = req.cookies.get("authtoken")?.value;
  const url = req.nextUrl.clone();
  const secretKey = process.env.SecretKey;

  // Public pages that anyone can visit
  const publicPaths = ["/", "/sign-up", "/sign-in"];

  try {
    // If the user has a valid token
    if (token) {
      const payload = jwt.verify(token, secretKey);

      // 🔒 Already logged in → redirect away from /sign-in
    if (["/sign-in", "/sign-up"].includes(url.pathname)) {
  if (payload.role === "user") return NextResponse.redirect(new URL("/home", req.url));
  if (payload.role === "master") return NextResponse.redirect(new URL("/admin", req.url));
}

      // 🔐 Role-based access
      if (url.pathname.startsWith("/home") && payload.role !== "user") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (url.pathname.startsWith("/admin") && payload.role !== "master") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // ✅ Allow access if token is valid
      return NextResponse.next();
    }

    // ❌ No token → redirect to /sign-in for protected pages only
    if (!token && !publicPaths.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // ✅ Allow public pages for unauthenticated users
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/home/:path*", "/sign-in","/sign-up"], // ✅ leading slash required
};
