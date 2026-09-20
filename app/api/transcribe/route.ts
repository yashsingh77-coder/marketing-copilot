import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribe } from "@/lib/transcribe/deepgram";

export const maxDuration = 120;

/**
 * POST /api/transcribe  { assetId }
 * Pulls the uploaded file from Storage, transcribes it, stores transcript on media_assets.
 * Phase 3 — brief generation from transcript will chain from here.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { assetId } = await request.json();

  const { data: asset } = await supabase.from("media_assets").select("*").eq("id", assetId).single();
  if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });

  await supabase.from("media_assets").update({ status: "transcribing" }).eq("id", assetId);

  const { data: file, error: dlError } = await supabase.storage
    .from("voice-notes")
    .download(asset.storage_path);
  if (dlError || !file) {
    await supabase.from("media_assets").update({ status: "failed", error: dlError?.message }).eq("id", assetId);
    return NextResponse.json({ error: "download failed" }, { status: 500 });
  }

  try {
    const result = await transcribe(file, asset.mime_type ?? "audio/webm");
    await supabase
      .from("media_assets")
      .update({
        status: "transcribed",
        transcript: result.transcript,
        detected_language: result.language,
        duration_seconds: result.duration,
        transcript_meta: { confidence: result.confidence, provider: "deepgram/nova-3" },
      })
      .eq("id", assetId);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "transcription failed";
    await supabase.from("media_assets").update({ status: "failed", error: message }).eq("id", assetId);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
