export const platforms = {
  "macos-arm64": {
    label: "Mac",
    slug: "mac",
    extension: ".dmg",
    requirements: "Apple silicon · macOS 15 or later",
    pattern: /^utter-\d+\.\d+\.\d+-macos-arm64\.dmg$/,
    previewPattern: /^utter-\d+\.\d+\.\d+-macos-arm64-local-unsigned\.dmg$/,
  },
  "windows-x64": {
    label: "Windows",
    slug: "windows",
    extension: ".exe",
    requirements: "64-bit Windows 10 / 11 · AVX2-capable x64 processor",
    pattern: /^(?:utter-setup-\d+\.\d+\.\d+-windows-x64|UtterSetup-x64)\.exe$/,
    previewPattern:
      /^(?:utter-setup-\d+\.\d+\.\d+-windows-x64|UtterSetup-x64)\.exe$/,
  },
} as const;
export type Platform = keyof typeof platforms;
export type Asset = {
  name: string;
  state: string;
  size: number;
  browser_download_url: string;
};
export type Release = {
  draft?: boolean;
  prerelease?: boolean;
  tag_name?: string;
  assets?: Asset[];
};
export function isPlatform(value: string | null): value is Platform {
  return value !== null && Object.hasOwn(platforms, value);
}
function assetUrl(asset: Asset, repository: string) {
  if (asset.state !== "uploaded" || asset.size <= 0) return null;
  try {
    const url = new URL(asset.browser_download_url);
    if (
      url.origin === "https://github.com" &&
      !url.username &&
      !url.password &&
      url.pathname.startsWith(`/${repository}/releases/download/`)
    )
      return url.href;
  } catch {
    /* A malformed asset must never become a public download. */
  }
  return null;
}
export function releaseDownload(
  release: Release,
  platform: Platform,
  repository: string,
  preview = false,
) {
  if (release.draft) return null;
  if (
    preview
      ? !release.prerelease ||
        !/^v\d+\.\d+\.\d+-preview[.-]/.test(release.tag_name ?? "")
      : release.prerelease
  )
    return null;
  const pattern = preview
    ? platforms[platform].previewPattern
    : platforms[platform].pattern;
  for (const asset of release.assets ?? []) {
    if (!pattern.test(asset.name)) continue;
    const url = assetUrl(asset, repository);
    if (!url) continue;
    const checksum = release.assets?.find(
      (item) =>
        item.name === `${asset.name}.sha256` || item.name === "SHA256SUMS.txt",
    );
    const checksumUrl = checksum && assetUrl(checksum, repository);
    if (!checksumUrl) continue;
    return {
      url,
      name: asset.name,
      size: asset.size,
      version: release.tag_name ?? "Latest release",
      preview,
      checksumUrl,
      releaseUrl: `https://github.com/${repository}/releases/tag/${encodeURIComponent(release.tag_name ?? "")}`,
    };
  }
  return null;
}
export function repositoryFor(platform: Platform) {
  const value =
    (platform === "macos-arm64"
      ? process.env.UTTER_MAC_RELEASE_REPO
      : process.env.UTTER_WINDOWS_RELEASE_REPO) || "Sudeepnt/Utter";
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value))
    throw new Error("Invalid release repository configuration");
  return value;
}
export async function getInstaller(platform: Platform, preview = false) {
  try {
    const repository = repositoryFor(platform);
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Utter-website",
    };
    if (process.env.GITHUB_RELEASE_TOKEN)
      headers.Authorization = `Bearer ${process.env.GITHUB_RELEASE_TOKEN}`;
    const endpoint = preview ? "releases?per_page=10" : "releases/latest";
    const response = await fetch(
      `https://api.github.com/repos/${repository}/${endpoint}`,
      {
        headers,
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 60 },
      } as RequestInit,
    );
    if (!response.ok) return null;
    const data = await response.json();
    const releases: Release[] = preview
      ? Array.isArray(data)
        ? data
        : []
      : [data];
    for (const release of releases) {
      const installer = releaseDownload(release, platform, repository, preview);
      if (installer) return installer;
    }
  } catch {
    /* Missing releases and offline GitHub both show the preparation page. */
  }
  return null;
}
