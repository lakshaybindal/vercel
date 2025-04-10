import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
});
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);

  const uploadCommand = new PutObjectCommand({
    Bucket: "vercel-ronit", // Replace with your R2 bucket name
    Key: fileName,
    Body: fileContent,
    ContentType: "application/octet-stream", // You can change based on file type
  });

  try {
    console.log(`✅ Uploading "${fileName}" to Cloudflare R2...`);
    const response = await s3.send(uploadCommand);
    console.log(`✅ Uploaded "${fileName}" successfully`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to upload "${fileName}", error`);
    throw error;
  }
};
