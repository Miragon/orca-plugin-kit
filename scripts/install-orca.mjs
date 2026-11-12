import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { arch } from "node:os";
import { join } from "node:path";

const [version, folder] = process.argv.slice(2);
if (!version || !folder) {
  console.error("Usage: node scripts/install-orca.mjs <version> <folder>");
  process.exit(2);
}

const cli = join(folder, "squashfs-root", "resources", "bin", "orca-ide");
if (!existsSync(cli)) extractAppImage(version, folder);
console.log(`Orca ${version} in ${folder}/squashfs-root`);

function extractAppImage(version, folder) {
  mkdirSync(folder, { recursive: true });
  const asset =
    arch() === "arm64" ? "orca-linux-arm64.AppImage" : "orca-linux.AppImage";
  const url = `https://github.com/stablyai/orca/releases/download/v${version}/${asset}`;
  runInFolder(folder, "curl", ["-fsSL", "-o", "orca.AppImage", url]);
  runInFolder(folder, "chmod", ["+x", "orca.AppImage"]);
  runInFolder(folder, "./orca.AppImage", ["--appimage-extract"]);
  rmSync(join(folder, "orca.AppImage"));
}

function runInFolder(folder, command, args) {
  const result = spawnSync(command, args, {
    cwd: folder,
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${folder}`);
  }
}
