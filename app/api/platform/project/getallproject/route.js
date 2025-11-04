import database from "@/database/database"
import { authenticateUser } from "@/lib/Authenticator"
import { projectModel } from "@/model/project"
import { NextResponse } from "next/server"

export async function GET(req,res) {
    try {
        const loggedUserCheck = await authenticateUser()
        if (!loggedUserCheck?.success) {
            return NextResponse.json({
                message: 'User not authenticated',
                success: false
            })
        }
     await database()
   const allProjects  =await projectModel.find({user:loggedUserCheck?.id})
        if (!allProjects) {
            return NextResponse.json({
                message: 'Project not found',
                status: 404,
                success: false
            })
        }
        return NextResponse.json({
            message: 'Project found',
            projectData: allProjects,
            success: true
        })

    } catch (error) {
        console.log(error.message)
        return NextResponse.json({
            message: 'Server Error',
            status: 500,
            success: false
        })
    }
}