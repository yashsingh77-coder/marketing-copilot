"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PillarCard } from "@/components/pillars/pillar-card";
import { CupFill } from "@/components/loaders/cup-fill";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Gyan, GyanSays } from "@/components/mascot/gyan";
import { regeneratePillars } from "@/lib/actions/pillars";
import type { ContentPillar } from "@/types/domain";

export function PillarList({ initial }: { initial: ContentPillar[] }) {
  const [pillars, setPillars] = useState(initial);
  const [rationale, setRationale] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function regenerate() {
    setConfirm(false);
    setError(null);
    start(async () => {
      const res = await regeneratePillars();
      if (res.ok) {
        setPillars(res.pillars);
        setRationale(res.rationale);
      } else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence mode="wait">
        {pending ? (
          <motion.div key="loading" exit={{ opacity: 0 }} className="py-10">
            <CupFill messages={["Rethinking your pillars…", "Balancing variety and focus…", "Almost there…"]} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            {rationale && (
              <div className="flex items-start gap-3">
                <Gyan expression="happy" size={72} className="shrink-0" />
                <GyanSays className="mt-2 text-sm">{rationale}</GyanSays>
              </div>
            )}
            <Stagger className="flex flex-col gap-4">
              {pillars.map((p) => (
                <StaggerItem key={p.id}>
                  <PillarCard pillar={p} showIdeaButton />
                </StaggerItem>
              ))}
            </Stagger>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm font-bold text-secondary">{error}</p>}

      {!pending && (
        <div className="flex flex-col gap-2">
          {confirm ? (
            <div className="outline-brutal flex flex-col gap-3 rounded-card bg-lemon p-4">
              <p className="font-bold">Replace all pillars with a fresh set? Your existing ideas stay safe.</p>
              <div className="flex gap-2">
                <Button variant="accent" size="sm" onClick={regenerate}>
                  Yes, regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                  Keep these
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              <RefreshCw className="size-4" /> Regenerate pillars
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
