import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
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

const app = express();

app.get("/{*splat}", async (req, res) => {
  try {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;
    console.log(id);
    console.log(filePath);
    const command = new GetObjectCommand({
      Bucket: "vercel-ronit",
      Key: `dist/${id}${filePath}`,
    });

    const data = await s3.send(command);

    const contentType = filePath.endsWith(".html")
      ? "text/html"
      : filePath.endsWith(".css")
      ? "text/css"
      : "application/javascript";

    res.set("Content-Type", contentType);

    if (data.Body instanceof Readable) {
      data.Body.pipe(res);
    } else {
      res.send(data.Body); // fallback if not a stream
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("File not found or S3 error");
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
