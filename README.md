# Utter website

The standalone Next.js website for **Utter**, a local desktop dictation app for Mac and Windows. This repository contains the website, not the desktop app source.

## Run locally

Node.js 22 or later:

```sh
npm ci
npm run dev
```

Open http://localhost:4174. The site includes a simulated dictation demo, creator workflow examples, accessible navigation, reduced-motion support, and server-side installer download resolution. The browser demo does not access the microphone.

```sh
npm test
npm run typecheck
npm run build
```

## Deploy to Vercel

Import `Sudeepnt/Utter`, select **Next.js**, and leave **Root Directory** at the repository root (`.`). Use `npm run build`; let Vercel detect the Next.js output. Do not set the root to `website`—that was the older layout in the desktop app repository.

No environment variables are needed for public releases under `Sudeepnt/Utter`. To use another public release repository, set the server-only variables from `.env.example`:

- `UTTER_MAC_RELEASE_REPO`, default `Sudeepnt/Utter`
- `UTTER_WINDOWS_RELEASE_REPO`, default `Sudeepnt/Utter`
- `GITHUB_RELEASE_TOKEN`, optional, for API rate limits. Never expose it as `NEXT_PUBLIC_*`.

## Desktop downloads

Download buttons call `/api/download?platform=macos-arm64` or `/api/download?platform=windows-x64`. The server checks the configured repository's latest published, non-prerelease GitHub Release. It accepts uploaded, nonempty installers matching these names:

- Mac: `utter-<semver>-macos-arm64.dmg`
- Windows: `utter-setup-<semver>-windows-x64.exe` or `UtterSetup-x64.exe`

Asset links must belong to the configured repository on `github.com`. A draft, prerelease, unsigned-local preview filename, unrelated source archive, invalid URL, or missing installer never becomes a download. If unavailable, visitors land on `/download/mac` or `/download/windows`, with an honest preparation message. Release metadata is refreshed every 60 seconds. GitHub tokens are used for metadata only; installer asset URLs must be public.

**At website creation, neither app repository had a published GitHub Release.** To enable actual downloads, publish verified, signed/notarized Mac and validated Windows installers with SHA-256 checksums to a public GitHub Release. The site does not build, sign, or publish desktop binaries. A successful website deployment alone does not make an installer available.

Mac support: Apple silicon, macOS 15+. Windows support: x64 Windows 10/11 with AVX2. Other architectures are not offered by this website yet. App sources and packaging live at:

- https://github.com/Sudeepnt/Hex
- https://github.com/Sudeepnt/Utter-Windows

The Pricing page inside the desktop apps says **Free right now**; paid plans are not active. The website has no pricing table, checkout, account collection, analytics, or fabricated user endorsements. Creator cards are illustrative workflow scenarios.

## Brand and content

The supplied Utter mascot is in `public/assets/utter-logo.png`. Figtree is bundled locally; its license is included alongside the font. The design takes inspiration from clear, product-led dictation websites, with original copy, composition, and interactions. It makes no unmeasured speed or accuracy claims about competitors.

## Test preview downloads

If no stable installer exists, the platform download page can offer a clearly
labelled test preview from a published `vX.Y.Z-preview.*` prerelease. It requires
an installer and checksum asset. The user explicitly chooses **Download test
preview**; ordinary download requests never silently choose an unsigned file.
The preview API requires `channel=preview`. Stable releases still reject local
unsigned filenames.

To publish an update after both builds and installer checks pass:

```sh
node scripts/publish-preview.mjs --version 3.4.1 --mac /path/utter-3.4.1-macos-arm64-local-unsigned.dmg --windows /path/UtterSetup-x64.exe --mac-ref MAC_COMMIT --windows-ref WINDOWS_COMMIT
```

The script hashes the files, creates a draft prerelease, uploads installers and
`SHA256SUMS.txt`, checks uploaded asset metadata, then publishes the prerelease.
Optional `--arm64` adds a Windows ARM64 installer. Every subsequent app update
must increment the desktop version (e.g. 3.4.1 to 3.4.2) before building. Preview
apps check this release feed after ten seconds and every fifteen minutes, offer
only newer compatible versions, and repeat their reminder ten minutes after
dismissal until the updated version is running. Installing remains a user action
for unsigned previews. Do not treat a source commit as a published installer.
