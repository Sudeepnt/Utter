// Publish a checked, explicitly unsigned test preview to the public download feed.
// Requires gh to be signed in with write access to Sudeepnt/Utter.
import { createReadStream } from "node:fs";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  Array.from({ length: args.length / 2 }, (_, i) => [
    args[i * 2],
    args[i * 2 + 1],
  ]),
);
const version = flags["--version"];
if (
  args.length % 2 ||
  !/^\d+\.\d+\.\d+$/.test(version ?? "") ||
  !flags["--mac"] ||
  !flags["--windows"]
) {
  throw new Error(
    "Usage: node scripts/publish-preview.mjs --version X.Y.Z --mac /path/utter-X.Y.Z-macos-arm64-local-unsigned.dmg --windows /path/UtterSetup-x64.exe [--arm64 /path/UtterSetup-arm64.exe] [--mac-ref SHA] [--windows-ref SHA]",
  );
}
for (const ref of [flags["--mac-ref"], flags["--windows-ref"]].filter(Boolean))
  if (!/^[a-f0-9]{7,40}$/.test(ref))
    throw new Error("Source refs must be commit hashes");
const files = [resolve(flags["--mac"]), resolve(flags["--windows"])];
if (flags["--arm64"]) files.push(resolve(flags["--arm64"]));
if (
  basename(files[0]) !== `utter-${version}-macos-arm64-local-unsigned.dmg` ||
  basename(files[1]) !== "UtterSetup-x64.exe"
)
  throw new Error("Unexpected installer names or version");
if (files[2] && basename(files[2]) !== "UtterSetup-arm64.exe")
  throw new Error("Unexpected ARM64 installer name");
const gh = (...values) =>
  execFileSync("gh", values, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
async function hash(file) {
  const h = createHash("sha256");
  for await (const part of createReadStream(file)) h.update(part);
  return h.digest("hex");
}
for (const file of files) await access(file);
const entries = await Promise.all(
  files.map(async (file) => ({
    name: basename(file),
    file,
    sha256: await hash(file),
  })),
);
const tag =
  flags["--tag"] ??
  `v${version}-preview.${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.1`;
if (
  !new RegExp(`^v${version.replaceAll(".", "\\.")}-preview\\.[0-9.]+$`).test(
    tag,
  )
)
  throw new Error(
    "Preview tags must contain this version and a preview date/revision",
  );
await mkdir(".release-work", { recursive: true });
const scratch = await mkdtemp(".release-work/publish-");
try {
  const checksums = join(scratch, "SHA256SUMS.txt");
  await writeFile(
    checksums,
    entries.map((e) => `${e.sha256}  ${e.name}`).join("\n") + "\n",
  );
  const notes = join(scratch, "notes.md");
  await writeFile(
    notes,
    `# Utter ${version} — unsigned test preview\n\nUtter is free right now. This build adds the Pricing page, branded icons, and persistent GitHub update reminders.\n\n## Download and install\n\n- Mac: Apple silicon, macOS 15+. Open the disk image and drag Utter to Applications. This preview is ad-hoc signed, not Developer ID signed or notarized; macOS may block opening it.\n- Windows: x64 Windows 10/11 with AVX2. Run UtterSetup-x64.exe. The installer is not Authenticode signed.\n- Give the app its required microphone/Accessibility permissions and select a speech model. Model download and full dictation still need manual validation.\n- Compare your installer against SHA256SUMS.txt.\n\n## Updates\n\nThis version checks this repository for newer published installer versions. Download update opens the installer download. Run the installer and reopen Utter to finish. The sidebar offer and ten-minute reminders continue until the updated app runs. Unsigned files are never silently executed or installed.\n\n## Source\n\nMac: https://github.com/Sudeepnt/Hex${flags["--mac-ref"] ? "/commit/" + flags["--mac-ref"] : ""}\nWindows: https://github.com/Sudeepnt/Utter-Windows${flags["--windows-ref"] ? "/commit/" + flags["--windows-ref"] : ""}\n`,
  );
  gh(
    "release",
    "create",
    tag,
    "--repo",
    "Sudeepnt/Utter",
    "--draft",
    "--prerelease",
    "--title",
    `Utter ${version} — test preview`,
    "--notes-file",
    notes,
  );
  gh("release", "upload", tag, ...files, checksums, "--repo", "Sudeepnt/Utter");
  const assets = JSON.parse(
    gh("release", "view", tag, "--repo", "Sudeepnt/Utter", "--json", "assets"),
  ).assets;
  for (const e of entries) {
    const asset = assets.find((a) => a.name === e.name);
    if (
      !asset ||
      asset.state !== "uploaded" ||
      (asset.digest && asset.digest !== `sha256:${e.sha256}`)
    )
      throw new Error(
        `Uploaded asset failed verification: ${e.name}. Release left as draft.`,
      );
  }
  gh(
    "release",
    "edit",
    tag,
    "--repo",
    "Sudeepnt/Utter",
    "--draft=false",
    "--prerelease",
  );
  console.log(
    `Published https://github.com/Sudeepnt/Utter/releases/tag/${tag}`,
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
