const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const destinationRoot = path.resolve(__dirname, "..", "app");

const assets = ["index.html", "index2.html", "bt7", "bt30", "qr"];

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyFile(source, destination) {
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.copyFile(source, destination);
}

async function copyDirectory(source, destination) {
  await fs.promises.mkdir(destination, { recursive: true });
  const entries = await fs.promises.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    if (entry.isFile()) {
      // eslint-disable-next-line no-await-in-loop
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function copyAsset(assetPath) {
  const source = path.join(repoRoot, assetPath);
  const destination = path.join(destinationRoot, assetPath);

  if (!(await pathExists(source))) {
    return;
  }

  const stats = await fs.promises.stat(source);
  if (stats.isDirectory()) {
    await copyDirectory(source, destination);
    return;
  }

  if (stats.isFile()) {
    await copyFile(source, destination);
  }
}

async function main() {
  await fs.promises.mkdir(destinationRoot, { recursive: true });

  for (const asset of assets) {
    // eslint-disable-next-line no-await-in-loop
    await copyAsset(asset);
  }
}

main().catch(() => {
  process.exitCode = 1;
});
