import { motion } from "framer-motion";
import { cn } from "../lib/utils.ts";
import type { Mood } from "../domain/types.ts";

type MapiProps = {
  mood: Mood;
  className?: string;
  pulse?: number;
};

export function Mapi({ mood, className, pulse = 0 }: MapiProps) {
  const label =
    mood === "feliz" ? "Mapi contento, con el spray" : mood === "preocupado" ? "Mapi preocupado" : "Mapi sucio y triste";

  return (
    <motion.div
      key={pulse}
      className={cn("relative", className)}
      animate={pulse > 0 ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : { y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 512 640" className={cn("mapi-svg h-full w-full", `mood-${mood}`)} role="img" aria-label={label}>
        <g className="mapi-float">
          <g className="mapi-tail">
            <path d="M330 500c80 24 130-20 118-108" stroke="#232a3d" strokeWidth="34" fill="none" strokeLinecap="round" />
            <path d="M348 492c52 12 86-16 80-68" stroke="#e7edf7" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M360 486c34 6 54-10 52-38" stroke="#232a3d" strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>

          <ellipse cx="150" cy="500" rx="34" ry="52" fill="#d7deea" transform="rotate(18 150 500)" />
          <ellipse cx="256" cy="528" rx="128" ry="86" fill="#232a3d" />
          <ellipse cx="256" cy="544" rx="74" ry="54" fill="#eef3fb" />
          <ellipse cx="196" cy="598" rx="40" ry="18" fill="#1b2233" />
          <ellipse cx="316" cy="598" rx="40" ry="18" fill="#1b2233" />

          {mood === "feliz" && (
            <g>
              <path className="mapi-spark" fill="#ff4fd8" d="M118 78l10 28 28 10-28 10-10 28-10-28-28-10 28-10z" />
              <path className="mapi-spark" fill="#c6ff4a" d="M168 108l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
              <g className="mapi-bubble">
                <circle cx="400" cy="120" r="26" fill="none" stroke="#5ef2ff" strokeWidth="8" />
                <circle cx="392" cy="112" r="5" fill="#fff" />
              </g>
              <g className="mapi-bubble mapi-bubble-delay">
                <circle cx="438" cy="168" r="14" fill="#5ef2ff" />
                <circle cx="434" cy="164" r="3" fill="#fff" />
              </g>
            </g>
          )}

          <g>
            <ellipse cx="168" cy="168" rx="52" ry="74" fill="#1b2233" transform="rotate(-22 168 168)" />
            <ellipse cx="344" cy="168" rx="52" ry="74" fill="#1b2233" transform="rotate(22 344 168)" />
            <ellipse cx="172" cy="176" rx="24" ry="42" fill="#ff7eb6" transform="rotate(-22 172 176)" />
            <ellipse cx="340" cy="176" rx="24" ry="42" fill="#ff7eb6" transform="rotate(22 340 176)" />
          </g>

          <ellipse cx="256" cy="286" rx="176" ry="154" fill="#101522" />
          <ellipse cx="256" cy="280" rx="164" ry="144" fill="#d7deea" />
          <ellipse cx="256" cy="286" rx="142" ry="62" fill="#141822" />
          <ellipse cx="132" cy="300" rx="38" ry="30" fill="#141822" />
          <ellipse cx="380" cy="300" rx="38" ry="30" fill="#141822" />

          {mood === "preocupado" && (
            <g>
              <path d="M150 236q28-22 62 8" fill="none" stroke="#141822" strokeWidth="8" strokeLinecap="round" />
              <path d="M362 236q-28-22-62 8" fill="none" stroke="#141822" strokeWidth="8" strokeLinecap="round" />
              <path className="mapi-sweat" d="M392 250c8 10 6 22-2 28 6-2 14 2 12 12" fill="none" stroke="#5ef2ff" strokeWidth="6" strokeLinecap="round" />
            </g>
          )}

          <ellipse cx="198" cy="284" rx="40" ry="46" fill="#f7fbff" />
          <ellipse cx="314" cy="284" rx="40" ry="46" fill="#f7fbff" />
          <ellipse cx="206" cy="292" rx="18" ry="24" fill="#04141c" />
          <ellipse cx="322" cy="292" rx="18" ry="24" fill="#04141c" />
          <ellipse cx="206" cy="292" rx="10" ry="14" fill="#5ef2ff" />
          <ellipse cx="322" cy="292" rx="10" ry="14" fill="#5ef2ff" />
          <circle cx="196" cy="278" r="8" fill="#fff" />
          <circle cx="312" cy="278" r="8" fill="#fff" />
          <ellipse className="mapi-lid" cx="198" cy="250" rx="42" ry="28" fill="#141822" />
          <ellipse className="mapi-lid" cx="314" cy="250" rx="42" ry="28" fill="#141822" />

          <ellipse cx="256" cy="352" rx="62" ry="44" fill="#f5f8fc" />
          <ellipse cx="256" cy="338" rx="20" ry="14" fill="#1a1022" />
          <ellipse cx="248" cy="334" rx="6" ry="4" fill="#fff" opacity="0.45" />
          {mood === "feliz" && (
            <path d="M232 362q24 20 48 0" fill="none" stroke="#1a1022" strokeWidth="6" strokeLinecap="round" />
          )}
          {mood === "preocupado" && (
            <path d="M234 368h44" fill="none" stroke="#1a1022" strokeWidth="6" strokeLinecap="round" />
          )}
          {mood === "sucio" && (
            <path d="M232 376q24-18 48 0" fill="none" stroke="#1a1022" strokeWidth="6" strokeLinecap="round" />
          )}
          {mood !== "sucio" && (
            <g>
              <ellipse cx="188" cy="348" rx="18" ry="10" fill="#ff8ec8" opacity="0.7" />
              <ellipse cx="324" cy="348" rx="18" ry="10" fill="#ff8ec8" opacity="0.7" />
            </g>
          )}

          {mood === "sucio" && (
            <g className="mapi-dust">
              <ellipse cx="150" cy="250" rx="22" ry="12" fill="#6b7280" opacity="0.55" />
              <ellipse cx="360" cy="360" rx="26" ry="14" fill="#57534e" opacity="0.5" />
              <circle cx="120" cy="330" r="8" fill="#9ca3af" opacity="0.45" />
              <circle cx="400" cy="240" r="10" fill="#9ca3af" opacity="0.35" />
            </g>
          )}

          {mood === "sucio" ? (
            <g>
              <rect x="92" y="430" width="14" height="78" rx="7" fill="#d7deea" transform="rotate(-28 99 469)" />
              <ellipse cx="78" cy="430" rx="28" ry="18" fill="#5ef2ff" opacity="0.85" transform="rotate(-20 78 430)" />
              <ellipse cx="96" cy="418" rx="16" ry="12" fill="#bff9ff" transform="rotate(-20 96 418)" />
            </g>
          ) : (
            <g>
              {mood === "feliz" && (
                <g>
                  <circle cx="292" cy="318" r="7" fill="#bff9ff" />
                  <circle cx="274" cy="300" r="5" fill="#5ef2ff" />
                  <circle cx="268" cy="332" r="4" fill="#e8fdff" />
                </g>
              )}
              <rect x="300" y="292" width="58" height="18" rx="8" fill="#f7fbff" />
              <rect x="346" y="306" width="16" height="28" rx="6" fill="#d5e2ee" />
              <rect x="318" y="330" width="64" height="92" rx="18" fill="#5ef2ff" />
              <rect x="334" y="348" width="32" height="52" rx="10" fill="#08343c" opacity="0.28" />
              <ellipse cx="350" cy="408" rx="20" ry="14" fill="#d7deea" />
            </g>
          )}
        </g>
      </svg>
    </motion.div>
  );
}
