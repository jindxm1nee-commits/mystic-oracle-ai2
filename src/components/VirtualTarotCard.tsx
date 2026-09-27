import React from 'react';
import { Sparkles, RotateCw } from 'lucide-react';
import { DrawnTarotCard, TarotCard } from '../utils/tarot';

interface VirtualTarotCardProps {
  drawnCard: DrawnTarotCard | null;
  isRevealed: boolean;
  isDrawing?: boolean;
  onDrawNew?: () => void;
  compact?: boolean;
}

function renderSacredMotif(motif: TarotCard['motifType']) {
  switch (motif) {
    case 'sun':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <circle cx="60" cy="60" r="22" fill="rgba(245,208,118,0.2)" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="12"
              x2="60"
              y2="28"
              stroke="currentColor"
              strokeWidth="1.5"
              transform={`rotate(${deg} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="6" fill="currentColor" />
        </svg>
      );
    case 'moon':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-purple-200" aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(245,208,118,0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <path
            d="M68 28 A32 32 0 1 0 68 92 A24 24 0 1 1 68 28 Z"
            fill="rgba(216,180,254,0.25)"
            stroke="#F5D076"
            strokeWidth="1.8"
          />
          <circle cx="42" cy="42" r="2" fill="#F5D076" />
          <circle cx="82" cy="60" r="2.5" fill="#F5D076" />
          <circle cx="46" cy="78" r="1.5" fill="#F5D076" />
        </svg>
      );
    case 'wheel':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="60" r="30" fill="rgba(168,85,247,0.18)" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="14"
              x2="60"
              y2="50"
              stroke="currentColor"
              strokeWidth="1.4"
              transform={`rotate(${deg} 60 60)`}
            />
          ))}
        </svg>
      );
    case 'scales':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-200" aria-hidden="true">
          <line x1="60" y1="20" x2="60" y2="96" stroke="currentColor" strokeWidth="2" />
          <line x1="26" y1="42" x2="94" y2="42" stroke="currentColor" strokeWidth="1.8" />
          <path d="M26 42 L16 68 L36 68 Z" fill="rgba(245,208,118,0.2)" stroke="currentColor" strokeWidth="1.4" />
          <path d="M94 42 L84 68 L104 68 Z" fill="rgba(245,208,118,0.2)" stroke="currentColor" strokeWidth="1.4" />
          <line x1="42" y1="96" x2="78" y2="96" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'crown':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(245,208,118,0.35)" strokeWidth="1" />
          <path
            d="M28 78 L34 42 L50 58 L60 34 L70 58 L86 42 L92 78 Z"
            fill="rgba(245,208,118,0.22)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="60" cy="28" r="3" fill="currentColor" />
          <circle cx="33" cy="36" r="2.5" fill="currentColor" />
          <circle cx="87" cy="36" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'sword':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-200" aria-hidden="true">
          <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(192,132,252,0.35)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M60 16 L65 72 L55 72 Z" fill="rgba(245,208,118,0.25)" stroke="currentColor" strokeWidth="1.6" />
          <line x1="40" y1="72" x2="80" y2="72" stroke="currentColor" strokeWidth="2.2" />
          <line x1="60" y1="72" x2="60" y2="96" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="60" cy="99" r="4" fill="currentColor" />
        </svg>
      );
    case 'chalice':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <path
            d="M38 32 H82 C82 58 72 70 60 72 C48 70 38 58 38 32 Z"
            fill="rgba(216,180,254,0.2)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <line x1="60" y1="72" x2="60" y2="92" stroke="currentColor" strokeWidth="2" />
          <line x1="44" y1="92" x2="76" y2="92" stroke="currentColor" strokeWidth="2" />
          <path d="M60 16 L63 24 L71 24 L65 29 L67 37 L60 32 L53 37 L55 29 L49 24 L57 24 Z" fill="currentColor" />
        </svg>
      );
    case 'infinity':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(245,208,118,0.3)" strokeWidth="1" />
          <path
            d="M38 60 C24 44 24 76 38 60 C52 44 68 76 82 60 C96 44 96 76 82 60 C68 44 52 76 38 60 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <polygon points="60,22 72,42 48,42" fill="rgba(245,208,118,0.22)" stroke="currentColor" strokeWidth="1.4" />
          <polygon points="60,98 72,78 48,78" fill="rgba(192,132,252,0.22)" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case 'eye':
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-200" aria-hidden="true">
          <path
            d="M18 60 Q60 26 102 60 Q60 94 18 60 Z"
            fill="rgba(168,85,247,0.2)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="60" cy="60" r="14" fill="rgba(245,208,118,0.25)" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="60" cy="60" r="5" fill="currentColor" />
        </svg>
      );
    case 'star':
    default:
      return (
        <svg viewBox="0 0 120 120" className="w-24 h-24 text-amber-300" aria-hidden="true">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(245,208,118,0.35)" strokeWidth="1" strokeDasharray="3 4" />
          <polygon
            points="60,16 69,46 99,46 75,64 84,94 60,76 36,94 45,64 21,46 51,46"
            fill="rgba(245,208,118,0.2)"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="60" cy="60" r="5" fill="currentColor" />
        </svg>
      );
  }
}

export const VirtualTarotCard: React.FC<VirtualTarotCardProps> = ({
  drawnCard,
  isRevealed,
  isDrawing = false,
  onDrawNew,
  compact = false,
}) => {
  if (!drawnCard) {
    return null;
  }

  const { card, isReversed, orientationLabel } = drawnCard;

  return (
    <div className="w-full rounded-2xl border border-amber-300/35 bg-gradient-to-b from-[#170E2C]/90 via-[#100920]/95 to-[#0B0616]/95 p-5 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.28)] relative overflow-hidden">
      {/* Subtle Mystic Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-fuchsia-600/15 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        {/* Physical-style Illuminated Tarot Card Frame */}
        <div
          className={`relative shrink-0 ${
            compact ? 'w-44 h-72' : 'w-52 h-80 sm:w-56 sm:h-[340px]'
          } rounded-2xl p-2.5 bg-gradient-to-b from-amber-300/40 via-purple-500/30 to-amber-400/40 shadow-[0_0_35px_rgba(245,208,118,0.3)] transition-transform duration-300 ${
            isDrawing ? 'scale-95 opacity-80' : 'hover:scale-[1.02]'
          }`}
        >
          <div className="w-full h-full rounded-xl bg-[#0B0617] border border-amber-200/40 p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Corner Celestial Ornaments */}
            <div className="flex items-center justify-between text-[11px] font-mono-tabular text-amber-300/80">
              <span>✦ {card.numeral}</span>
              <span>MAJOR ARCANA ✦</span>
            </div>

            {/* Center Sacred Geometry Artwork */}
            <div
              className={`my-auto flex flex-col items-center justify-center py-2 transition-transform duration-300 ${
                isReversed ? 'rotate-180' : ''
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-orb-glow" />
                {renderSacredMotif(card.motifType)}
              </div>
            </div>

            {/* Bottom Card Title Plaque */}
            <div className="text-center border-t border-amber-300/25 pt-2.5">
              <div className="font-mystic text-sm sm:text-base font-semibold text-amber-200 tracking-wider uppercase truncate">
                {card.nameEn}
              </div>
              <div className="text-xs text-purple-200/90 mt-0.5 truncate">
                {card.nameTh}
              </div>
            </div>
          </div>
        </div>

        {/* Tarot Interpretation & Astral Seer Insights */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tabular text-amber-300 tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>VIRTUAL TAROT REVELATION · ไพ่ยิปซีนำทางดวงชะตา</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-mystic font-semibold text-amber-100">
            ไพ่ {card.nameEn} — {card.nameTh}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-purple-200/90">
            <span>{card.arcanaTh}</span>
            <span aria-hidden="true">·</span>
            <span>{card.planetOrSign}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300 font-medium">{orientationLabel}</span>
          </div>

          {/* Keywords */}
          <div className="mt-3 text-xs text-amber-200/90">
            <span className="text-[#9E958B] mr-2">หัวใจพลังงานไพ่:</span>
            {card.keywords.join(' · ')}
          </div>

          {isRevealed && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#E6E0D6] border-t border-amber-200/15 pt-4">
              <p>
                <strong className="text-amber-200 font-semibold">🔮 คำทำนายหน้าไพ่: </strong>
                {card.meaningUpright}
              </p>
              <p>
                <strong className="text-rose-300 font-semibold">⚠️ สิ่งที่ไพ่เตือนให้ระวัง: </strong>
                {card.warningHint}
              </p>
              <p>
                <strong className="text-emerald-300 font-semibold">🕯️ เคล็ดลับเปิดดวงจากไพ่: </strong>
                {card.actionTip}
              </p>
            </div>
          )}

          {onDrawNew && (
            <div className="mt-5 flex items-center justify-center md:justify-start">
              <button
                type="button"
                onClick={onDrawNew}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-amber-200 bg-purple-950/80 border border-amber-300/35 hover:bg-purple-900/80 hover:border-amber-300 transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(245,208,118,0.15)]"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
                <span>สับไพ่และอธิษฐานหยิบไพ่ใบใหม่</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
