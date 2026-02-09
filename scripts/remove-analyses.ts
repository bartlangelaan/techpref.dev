import { readJson, remove } from "fs-extra/esm";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_DIR = path.resolve(__dirname, "../data/analysis");

const files = await readdir(TARGET_DIR);

for (const file of files) {
  if (!file.endsWith(".json")) continue;

  const filePath = path.join(TARGET_DIR, file);

  try {
    const content = await readJson(filePath);

    if (content.analyzedVersion !== "8d56277528fc") {
      await remove(filePath);
      console.log("Deleted:", file);
    }
  } catch (err) {
    console.error("Skipping:", file, err);
  }
}
