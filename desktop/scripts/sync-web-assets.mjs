import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fsExtra from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..", "..");
const destinationRoot = path.resolve(__dirname, "..", "app");

const assets = ["index.html", "index2.html", "bt7", "bt30", "qr"];

async function copyAsset(assetPath) {
  const source = path.join(repoRoot, assetPath);
  const destination = path.join(destinationRoot, assetPath);

  if (!fs.existsSync(source)) {
    console.warn(`[sync-web] Skipping missing asset: ${assetPath}`);
    return;
  }

  await fsExtra.copy(source, destination, { dereference: true });
  console.log(`[sync-web] Copied: ${assetPath}`);
}

async function main() {
  await fsExtra.emptyDir(destinationRoot);

  for (const asset of assets) {
    // eslint-disable-next-line no-await-in-loop
    await copyAsset(asset);
  }

  console.log(`[sync-web] Assets synced to: ${destinationRoot}`);
}

main().catch((error) => {
  console.error("[sync-web] Failed to sync assets:", error);
  process.exitCode = 1;
});
