"use client";

import { useMemo, useState } from "react";
import { type Pairing } from "@/lib/data";

interface PairingsListProps {
  ingredients: string[];
  pairings: Pairing[];
  onPairingClick?: (pairing: string) => void;
}

// Get color intensity based on score (0-1)
function getScoreColor(score: number): string {
  if (score >= 0.3) return "bg-sky-dark text-foreground";
  if (score >= 0.15) return "bg-sky text-foreground";
  if (score >= 0.08) return "bg-sky/70 text-foreground";
  return "bg-sky/50 text-foreground/90";
}

// Format score as percentage
function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// Consolidate and remap categories
function normalizeCategory(category: string, ingredientName?: string): string {
  // Combine fruit categories
  if (category.startsWith("Fruit") || category === "Berry" || category === "Fruit-Berry") {
    return "Fruit";
  }
  // Combine vegetable categories
  if (category.startsWith("Vegetable") || category === "Cabbage" || category === "Gourd") {
    return "Vegetable";
  }
  // Combine beverage categories
  if (category.startsWith("Beverage")) {
    return "Beverage";
  }
  // Maize → Grain
  if (category === "Maize" || category === "Cereal") {
    return "Grain";
  }
  // Plant - remap based on what they actually are
  if (category === "Plant") {
    const vegetables = ["bamboo shoots", "cardoon", "chicory", "lambsquarters", "nopal", "ostrich fern", "purslane", "watercress", "black salsify", "common salsify", "giant butterbur", "french plantain", "tree fern", "yautia", "ceriman", "oregon yampah"];
    const fruits = ["longan", "rowal"];
    const herbs = ["laurel", "myrtle", "sassafras", "hops"];
    const nuts = ["pine", "colorado pinyon"];
    const name = (ingredientName || "").toLowerCase();

    if (vegetables.some(v => name.includes(v))) return "Vegetable";
    if (fruits.some(f => name.includes(f))) return "Fruit";
    if (herbs.some(h => name.includes(h))) return "Herb";
    if (nuts.some(n => name.includes(n))) return "Nut";
    if (name.includes("tea")) return "Beverage";
    if (name.includes("olive") || name.includes("oil")) return "Oil & Fat";
    return "Plant";
  }
  // Plant Derivative - remap
  if (category === "Plant Derivative") {
    const name = (ingredientName || "").toLowerCase();
    if (name.includes("chocolate") || name.includes("cocoa")) return "Chocolate";
    if (name.includes("vinegar")) return "Condiment";
    if (name.includes("oil")) return "Oil & Fat";
    if (name.includes("honey")) return "Sweetener";
    if (name.includes("tofu") || name.includes("soy")) return "Soy";
    if (name.includes("peanut butter")) return "Nut";
    if (name.includes("macaroni")) return "Grain";
    return "Other";
  }
  // Additive - keep useful ones
  if (category === "Additive") {
    const name = (ingredientName || "").toLowerCase();
    if (name.includes("miso") || name.includes("ketchup") || name.includes("sauce")) return "Condiment";
    if (name.includes("sugar") || name.includes("syrup") || name.includes("molasses")) return "Sweetener";
    if (name.includes("salt")) return "Seasoning";
    if (name.includes("oil")) return "Oil & Fat";
    return "Additive";
  }
  // Dish - prepared foods
  if (category === "Dish") {
    return "Dish";
  }
  // Anything else that's not in our known categories goes to "Other"
  if (!CATEGORY_ORDER.includes(category)) {
    return "Other";
  }
  return category;
}

// Category display order (most relevant first)
const CATEGORY_ORDER = [
  "Herb",
  "Spice",
  "Fruit",
  "Vegetable",
  "Legume",
  "Nut",
  "Seed",
  "Grain",
  "Dairy",
  "Meat",
  "Fish",
  "Seafood",
  "Bakery",
  "Fungus",
  "Beverage",
  "Chocolate",
  "Condiment",
  "Oil & Fat",
  "Soy",
  "Sweetener",
  "Essential Oil",
  "Flower",
  "Plant",
  "Additive",
  "Dish",
  "Other",
];

export function PairingsList({
  ingredients,
  pairings,
  onPairingClick,
}: PairingsListProps) {
  const [showOther, setShowOther] = useState(false);

  // Group pairings by normalized category
  const groupedPairings = useMemo(() => {
    const groups = new Map<string, Pairing[]>();

    for (const pairing of pairings) {
      const category = normalizeCategory(pairing.category || "Other", pairing.ingredient);
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(pairing);
    }

    // Sort categories: known order first, then alphabetically
    const sortedCategories = [...groups.keys()].sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedCategories.map(category => ({
      category,
      pairings: groups.get(category)!,
    }));
  }, [pairings]);

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
    <div className="space-y-6 lg:space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-[0.15em] font-[family-name:var(--font-display)]">
          {headerText}
        </h2>
        <p className="text-muted text-sm sm:text-base">
          {ingredients.length === 1 ? "Pairs well with:" : "All pair well with:"}{" "}
          <span className="text-muted/70">({pairings.length} matches)</span>
        </p>
      </div>

      {groupedPairings
        .filter(({ category }) => category !== "Other")
        .map(({ category, pairings: categoryPairings }) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {category} ({categoryPairings.length})
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categoryPairings.map((pairing) => (
                <button
                  key={pairing.ingredient}
                  onClick={() => onPairingClick?.(pairing.ingredient)}
                  className={`px-4 py-2.5 rounded-xl text-sm hover:brightness-95 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 ${getScoreColor(pairing.score)}`}
                  title={`${pairing.sharedMolecules} shared molecules`}
                >
                  <span className="capitalize">{pairing.ingredient}</span>
                  <span className="text-xs opacity-70 font-medium">{formatScore(pairing.score)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Other category - collapsible */}
      {groupedPairings.some(({ category }) => category === "Other") && (
        <div className="space-y-3">
          <button
            onClick={() => setShowOther(!showOther)}
            className="text-sm font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors flex items-center gap-2"
          >
            <span className={`transition-transform ${showOther ? "rotate-90" : ""}`}>▶</span>
            Other ({groupedPairings.find(g => g.category === "Other")?.pairings.length})
            <span className="text-xs font-normal normal-case">{showOther ? "hide" : "show"} uncommon ingredients</span>
          </button>
          {showOther && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {groupedPairings
                .find(g => g.category === "Other")
                ?.pairings.map((pairing) => (
                  <button
                    key={pairing.ingredient}
                    onClick={() => onPairingClick?.(pairing.ingredient)}
                    className={`px-4 py-2.5 rounded-xl text-sm hover:brightness-95 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 ${getScoreColor(pairing.score)}`}
                    title={`${pairing.sharedMolecules} shared molecules`}
                  >
                    <span className="capitalize">{pairing.ingredient}</span>
                    <span className="text-xs opacity-70 font-medium">{formatScore(pairing.score)}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
