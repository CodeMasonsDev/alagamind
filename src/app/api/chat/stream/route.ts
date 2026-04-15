import { NextRequest } from "next/server";
import { BASEURL } from "@/lib/base";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildUpstreamUrl(pathname: string) {
  return new URL(pathname, BASEURL).toString();
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const upstreamResponse = await fetch(buildUpstreamUrl("/api/chat/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    body,
    cache: "no-store",
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const fallbackText = await upstreamResponse.text().catch(() => "");

    return new Response(
      fallbackText ||
        JSON.stringify({ detail: "Failed to connect to assistant stream." }),
      {
        status: upstreamResponse.status || 502,
        headers: {
          "Content-Type": fallbackText ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      },
    );
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type":
        upstreamResponse.headers.get("content-type") ?? "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
