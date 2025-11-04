import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { projectModel } from "@/model/project";
import { corsCheck } from "@/lib/middleware/corsCheck";

const secretKey = process.env.SecretKey;
export async function OPTIONS(req, { params }) {
  const origin = req.headers.get("origin") || "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
export async function POST(req) {
  try {
    // ---------------- STEP 1: Validate API Key ----------------
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Missing or invalid authorization header", success: false },
             {
    status: 401,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    const apiKey = authHeader.split(" ")[1];
    const tokenPart = apiKey.split("_")[2];

    if (!tokenPart) {
      return NextResponse.json(
        { message: "Invalid API key format", success: false },
            {
    status: 401,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    // ---------------- STEP 2: Decode Project Info ----------------
    let decoded;
    try {
      decoded = jwt.verify(tokenPart, secretKey);
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired API key", success: false },
             {
    status: 403,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    const { projectId } = decoded;
        // Step 2: CORS validation
    const corsResult = await corsCheck(req, projectId);
    if (!corsResult.allowed) {
      return new Response(JSON.stringify({
        message: "Origin not allowed",
        success: false
      }), {
        status: 403,
        headers: { "Access-Control-Allow-Origin": corsResult.origin },
      });
    }
    // ---------------- STEP 3: Find Project ----------------
    const project = await projectModel.findById(projectId).populate("typeOfService");
    if (!project) {
      return NextResponse.json(
        { message: "Project not found", success: false },
            {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    if (project.apiKey !== apiKey) {
      return NextResponse.json(
        { message: "Invalid API key", success: false },
           {
    status: 403,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }
// console.log(project)
    // ---------------- STEP 4: Identify Registration Service ----------------
    const service = project.typeOfService?.find(
      (svc) =>
        svc.subServiceName === "Registeration" ||
        svc.subServiceName?.includes("Registeration")
    );
// console.log(service)
    if (!service) {
      return NextResponse.json(
        { message: "No Sign in service found for this project", success: false },
            {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    // ---------------- STEP 5: Connect to Tenant DB ----------------
    const tenantDbUri = project.mongoDbUri;
    if (!tenantDbUri) {
      return NextResponse.json(
        { message: "Tenant MongoDB URI missing", success: false },
            {
    status: 500,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    const isAtlas = tenantDbUri.startsWith("mongodb+srv://");

    const tenantConnection =
      mongoose.connections.find((c) => c.name === project._id.toString()) ||
      (await mongoose.createConnection(tenantDbUri, {
        dbName: project._id.toString(),
        tls: isAtlas,
      }));

    // ---------------- STEP 6: Get Existing Tenant Collection ----------------
  
 
    const collectionName = `user_tenant_${service._id.toString()}`.toLowerCase();
    const tenantCollection = tenantConnection.collection(collectionName);
// console.log(tenantCollection)
    // ---------------- STEP 7: Parse Request Body ----------------
    const body = await req.json();
    const { email, cred } = body;

    if (!email || !cred) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
             {
    status: 400,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    // ---------------- STEP 8: Find User ----------------
    const user = await tenantCollection.findOne({ email });
    // console.log(user)
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
            {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }
// console.log(user.password)
    // ---------------- STEP 9: Verify Password ----------------
    const isPasswordCorrect = cred === user?.password ? true:false
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
         {
    status: 401,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
      );
    }

    // ---------------- STEP 10: Generate Token ----------------
    const userToken = jwt.sign(
      { id: user._id, projectId },
      secretKey,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      message: "Logged in successfully",
    //   token: userToken,
      success: true,
      userData:user,
      
    },     {
    status: 201,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  });

    res.cookies.set("token", userToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
res.headers.set("Access-Control-Allow-Origin", corsResult.origin);
res.headers.set("Access-Control-Allow-Credentials", "true");
res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
           {
    status: 500,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
    );
  }
}
