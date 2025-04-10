import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
const pipe = promisify(pipeline);
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

export async function downloadS3Folder(prefix: string) {
  const listCommand = new ListObjectsV2Command({
    Bucket: "vercel-ronit",
    Prefix: prefix,
  });

  const allFiles = await s3.send(listCommand);

  const downloadPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      if (!Key) return;
      console.log(`Downloading: ${Key}`);
      const outputPath = path.join(__dirname, Key);
      const dir = path.dirname(outputPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const getCommand = new GetObjectCommand({
        Bucket: "vercel-ronit",
        Key,
      });

      const response = await s3.send(getCommand);

      if (response.Body && response.Body instanceof ReadableStream === false) {
        const stream = response.Body as NodeJS.ReadableStream;
        const writeStream = fs.createWriteStream(outputPath);
        await pipe(stream, writeStream);
        console.log(`✅ Downloaded: ${Key}`);
      }
    }) ?? [];

  await Promise.all(downloadPromises);
}

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `out/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(
      `dist/${id}/` + file.slice(folderPath.length + 1).replace(/\\/g, "/"),
      file
    );
  });
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

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
