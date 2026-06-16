import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireRole } from "@/lib/authorization";
import { getErrorMessage } from "@/lib/utils";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  try {
    await requireRole(["OWNER", "STAFF"]);
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Selecione uma imagem." }, { status: 400 });
    }
    const extension = allowedTypes.get(file.type);
    if (!extension) {
      return Response.json(
        { error: "Use uma imagem JPG, PNG ou WebP." },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "A imagem deve ter no maximo 5 MB." },
        { status: 400 },
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(
      path.join(uploadDirectory, fileName),
      Buffer.from(await file.arrayBuffer()),
    );
    return Response.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
