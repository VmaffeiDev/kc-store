import { requireRole } from "@/lib/authorization";
import { getErrorMessage } from "@/lib/utils";
import { createUploadSignature } from "@/services/cloudinary";

export async function POST() {
  try {
    await requireRole(["OWNER", "STAFF"]);
    return Response.json(createUploadSignature());
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
