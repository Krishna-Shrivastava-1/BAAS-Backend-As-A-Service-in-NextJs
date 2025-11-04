import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "@/model/user";
import database from "@/database/database";


const secretKey = process.env.SecretKey;
const secretAdminEmail = process.env.SecretEmail;
export async function POST(req) {
    try {
        const { email, password } = await req.json();
        await database();
        if (!email || !password) {
            return NextResponse.json({
                message: "Please Fill All Fields",
                error: 401,
                success: false,
            });
        }

        const user = await userModel.findOne({ email }).select('+password');
     
        if (!user) {
            return NextResponse.json({
                message: "Invalid Credential",
                // message: "User Not Found",
                success: false,
            });
        }

        const ispasswordcorrect = await bcrypt.compare(password, user?.password);
        if (!ispasswordcorrect) {
            return NextResponse.json({
                message: "Invalid Credential",
                success: false,
            });
        }
        const role = email === secretAdminEmail ? "master" : user?.role ;
          if (user) {
            await userModel.findByIdAndUpdate(user?._id, { role },{new:true});
        }
        const token = jwt.sign(
            {
                id: user?._id,
                role
            },
            secretKey,
            { expiresIn: "1d" }
        );
        
    
        const res = NextResponse.json({
            token: token,
            message: `Logged in Successfully`,
            // message: `Logged in Successfully User - ${user.name}`,
            success: true,
            role,
            _id: user?._id

        });
     
        // res.cookies.set("authtoken", token, {
        //     httpOnly: true,
        //     sameSite: "lax",
        //     path: "/",
        //     secure: process.env.NODE_ENV === "production",
        //     maxAge: 24 * 60 * 60,
        // });
res.cookies.set('authtoken', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' ? true : false,
  path: '/',
});


        return res

    } catch (error) {
        return NextResponse.json({
            message: "Server error",
            success: false,
        });
    }
}