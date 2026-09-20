"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ImagePlus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Gyan } from "@/components/mascot/gyan";
import { CupFill } from "@/components/loaders/cup-fill";
import { CreativeCard, type CreativeCardData } from "./creative-card";
import type { PostBriefRow } from "@/types/domain";
import { cn } from "@/lib/utils";

type ToolOutput =
  | { ok: true; creative: CreativeCardData }
  | { ok: false; error: string };

const QUICK_PROMPTS = [
  "Make a feed creative for this brief",
  "Story version (9:16)",
  "Add a bold offer banner",
  "Make it more premium",
  "Same idea, night-time mood",
];

export function StudioChat({
  briefs,
  initialBriefId,
  initialThread,
}: {
  briefs: PostBriefRow[];
  initialBriefId?: string;
  initialThread?: { id: string; messages: UIMessage[]; brief_id: string | null } | null;
}) {
  const router = useRouter();
  const [briefId, setBriefId] = useState<string | null>(initialThread?.brief_id ?? initialBriefId ?? null);
  const [threadId] = useState(() => initialThread?.id ?? crypto.randomUUID());
  const [input, setInput] = useState("");
  const [refining, setRefining] = useState<CreativeCardData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const brief = useMemo(() => briefs.find((b) => b.id === briefId) ?? null, [briefs, briefId]);

  const [transport] = useState(
    () => new DefaultChatTransport({ api: "/api/studio/chat", body: { threadId } }),
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    transport,
    messages: initialThread?.messages ?? [],
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const prefix = refining ? `Tweak the creative with id ${refining.id}: ` : "";
    // briefId is sent per message so switching briefs mid-thread just works.
    sendMessage({ text: prefix + t }, { body: { briefId } });
    setInput("");
    setRefining(null);
  }

  const creativesSoFar = messages.flatMap((m) =>
    m.parts
      .filter((p) => p.type === "tool-generate_creative" && "state" in p && p.state === "output-available")
      .map((p) => (p as unknown as { output: ToolOutput }).output)
      .filter((o): o is Extract<ToolOutput, { ok: true }> => o.ok)
      .map((o) => o.creative),
  );

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      {/* Brief selector */}
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-3">
        <Chip size="sm" selected={!briefId} onClick={() => setBriefId(null)}>
          Free-form
        </Chip>
        {briefs.map((b) => (
          <Chip key={b.id} size="sm" color="sky" selected={briefId === b.id} onClick={() => setBriefId(b.id)}>
            {b.title}
          </Chip>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Gyan expression="pointing" size={120} />
            <div>
              <h2 className="text-2xl">What should we make?</h2>
              <p className="mx-auto max-w-xs text-ink-soft">
                {brief
                  ? `I've read "${brief.title}". Tap a prompt or describe the creative you want.`
                  : "Describe a post creative — or pick a brief above so I know the plan."}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.slice(0, brief ? 5 : 3).map((q) => (
                <Chip key={q} size="sm" color="lemon" onClick={() => send(q)}>
                  {q}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} briefId={briefId} briefTitle={brief?.title} onRefine={(c) => { setRefining(c); inputRef.current?.focus(); }} />
        ))}

        {busy && !messages.at(-1)?.parts.some((p) => p.type === "tool-generate_creative") && (
          <div className="flex items-start gap-2">
            <Gyan expression="thinking" size={40} className="shrink-0" />
            <div className="outline-brutal rounded-card bg-paper px-3 py-2 text-sm font-semibold text-ink-soft">
              <TypingDots />
            </div>
          </div>
        )}

        {error && (
          <p className="outline-brutal rounded-card bg-blush p-3 text-sm font-bold">
            {error.message.includes("503") || error.message.includes("not configured")
              ? "Studio isn't connected to an image provider yet."
              : `Something went wrong: ${error.message}`}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-20 -mx-4 bg-cream/95 px-4 pb-2 pt-2 backdrop-blur">
        <AnimatePresence>
          {refining && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="outline-brutal mb-2 flex items-center gap-2 rounded-card bg-lemon p-2 text-sm font-bold"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={refining.url} alt="" className="outline-brutal size-10 rounded-button object-cover" />
              <span className="flex-1">Tweaking this creative — describe the change</span>
              <button type="button" onClick={() => setRefining(null)} aria-label="Cancel tweak">
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="outline-brutal shadow-brutal flex items-end gap-2 rounded-card bg-paper p-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={refining ? "e.g. make the background warmer, add ₹199" : "e.g. overhead shot of our brunch plate with 'Weekend Special' text"}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold outline-none placeholder:text-ink-soft/50"
            disabled={busy}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || busy} loading={busy} aria-label="Send">
            <ArrowUp className="size-5" strokeWidth={3} />
          </Button>
        </form>
        {creativesSoFar.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-ink-soft">
            <span className="flex items-center gap-1">
              <ImagePlus className="size-3.5" /> {creativesSoFar.length} creative{creativesSoFar.length > 1 ? "s" : ""} this session
            </span>
            <button type="button" className="text-primary" onClick={() => router.push("/studio/gallery")}>
              Open gallery →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  briefId,
  briefTitle,
  onRefine,
}: {
  message: UIMessage;
  briefId: string | null;
  briefTitle?: string;
  onRefine: (c: CreativeCardData) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
      {!isUser && <Gyan expression="happy" size={40} animate={false} className="shrink-0" />}
      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (!part.text.trim()) return null;
            return (
              <div
                key={i}
                className={cn(
                  "outline-brutal rounded-card px-3 py-2 text-sm font-semibold leading-snug whitespace-pre-wrap",
                  isUser ? "bg-ink text-cream" : "bg-paper",
                )}
              >
                {isUser ? part.text.replace(/^Tweak the creative with id [0-9a-f-]+: /, "✏️ ") : part.text}
              </div>
            );
          }
          if (part.type === "tool-generate_creative") {
            const p = part as unknown as { state: string; output?: ToolOutput; input?: { aspect?: string; description?: string } };
            if (p.state === "output-available" && p.output) {
              if (p.output.ok) {
                return (
                  <CreativeCard
                    key={i}
                    creative={p.output.creative}
                    briefId={briefId}
                    briefTitle={briefTitle}
                    onRefine={onRefine}
                  />
                );
              }
              return (
                <div key={i} className="outline-brutal rounded-card bg-blush px-3 py-2 text-sm font-bold">
                  {p.output.error}
                </div>
              );
            }
            return (
              <div key={i} className="outline-brutal flex w-64 flex-col items-center gap-2 rounded-card bg-paper p-4">
                <CupFill
                  size={90}
                  messages={["Sketching the layout…", "Mixing the colours…", "Rendering your text…", "Polishing the pixels…"]}
                />
                {p.input?.aspect && <span className="text-xs font-bold text-ink-soft">{p.input.aspect}</span>}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block size-2 rounded-full bg-ink"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  );
}

export function StudioEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Gyan expression="sleepy" size={120} />
      <h2 className="text-2xl">Studio is warming up</h2>
      <p className="max-w-xs text-ink-soft">
        The image provider isn&apos;t connected yet. Once it is, you&apos;ll design post creatives right here with Gyan.
      </p>
      <Sparkles className="size-5 text-primary" />
    </div>
  );
}
