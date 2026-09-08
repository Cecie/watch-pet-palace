type Mood = "happy" | "neutral" | "sad" | "sleep" | "dead";

const P = 1; // pixel unit in viewBox

function Px({ x, y, on = true }: { x: number; y: number; on?: boolean }) {
  if (!on) return null;
  return <rect x={x} y={y} width={P} height={P} fill="currentColor" />;
}

/** 16x16 pixel blob pet drawn from a bitmap string map. */
const BODY = [
  "................",
  ".....######.....",
  "...##########...",
  "..############..",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  "..############..",
  "..############..",
  "...##########...",
  "....###..###....",
  "...###....###...",
  "................",
  "................",
];

export function PetSprite({ mood, stage }: { mood: Mood; stage: "egg" | "baby" | "teen" | "adult" }) {
  const scale = stage === "egg" ? 0.7 : stage === "baby" ? 0.78 : stage === "teen" ? 0.9 : 1;

  const animation =
    mood === "dead" ? "" : mood === "sleep" ? "anim-idle" : mood === "happy" ? "anim-wiggle" : "anim-idle";

  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-full w-full text-ink ${animation}`}
      style={{ transform: `scale(${scale})`, shapeRendering: "crispEdges" }}
      aria-hidden="true"
    >
      {stage === "egg" ? (
        <>
          {[
            "................",
            "......####......",
            ".....######.....",
            "....########....",
            "...##########...",
            "...##########...",
            "..############..",
            "..############..",
            "..############..",
            "..############..",
            "..############..",
            "...##########...",
            "....########....",
            ".....######.....",
            "................",
            "................",
          ].map((row, y) =>
            row.split("").map((c, x) => <Px key={`e${x}-${y}`} x={x} y={y} on={c === "#"} />),
          )}
        </>
      ) : (
        <>
          {BODY.map((row, y) => row.split("").map((c, x) => <Px key={`b${x}-${y}`} x={x} y={y} on={c === "#"} />))}
          {/* eyes */}
          {mood === "sleep" || mood === "dead" ? (
            <>
              <rect x={4} y={7} width={3} height={1} fill="var(--lcd)" />
              <rect x={9} y={7} width={3} height={1} fill="var(--lcd)" />
            </>
          ) : (
            <>
              <rect x={5} y={6} width={1} height={2} fill="var(--lcd)" />
              <rect x={10} y={6} width={1} height={2} fill="var(--lcd)" />
            </>
          )}
          {/* mouth */}
          {mood === "happy" && (
            <>
              <rect x={6} y={10} width={1} height={1} fill="var(--lcd)" />
              <rect x={7} y={11} width={2} height={1} fill="var(--lcd)" />
              <rect x={9} y={10} width={1} height={1} fill="var(--lcd)" />
            </>
          )}
          {mood === "neutral" && <rect x={6} y={11} width={4} height={1} fill="var(--lcd)" />}
          {mood === "sad" && (
            <>
              <rect x={6} y={12} width={1} height={1} fill="var(--lcd)" />
              <rect x={7} y={11} width={2} height={1} fill="var(--lcd)" />
              <rect x={9} y={12} width={1} height={1} fill="var(--lcd)" />
            </>
          )}
          {mood === "dead" && (
            <>
              <rect x={4} y={6} width={3} height={1} fill="var(--lcd)" />
              <rect x={5} y={7} width={1} height={1} fill="var(--lcd)" />
              <rect x={9} y={6} width={3} height={1} fill="var(--lcd)" />
              <rect x={10} y={7} width={1} height={1} fill="var(--lcd)" />
              <rect x={6} y={11} width={4} height={1} fill="var(--lcd)" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
