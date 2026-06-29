import "server-only";

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function createUploadSignature(folder = "kc-store/products") {
  assertCloudinaryConfigured();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

export function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_CLOUD_NAME,
  );
}

export function assertCloudinaryConfigured() {
  if (!hasCloudinaryConfig()) {
    throw new Error("Cloudinary nao configurado.");
  }
}

export async function uploadProductImage(
  file: File,
  folder = "kc-store/products",
) {
  assertCloudinaryConfigured();
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 2000, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Nao foi possivel enviar a imagem."));
          return;
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string) {
  assertCloudinaryConfigured();
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}
