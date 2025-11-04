import { userModel } from "@/model/user"
import { NextResponse } from "next/server"
import jwt from 'jsonwebtoken'
import database from "@/database/database"
import crypto from "crypto";
import { projectModel } from "@/model/project"
import { authenticUserDataLoggedIn } from "@/lib/LoggedInUsers"
import { serviceModel } from "@/model/service";

export async function POST(req, { params }) {
  try {
    const { projId } = await params
    const authCheck = await authenticUserDataLoggedIn();
    if (!authCheck.success)
      return NextResponse.json({ message: "Not Authenticated", success: false });

    const user = authCheck.user;
    const { serviceName, subServiceName } = await req.json();
    await database();

// console.log(`${process.env.NextJsBaseUrl}/api/tenant/authentication/test`)
    // Step 1: Create project service
    const createProjectSchema = await serviceModel.create({
     
      user: user._id,
      subscriptionType: user.subscriptionType,
      subServiceName,
      serviceName,
      project:projId,
      apiEndPoint:`${process.env.NextJsBaseUrl}/api/tenant/authentication/signin`
    });


    await createProjectSchema.save();
    
    const updateUser = await projectModel.findByIdAndUpdate(projId, { $addToSet: { typeOfService: createProjectSchema?._id } }, { new: true })
    return NextResponse.json({
      message: "Project service created successfully",
createProjectSchema,
      success: true,
      projectServiceId: createProjectSchema?._id
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Server Error",
      status: 500,
      success: false,
    });
  }
}