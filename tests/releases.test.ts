import test from "node:test";
import assert from "node:assert/strict";
import {
  getInstaller,
  isPlatform,
  releaseDownload,
  type Release,
} from "../lib/releases.ts";
const repository = "Sudeepnt/Utter";
function release(name = "utter-3.4.0-macos-arm64.dmg"): Release {
  return {
    draft: false,
    prerelease: false,
    tag_name: "v3.4.0",
    assets: [
      {
        name,
        state: "uploaded",
        size: 120,
        browser_download_url: `https://github.com/${repository}/releases/download/v3.4.0/${name}`,
      },
    ],
  };
}
test("only supported platform installers from the configured release repository are selected", () => {
  assert.ok(isPlatform("macos-arm64"));
  assert.ok(isPlatform("windows-x64"));
  assert.equal(isPlatform("__proto__"), false);
  assert.equal(isPlatform(null), false);
  assert.ok(releaseDownload(release(), "macos-arm64", repository));
  for (const name of [
    "utter-setup-3.4.0-windows-x64.exe",
    "UtterSetup-x64.exe",
  ])
    assert.ok(releaseDownload(release(name), "windows-x64", repository));
  for (const name of [
    "source.zip",
    "utter-3.4.0-macos-arm64-local-unsigned.dmg",
    "UtterSetup-arm64.exe",
  ])
    assert.equal(
      releaseDownload(release(name), "macos-arm64", repository),
      null,
    );
});
test("drafts, prereleases, empty assets, malformed and foreign asset URLs cannot download", () => {
  for (const field of ["draft", "prerelease"])
    assert.equal(
      releaseDownload(
        { ...release(), [field]: true },
        "macos-arm64",
        repository,
      ),
      null,
    );
  for (const url of [
    "not a URL",
    "https://example.com/file.dmg",
    "https://github.com/other/repo/releases/download/v1/file.dmg",
    "https://github.com.evil.example/Sudeepnt/Utter/releases/download/x",
  ]) {
    const r = release();
    r.assets![0].browser_download_url = url;
    assert.equal(releaseDownload(r, "macos-arm64", repository), null);
  }
  for (const patch of [{ size: 0 }, { state: "new" }]) {
    const r = release();
    Object.assign(r.assets![0], patch);
    assert.equal(releaseDownload(r, "macos-arm64", repository), null);
  }
});
test("missing releases and network errors produce an unavailable state", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null, { status: 404 });
    assert.equal(await getInstaller("macos-arm64"), null);
    globalThis.fetch = async () => {
      throw new Error("offline");
    };
    assert.equal(await getInstaller("windows-x64"), null);
    globalThis.fetch = async () => Response.json(release());
    assert.equal((await getInstaller("macos-arm64"))?.version, "v3.4.0");
  } finally {
    globalThis.fetch = original;
  }
});
