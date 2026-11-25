export const platforms = {
  "macos-arm64": {
    label: "Mac",
    slug: "mac",
    extension: ".dmg",
    requirements: "Apple silicon · macOS 15 or later",
    pattern: /^utter-\d+\.\d+\.\d+-macos-arm64\.dmg$/,
  },
  "windows-x64": {
    label: "Windows",
    slug: "windows",
    extension: ".exe",
    requirements: "64-bit Windows 10 / 11 · AVX2-capable x64 processor",
    pattern: /^(?:utter-setup-\d+\.\d+\.\d+-windows-x64|UtterSetup-x64)\.exe$/,
  },
} as const;
export type Platform = keyof typeof platforms;
export type Release = {
  draft?: boolean;
  prerelease?: boolean;
  tag_name?: string;
  html_url?: string;
  assets?: {
    name: string;
    state: string;
    size: number;
    browser_download_url: string;
  }[];
};
export function isPlatform(value: string | null): value is Platform {
  return value !== null && Object.hasOwn(platforms, value);
}
export function releaseDownload(
  release: Release,
  platform: Platform,
  repository: string,
) {
  if (release.draft || release.prerelease) return null;
  for (const asset of release.assets ?? []) {
    if (
      !platforms[platform].pattern.test(asset.name) ||
      asset.state !== "uploaded" ||
      asset.size <= 0
    )
      continue;
    try {
      const url = new URL(asset.browser_download_url);
      if (
        url.origin === "https://github.com" &&
        !url.username &&
        !url.password &&
        url.pathname.startsWith(`/${repository}/releases/download/`)
      )
        return {
          url: url.href,
          name: asset.name,
          size: asset.size,
          version: release.tag_name ?? "Latest release",
        };
    } catch {
      /* A malformed asset must never become a public download. */
    }
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
export async function getInstaller(platform: Platform) {
  try {
    const repository = repositoryFor(platform);
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Utter-website",
    };
    if (process.env.GITHUB_RELEASE_TOKEN)
      headers.Authorization = `Bearer ${process.env.GITHUB_RELEASE_TOKEN}`;
    const response = await fetch(
      `https://api.github.com/repos/${repository}/releases/latest`,
      {
        headers,
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 60 },
      } as RequestInit,
    );
    if (!response.ok) return null;
    return releaseDownload(
      (await response.json()) as Release,
      platform,
      repository,
    );
  } catch {
    return null;
  }
}
