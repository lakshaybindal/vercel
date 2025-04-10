import express from "express";
import cors from "cors";
import path from "path";
import { simpleGit } from "simple-git";
import { getAllFiles } from "./file";
import { generate } from "./utils";
import { uploadFile } from "./aws";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();
const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.post("/deploy", async (req, res) => {
  const repoUri = req.body.repoUri;
  const id = generate();
  await simpleGit()
    .clone(repoUri, path.join(__dirname, `out/${id}`))
    .then(() => {
      console.log("Cloned repo to ./out/" + id + "/");
    })
    .catch((err) => {
      console.error("Error cloning repo:", err);
      res.status(500).json({ error: "Failed to clone repo" });
    });
  // Upload all files to S3
  const allFiles = getAllFiles(path.join(__dirname, `out/${id}`));
  let i = 0;
  console.log(__dirname);
  for (const file of allFiles) {
    const fileName = file.slice(__dirname.length + 1).replace(/\\/g, "/");
    await uploadFile(fileName, file);
  }
  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");
  res.json({ id: id });
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
