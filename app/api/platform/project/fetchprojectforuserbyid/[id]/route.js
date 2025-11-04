import { authenticateUser } from "@/lib/Authenticator"
import { projectModel } from "@/model/project"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
    try {
        const loggedUserCheck = await authenticateUser()
        if (!loggedUserCheck?.success) {
            return NextResponse.json({
                message: 'User not authenticated',
                success: false
            })
        }
        const { id } = await params
        const userProject = await projectModel.findById(id)
        if (!userProject) {
            return NextResponse.json({
                message: 'Project not found',
                status: 404,
                success: false
            })
        }
        return NextResponse.json({
            message: 'Project found',
            projectData: userProject,
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