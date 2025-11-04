import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { projectModel } from "@/model/project";
import { corsCheck } from "@/lib/middleware/corsCheck";
import database from "@/database/database";

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
const requestOrigin = req.headers.get("origin") || "*"; 
  let corsResult = { allowed: false, origin: requestOrigin };
  try {
await database()
    // ---------------- STEP 1: Extract API Key ----------------
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    // ---------------- STEP 2: Decode token ----------------
    let decoded;
    try {
      decoded = jwt.verify(tokenPart, process.env.SecretKey);
    } catch (err) {
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

    const { userId, projectId } = decoded;
         // Step 2: CORS validation
     corsResult = await corsCheck(req, projectId);
    // console.log(corsResult)
    if (!corsResult.allowed) {
      return new Response(JSON.stringify({
        message: "Origin not allowed",
        success: false
      }), {
        status: 403,
        headers: { "Access-Control-Allow-Origin": corsResult.origin },
      });
    }

    // ---------------- STEP 3: Find project & verify API key ----------------
    const project = await projectModel
      .findById(projectId)
      .populate("typeOfService");
// console.log(project)
    if (!project) {
      return NextResponse.json(
        { message: "No Project Found", success: false },
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

    // ---------------- STEP 4: Identify service ----------------
    const service = project.typeOfService?.find(
      (e) => e?.subServiceName === "Registeration"
    );

    if (!service) {
      return NextResponse.json(
        { message: "No linked service found", success: false },
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

    // ---------------- STEP 5: Connect to tenant DB ----------------
    const tenantDbUri = project.mongoDbUri;
    if (!tenantDbUri) {
      return NextResponse.json(
        { message: "Tenant MongoDB URI not found", success: false },
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

    const tenantConnection =
      mongoose.connections.find((c) => c.name === project._id.toString()) ||
      (await mongoose.createConnection(tenantDbUri, {
        dbName: project._id.toString(),
      }));

    // ---------------- STEP 6: Get service schema ----------------
    const fields = service.serviceSchema?.fields || [];
    const body = await req.json();

    // ---------------- STEP 7: Build simple schema definition ----------------
    const dynamicSchemaDefinition = {};
    for (const field of fields) {
      if (field.key === "email") {
        dynamicSchemaDefinition[field.key] = {
          type: String,
          unique: true,
          trim: true,
        };
      } else {
        dynamicSchemaDefinition[field.key] = { type: String };
      }
    }

    const modelName = `User_Tenant_${service._id.toString()}`;
    const tenantModel =
      tenantConnection.models[modelName] ||
      tenantConnection.model(
        modelName,
        new mongoose.Schema(dynamicSchemaDefinition)
      );

    // ---------------- STEP 8: Check uniqueness ----------------
    if (fields.some((f) => f.key === "email")) {
      const existing = await tenantModel.findOne({ email: body.email });
      if (existing) {
        return NextResponse.json(
          { message: "Email already exists", success: false },
               {
    status: 409,
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

    // ---------------- STEP 9: Save data ----------------
    const created = await tenantModel.create(body);

    // ---------------- STEP 10: Respond ----------------
    return NextResponse.json(
      {
        message: "Data stored successfully in tenant DB",
        success: true,
        data: created,
        tenantDb: project._id.toString(),
      },
       {
    status: 201,
    headers: {
      "Access-Control-Allow-Origin": corsResult.origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  }
    );
  } catch (error) {
    console.error("Dynamic Tenant Error:", error);
    return NextResponse.json(
      { message: "Server Error", success: false, error: error.message },
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
