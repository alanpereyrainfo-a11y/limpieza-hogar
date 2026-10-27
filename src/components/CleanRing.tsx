import { cleanlinessLabel } from "../domain/scoring.ts";

export function CleanRing({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const color = value >= 75 ? "#c6ff4a" : value >= 45 ? "#ffc14d" : "#ff6b81";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 72 72" className="h-16 w-16" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold tabular-nums">{value}</span>
      </div>
      <span className="sr-only">{value}% {cleanlinessLabel(value)}</span>
    </div>
  );
}
