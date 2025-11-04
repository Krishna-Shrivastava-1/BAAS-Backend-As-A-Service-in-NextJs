import { userModel } from "@/model/user"
import { NextResponse } from "next/server"
import jwt from 'jsonwebtoken'
import database from "@/database/database"
import crypto from "crypto";
import { projectModel } from "@/model/project"
import { authenticUserDataLoggedIn } from "@/lib/LoggedInUsers"

export async function POST(req) {
  try {
    const authCheck = await authenticUserDataLoggedIn();
    if (!authCheck.success)
      return NextResponse.json({ message: "Not Authenticated", success: false });

    const user = authCheck.user;
    const { allowedOrigins,title, mongoDbUri } = await req.json();
    await database();

    if (!title || !mongoDbUri || !allowedOrigins)
      return NextResponse.json({
        message: "Please Fill All Fields",
        status: 403,
        success: false,
      });
    let testConnection;
    try {
      testConnection = await mongoose.createConnection(mongoDbUri).asPromise();
      await testConnection.db.admin().ping(); // check if actually reachable
      // console.log("✅ MongoDB URI is valid");
      await testConnection.close();
    } catch (error) {
      // console.error("❌ Invalid MongoDB URI:", error.message);
      return NextResponse.json(
        { message: "Invalid or unreachable MongoDB URI", success: false },
        { status: 400 }
      );
    }
    // Step 1: Create project
    const createProject = await projectModel.create({
      title,
      mongoDbUri,
      allowedOrigins,
      user: user._id,
      subscriptionType: user.subscriptionType,
    });

    // Step 2: Create unique API key (signed)
    const payload = {
      userId: user._id,
      projectId: createProject._id,
      plan: user.subscriptionType,
    };

    const apiKey = jwt.sign(payload, process.env.SecretKey, {
      expiresIn: "90d", // optional
    });

    // Optional: add random prefix for security
    const finalKey = `sk_${crypto.randomBytes(4).toString("hex")}_${apiKey}`;

    // Step 3: Save it in DB
    createProject.apiKey = finalKey;
    await createProject.save();
const updateUser = await userModel.findByIdAndUpdate(user?._id,{$addToSet:{projects:createProject?._id}},{new : true})
    return NextResponse.json({
      message: "Project created successfully",
      apiKey: finalKey,
      success: true,
      projectId:createProject?._id
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: error.message.includes('duplicate') ? "Invalid MongoDB URI" : "Server having some issue but it's not oyu fault.",
      status: 500,
      success: false,
    });
  }
}