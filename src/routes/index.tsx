import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { PetSprite } from "@/components/PetSprite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Pet — Bichinho virtual para Apple Watch" },
      {
        name: "description",
        content:
          "Um bichinho virtual estilo Tamagotchi dos anos 90, feito para a tela do Apple Watch: alimente, brinque, limpe e cuide do sono.",
      },
      { property: "og:title", content: "Pixel Pet — Bichinho virtual para Apple Watch" },
      {
        property: "og:description",
        content: "Cuide do seu bichinho de pixels no pulso: fome, felicidade, energia e higiene em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Stats = {
  hunger: number;
  happy: number;
  energy: number;
  clean: number;
  age: number;
  ticks: number;
  sleeping: boolean;
  dead: boolean;
  poops: number;
};

const INITIAL: Stats = {
  hunger: 80,
  happy: 80,
  energy: 90,
  clean: 100,
  age: 0,
  ticks: 0,
  sleeping: false,
  dead: false,
  poops: 0,
};

const KEY = "pixelpet.v1";
const clamp = (n: number) => Math.max(0, Math.min(100, n));

function stageOf(age: number) {
  if (age < 1) return "egg" as const;
  if (age < 3) return "baby" as const;
  if (age < 8) return "teen" as const;
  return "adult" as const;
}

function moodOf(s: Stats) {
  if (s.dead) return "dead" as const;
  if (s.sleeping) return "sleep" as const;
  const score = (s.hunger + s.happy + s.clean + s.energy) / 4;
  if (score > 70) return "happy" as const;
  if (score > 40) return "neutral" as const;
  return "sad" as const;
}

function Meter({ label, value, icon }: { label: string; value: number; icon: string }) {
  const blocks = 8;
  const filled = Math.round((value / 100) * blocks);
  return (
    <div className="flex items-center gap-1.5" aria-label={`${label}: ${Math.round(value)}%`}>
      <span className="w-3 text-center text-[9px] leading-none opacity-80">{icon}</span>
      <div className="flex flex-1 gap-[2px]">
        {Array.from({ length: blocks }).map((_, i) => (
          <span
            key={i}
            className={`h-[6px] flex-1 rounded-[1px] ${
              i < filled ? "bg-ink" : "bg-ink/15"
            } ${value < 25 && i < filled ? "anim-blink" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-2 py-2 text-primary transition-transform active:scale-95 disabled:opacity-35"
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="pixel text-[6px] uppercase">{label}</span>
    </button>
  );
}

function Index() {
  const [stats, setStats] = useState<Stats>(INITIAL);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStats({ ...INITIAL, ...(JSON.parse(raw) as Partial<Stats>) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(stats));
    } catch {
      /* ignore */
    }
  }, [stats, hydrated]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1600);
  }, []);

  // Life tick: every 4s the pet lives a little.
  useEffect(() => {
    const id = window.setInterval(() => {
      setStats((s) => {
        if (s.dead) return s;
        const asleep = s.sleeping;
        const next: Stats = {
          ...s,
          ticks: s.ticks + 1,
          age: s.age + 1 / 15,
          hunger: clamp(s.hunger - (asleep ? 0.6 : 1.6)),
          happy: clamp(s.happy - (asleep ? 0.3 : 1.2)),
          energy: clamp(s.energy + (asleep ? 3.5 : -0.9)),
          clean: clamp(s.clean - s.poops * 1.6),
          poops: s.poops,
        };
        if (!asleep && Math.random() < 0.08) next.poops = Math.min(3, s.poops + 1);
        if (asleep && next.energy >= 100) next.sleeping = false;
        if (next.hunger <= 0 && next.happy <= 0) next.dead = true;
        return next;
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const mood = moodOf(stats);
  const stage = stageOf(stats.age);
  const stageLabel = { egg: "OVO", baby: "BEBÊ", teen: "JOVEM", adult: "ADULTO" }[stage];

  const feed = () => {
    setStats((s) => ({ ...s, hunger: clamp(s.hunger + 22), energy: clamp(s.energy + 4) }));
    say("NHAM!");
  };
  const play = () => {
    setStats((s) => ({ ...s, happy: clamp(s.happy + 20), energy: clamp(s.energy - 8), hunger: clamp(s.hunger - 5) }));
    say("OBA!");
  };
  const cleanUp = () => {
    setStats((s) => ({ ...s, clean: 100, poops: 0 }));
    say("LIMPO!");
  };
  const toggleSleep = () => {
    setStats((s) => ({ ...s, sleeping: !s.sleeping }));
    say(stats.sleeping ? "ACORDOU" : "ZZZ...");
  };
  const reset = () => {
    setStats(INITIAL);
    say("NOVO OVO");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-3 py-5">
      <h1 className="pixel text-[8px] uppercase tracking-widest text-primary">Pixel Pet</h1>

      {/* Watch shell */}
      <div className="relative w-full max-w-[300px]">
        <div
          className="rounded-[44px] border border-border bg-shell p-3"
          style={{ boxShadow: "var(--shadow-shell)" }}
        >
          {/* LCD screen */}
          <div className="lcd-panel relative flex aspect-[4/5] flex-col overflow-hidden rounded-[34px] p-3">
            <div className="flex items-center justify-between">
              <span className="pixel text-[6px] uppercase">{stageLabel}</span>
              <span className="pixel text-[6px]">
                {stats.dead ? "R.I.P." : `${Math.floor(stats.age)}d`}
              </span>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <div className="h-[56%] w-[56%]">
                <PetSprite mood={mood} stage={stage} />
              </div>
              {stats.sleeping && !stats.dead && (
                <span className="pixel anim-blink absolute right-4 top-2 text-[8px]">Zz</span>
              )}
              {Array.from({ length: stats.poops }).map((_, i) => (
                <span
                  key={i}
                  className="absolute bottom-1 text-[11px] leading-none"
                  style={{ left: `${12 + i * 20}%` }}
                  aria-label="sujeira"
                >
                  💩
                </span>
              ))}
              {toast && (
                <span className="pixel anim-pop absolute top-0 rounded-md bg-ink px-2 py-1 text-[7px] text-lcd">
                  {toast}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Meter label="Fome" value={stats.hunger} icon="🍖" />
              <Meter label="Felicidade" value={stats.happy} icon="♥" />
              <Meter label="Energia" value={stats.energy} icon="⚡" />
              <Meter label="Higiene" value={stats.clean} icon="✦" />
            </div>
          </div>
        </div>
        {/* Digital crown hint */}
        <div className="absolute -right-1 top-1/3 h-10 w-2 rounded-full border border-border bg-card" />
      </div>

      {stats.dead ? (
        <button
          type="button"
          onClick={reset}
          className="pixel rounded-xl bg-primary px-4 py-3 text-[8px] uppercase text-primary-foreground active:scale-95"
        >
          Recomeçar
        </button>
      ) : (
        <div className="grid w-full max-w-[300px] grid-cols-4 gap-2">
          <ActionButton label="Comer" icon="🍖" onClick={feed} disabled={stats.sleeping} />
          <ActionButton label="Brincar" icon="🎾" onClick={play} disabled={stats.sleeping} />
          <ActionButton label="Limpar" icon="🚿" onClick={cleanUp} />
          <ActionButton
            label={stats.sleeping ? "Acordar" : "Dormir"}
            icon={stats.sleeping ? "☀️" : "🌙"}
            onClick={toggleSleep}
          />
        </div>
      )}

      <p className="pixel max-w-[300px] text-center text-[6px] leading-relaxed text-muted-foreground">
        Ele vive em tempo real — volte sempre para cuidar dele.
      </p>
    </main>
  );
}
