import { NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * GET /api/cron/sync-metrics — daily (see vercel.json).
 * Phase 6: for each social_account → fetch media + insights from Meta Graph API →
 * upsert social_posts / post_metrics / account_metrics → regenerate insights.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO(phase-6): implement with createAdminClient() + lib/meta/graph.ts
  return NextResponse.json({ ok: true, synced: 0 });
}
