import { createClient, commandOptions } from "redis";

import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect();
const publisher = createClient();
publisher.connect();
async function main() {
  while (1) {
    const res = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    if (res === null) continue;
    await downloadS3Folder("out/" + res.element);
    console.log(res.element);
    await buildProject(res.element);
    copyFinalDist(res.element);
    publisher.hSet("status", res.element, "deployed");
  }
}
main();
