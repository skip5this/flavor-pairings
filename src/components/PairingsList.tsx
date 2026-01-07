"use client";

import { isPrimaryIngredient } from "@/lib/data";

interface PairingsListProps {
  ingredients: string[];
  pairings: string[];
  onPairingClick?: (pairing: string) => void;
}

export function PairingsList({
  ingredients,
  pairings,
  onPairingClick,
}: PairingsListProps) {
  if (pairings.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        No pairings found
      </div>
    );
  }

  const headerText = ingredients.length === 1
    ? ingredients[0]
    : `${ingredients.length} ingredients`;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-[0.15em] font-[family-name:var(--font-display)]">
          {headerText}
        </h2>
        <p className="text-muted text-sm sm:text-base">
          {ingredients.length === 1 ? "Pairs well with:" : "All pair well with:"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {pairings.map((pairing) => {
          const isPrimary = isPrimaryIngredient(pairing);

          return isPrimary ? (
            <button
              key={pairing}
              onClick={() => onPairingClick?.(pairing)}
              className="px-4 py-2.5 bg-sky text-foreground rounded-xl text-sm capitalize hover:bg-sky-dark active:scale-95 transition-all whitespace-nowrap"
            >
              {pairing}
            </button>
          ) : (
            <span
              key={pairing}
              className="px-4 py-2.5 bg-muted-bg text-foreground/70 rounded-xl text-sm capitalize whitespace-nowrap"
            >
              {pairing}
            </span>
          );
        })}
      </div>
    </div>
  );
}
