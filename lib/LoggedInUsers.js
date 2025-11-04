// lib/authenticateUser.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { authenticateUser } from "./Authenticator";
import database from "@/database/database";
import { userModel } from "@/model/user";
import { NextResponse } from "next/server";

export async function authenticUserDataLoggedIn() {
const userId = await authenticateUser()
// console.log(userId?.id)
  try {
    await database()
    const userDat = await userModel.findById(userId?.id)
    if(!userDat) return NextResponse.json({messaege:'User Not Found',success:false,status:404})
    return { success: true,user:userDat,success:true,status:200};
  } catch (err) {
    return { success: false, status: 403, message: "Invalid token" };
  }
}
