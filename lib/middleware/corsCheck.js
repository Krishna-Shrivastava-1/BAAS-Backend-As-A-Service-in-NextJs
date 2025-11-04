import { projectModel } from "@/model/project";

export async function corsCheck(req, projectId) {
  const origin = req.headers.get("origin");
// console.log(origin)
  // If no origin (like from Postman or server-to-server), skip CORS check
  if (!origin) return { allowed: false, origin, message: "Access denied: Missing Origin header. Only browser-based requests from allowed domains are permitted." };

  const project = await projectModel.findById(projectId);
  if (!project) return { allowed: false };

  const isAllowed =
    project.allowedOrigins?.includes(origin) ||
    project.allowedOrigins?.includes("*"); // optional wildcard support

  if (!isAllowed) {
    return { allowed: false, origin };
  }

  return { allowed: true, origin };
}
