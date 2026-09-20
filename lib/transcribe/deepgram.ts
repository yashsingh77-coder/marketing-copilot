/**
 * Deepgram Nova-3 speech-to-text.
 * Accepts audio OR video containers directly (webm, mp4, m4a, mov) — no ffmpeg step.
 * `language: "multi"` enables Hindi⇄English code-switching for Hinglish voice notes.
 */
export type TranscriptResult = {
  transcript: string;
  language: string | null;
  confidence: number | null;
  duration: number | null;
};

export async function transcribe(
  file: Blob | ArrayBuffer,
  mimeType: string,
): Promise<TranscriptResult> {
  const params = new URLSearchParams({
    model: "nova-3",
    language: "multi",
    smart_format: "true",
    punctuate: "true",
    detect_language: "true",
  });

  const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": mimeType,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Deepgram ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const channel = json.results?.channels?.[0];
  const alt = channel?.alternatives?.[0];

  return {
    transcript: alt?.transcript ?? "",
    language: channel?.detected_language ?? null,
    confidence: alt?.confidence ?? null,
    duration: json.metadata?.duration ?? null,
  };
}
