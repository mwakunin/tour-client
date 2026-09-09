import { NextResponse } from "next/server";

/**
 * Liveness probe for the container.
 *
 * The Dockerfile has probed /api/health since it was written and this route
 * did not exist, so Next answered 404, `curl -f` failed, and every production
 * container reported unhealthy for its whole life — which under an
 * orchestrator that acts on health is a restart loop rather than a cosmetic
 * flag.
 *
 * Deliberately shallow: it says this process is up and serving, nothing more.
 * It does NOT check the API, because a frontend that cannot reach the backend
 * is still correctly serving its own pages, and a probe that fails on someone
 * else's outage takes down a healthy container.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", uptime: process.uptime() });
}
