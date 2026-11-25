import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { DownloadLink } from "@/components/download-link";
import { getInstaller, platforms, type Platform } from "@/lib/releases";
export const dynamic = "force-dynamic";
const slugs: Record<string, Platform> = {
  mac: "macos-arm64",
  windows: "windows-x64",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const slug = (await params).platform;
  const key = slugs[slug];
  return {
    title: key
      ? `Download Utter for ${platforms[key].label}`
      : "Download Utter",
    robots: { index: false, follow: true },
  };
}
export default async function Download({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const key = slugs[(await params).platform];
  if (!key) notFound();
  const platform = platforms[key];
  const installer =
    (await getInstaller(key)) ?? (await getInstaller(key, true));
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/">
            <Image src="/assets/utter-logo.png" alt="" width={42} height={42} />
            <span>
              utter<span className="brand-dot">.</span>
            </span>
          </Link>
          <Link
            className="header-download"
            style={{ marginLeft: "auto" }}
            href="/"
          >
            Back to the good stuff
          </Link>
        </div>
      </header>
      <main className="download-page">
        <article className="download-panel">
          <Icon name={key === "macos-arm64" ? "apple" : "windows"} size={38} />
          <div className="eyebrow">{platform.requirements}</div>
          <h1>
            A little Utter.
            <br />
            For your {platform.label}.
          </h1>
          {installer ? (
            <>
              <p>
                Your next idea doesn't need to wait for your typing. Download
                Utter, set up your speech model, and give it a voice.
              </p>
              {installer.preview && (
                <div className="preview-notice" role="note">
                  <strong>Unsigned test preview</strong>
                  <p>
                    This early build is not code-signed or notarized for public
                    distribution.{" "}
                    {key === "macos-arm64"
                      ? "macOS may block opening it."
                      : "Windows may show an unverified publisher warning."}{" "}
                    Choose this download only if you want to test the preview.
                  </p>
                </div>
              )}
              <div className="download-actions">
                <DownloadLink
                  className="button button-dark"
                  href={`/api/download?platform=${key}${installer.preview ? "&channel=preview" : ""}`}
                  icon={<Icon name="download" />}
                  label={installer.preview ? "Download test preview" : `Download ${platform.extension}`}
                  showStatus
                />
                <span>
                  {installer.version} · {(installer.size / 1048576).toFixed(1)}{" "}
                  MB
                </span>
              </div>
              <div className="download-verification">
                <a href={installer.checksumUrl}>SHA-256 checksums</a>
                <a href={installer.releaseUrl} target="_blank" rel="noreferrer">
                  Release notes
                </a>
              </div>
              <h2>Make yourself at home.</h2>
              <ol>
                {key === "macos-arm64" ? (
                  <>
                    <li>Open the disk image and drag Utter to Applications.</li>
                    <li>
                      Open Utter and allow Microphone and Accessibility
                      permissions.
                    </li>
                  </>
                ) : (
                  <>
                    <li>Open the downloaded installer and complete setup.</li>
                    <li>Launch Utter and allow microphone access.</li>
                  </>
                )}
                <li>Download a speech model and choose your shortcut.</li>
                <li>Hold the shortcut, speak, and release to paste.</li>
              </ol>
              <p className="release-meta">
                Internet is needed for the initial speech model download. You
                can check the current pricing status inside the app.
              </p>
            </>
          ) : (
            <>
              <span className="preparing-badge">
                THE DOWNLOAD IS BEING PREPARED
              </span>
              <p>
                The {platform.label} installer isn't available yet. We're
                getting the desktop download ready. Check back here for the
                published release.
              </p>
              <p>
                This page will show the installer as soon as it's available.
              </p>
              <div className="download-actions">
                <Link className="button button-dark" href="/">
                  Back to Utter
                </Link>
                <a
                  className="text-button"
                  href="https://github.com/Sudeepnt/Utter/releases"
                  target="_blank"
                  rel="noreferrer"
                >
                  View releases
                </a>
              </div>
              <p className="release-meta">
                Developers can explore the{" "}
                <a
                  className="inline-link"
                  href="https://github.com/Sudeepnt/Hex"
                >
                  app source on GitHub
                </a>
                .
              </p>
            </>
          )}
        </article>
      </main>
    </>
  );
}
