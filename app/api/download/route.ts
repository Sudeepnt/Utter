import { getInstaller, isPlatform, platforms } from "@/lib/releases";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");
  if (!isPlatform(platform))
    return Response.json(
      { error: "Choose a Mac or Windows download." },
      { status: 400 },
    );
  const installer = await getInstaller(platform);
  if (!installer)
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/download/${platforms[platform].slug}`,
        "Cache-Control": "no-store",
      },
    });
  return new Response(null, {
    status: 302,
    headers: { Location: installer.url, "Cache-Control": "no-store" },
  });
}
export const HEAD = GET;
