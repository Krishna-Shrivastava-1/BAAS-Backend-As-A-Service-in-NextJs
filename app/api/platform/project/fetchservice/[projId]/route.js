import { authenticateUser } from "@/lib/Authenticator"
import { projectModel } from "@/model/project"
import { serviceModel } from "@/model/service"
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
        const { projId } = await params
        const userProjectService = await serviceModel.find({project:projId})
        if (!userProjectService) {
            return NextResponse.json({
                message: 'No Service Found',
                status: 404,
                success: true
            })
        }
        return NextResponse.json({
            message: 'Project Service found',
            projectServiceData: userProjectService,
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