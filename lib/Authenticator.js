// lib/authenticateUser.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function authenticateUser() {
  const token = (await cookies()).get("authtoken")?.value;
//   console.log('authenticator func' ,token)
  if (!token) return { success: false, status: 401, message: "Unauthorized" };

  try {
    const decoded = jwt.verify(token, process.env.SecretKey);
    return { success: true, id: decoded.id, role: decoded.role };
  } catch (err) {
    return { success: false, status: 403, message: "Invalid token" };
  }
}
