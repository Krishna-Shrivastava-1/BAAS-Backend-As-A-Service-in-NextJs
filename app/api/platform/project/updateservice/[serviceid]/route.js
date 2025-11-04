import { authenticateUser } from "@/lib/Authenticator"
import { projectModel } from "@/model/project"
import { serviceModel } from "@/model/service"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    try {
        const loggedUserCheck = await authenticateUser()
        if (!loggedUserCheck?.success) {
            return NextResponse.json({
                message: 'User not authenticated',
                success: false
            })
        }
        const {subservicename}=await req.json()
        const { serviceid } = await params
        const updateservice = await serviceModel.findByIdAndUpdate(serviceid, { $addToSet: { subServiceName: subservicename } },{new : true})
        if (!updateservice) {
            return NextResponse.json({
                message: 'No Service Updates',
                status: 404,
                success: true
            })
        }
        return NextResponse.json({
            message: 'Project Service Updated',
            projectServiceDataUpdated: updateservice,
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