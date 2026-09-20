import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/ui/chip";
import { Gyan } from "@/components/mascot/gyan";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 p-6 pt-12 md:max-w-3xl">
      <Stagger className="flex flex-col gap-8">
        <StaggerItem>
          <div className="flex flex-col items-center gap-4 text-center">
            <Gyan expression="pointing" size={150} />
            <Sticker color="blush" rotate={-4} size="md">
              For small business owners
            </Sticker>
            <h1 className="text-5xl leading-[1.05]">
              Marketing that <span className="text-primary">teaches</span> you as it works
            </h1>
            <p className="text-lg text-ink-soft">
              Content pillars, ready-to-post briefs, Hinglish captions, and a friendly guru who explains why. Zero
              experience needed.
            </p>
            <Button href="/login" size="lg">
              Start for free <ArrowRight className="size-5" />
            </Button>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["☕", "Your pillars", "4–6 content themes tailored to your shop and your neighbourhood.", "lemon"],
              ["✍️", "Post briefs", "Exactly what to shoot, the caption, and hashtags split local / niche / reach.", "sky"],
              ["🎓", "Learn by doing", "2-minute lessons that end in a real post on your calendar.", "lilac"],
            ].map(([emoji, title, body, color]) => (
              <Card key={title} color={color as "lemon" | "sky" | "lilac"} tilt>
                <span className="text-3xl">{emoji}</span>
                <h3 className="mt-2 text-xl">{title}</h3>
                <p className="mt-1 text-sm font-semibold">{body}</p>
              </Card>
            ))}
          </div>
        </StaggerItem>
      </Stagger>
    </main>
  );
}
