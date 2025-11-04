import { userModel } from "@/model/user"
import { NextResponse } from "next/server"
import bcrypt from 'bcryptjs'
import database from "@/database/database"
export async function POST(req,res) {
    try {
        const {email,name,password} =await req.json()
        await database()
        if(!email || !name || !password){
            return NextResponse.json({
                 message: "Please Fill All Fields",
                status:403,
                success:false
            })
        }
        const checkUserExist = await userModel.findOne({email})
        if(checkUserExist){
            return NextResponse.json({
                message:'Invalid Creds',
                status:400,
                success:false
            })
        }
        const hashPassword =await bcrypt.hash(password,12)
        const createUser = await userModel.create({
            name,
            email,
            password:hashPassword
        })
        if(!createUser){
            return NextResponse.json({
                message:'Error While Creating User Try Later',
                success:false,
                status:400
            })
        }
        return NextResponse.json({
            message:'Regstered Successfully',
            status:200,
            success:true
        })
    } catch (error) {
        console.log(error.message)
        return NextResponse.json({
            message:'Server Error',
            status:500,
            success:false
        })
    }
}