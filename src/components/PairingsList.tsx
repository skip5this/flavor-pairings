"use client";

import { useMemo, useState } from "react";
import { type Pairing } from "@/lib/data";

interface PairingsListProps {
  ingredients: string[];
  pairings: Pairing[];
  onPairingClick?: (pairing: string) => void;
}

// Get score indicator class
function getScoreClass(score: number): string {
  if (score >= 0.2) return "score-high";
  if (score >= 0.1) return "score-medium";
  return "score-low";
}

// Format score as percentage
function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

// Consolidate and remap categories
function normalizeCategory(category: string, ingredientName?: string): string {
  if (category.startsWith("Fruit") || category === "Berry" || category === "Fruit-Berry") {
    return "Fruit";
  }
  if (category.startsWith("Vegetable") || category === "Cabbage" || category === "Gourd") {
    return "Vegetable";
  }
  if (category.startsWith("Beverage")) {
    return "Beverage";
  }
  if (category === "Maize" || category === "Cereal") {
    return "Grain";
  }
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
  if (category === "Additive") {
    const name = (ingredientName || "").toLowerCase();
    if (name.includes("miso") || name.includes("ketchup") || name.includes("sauce")) return "Condiment";
    if (name.includes("sugar") || name.includes("syrup") || name.includes("molasses")) return "Sweetener";
    if (name.includes("salt")) return "Seasoning";
    if (name.includes("oil")) return "Oil & Fat";
    return "Additive";
  }
  if (category === "Dish") {
    return "Dish";
  }
  if (!CATEGORY_ORDER.includes(category)) {
    return "Other";
  }
  return category;
}

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

  const groupedPairings = useMemo(() => {
    const groups = new Map<string, Pairing[]>();

    for (const pairing of pairings) {
      const category = normalizeCategory(pairing.category || "Other", pairing.ingredient);
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(pairing);
    }

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
      <div className="text-center py-8 text-muted text-sm">
        No pairings found
      </div>
    );
  }

  const headerText = ingredients.length === 1
    ? ingredients[0]
    : `${ingredients.length} ingredients`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground capitalize mb-1">
          {headerText}
        </h2>
        <p className="text-muted text-sm">
          {ingredients.length === 1 ? "Pairs well with" : "All pair well with"}{" "}
          <span className="text-muted/70">{pairings.length} ingredients</span>
        </p>
      </div>

      <div className="space-y-5">
        {groupedPairings
          .filter(({ category }) => category !== "Other")
          .map(({ category, pairings: categoryPairings }) => (
            <div key={category} className="space-y-2.5">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
                {category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {categoryPairings.map((pairing) => (
                  <button
                    key={pairing.ingredient}
                    onClick={() => onPairingClick?.(pairing.ingredient)}
                    className="result-item inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                    title={`${pairing.sharedMolecules} shared molecules`}
                  >
                    <span className={`score-dot ${getScoreClass(pairing.score)}`} />
                    <span className="capitalize">{pairing.ingredient}</span>
                    <span className="text-xs text-muted">{formatScore(pairing.score)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

        {groupedPairings.some(({ category }) => category === "Other") && (
          <div className="space-y-2.5 pt-2 border-t border-border">
            <button
              onClick={() => setShowOther(!showOther)}
              className="text-xs font-medium text-muted uppercase tracking-wider hover:text-foreground transition-colors flex items-center gap-2"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showOther ? "rotate-90" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Other ({groupedPairings.find(g => g.category === "Other")?.pairings.length})
            </button>
            {showOther && (
              <div className="flex flex-wrap gap-1.5 animate-fade-in">
                {groupedPairings
                  .find(g => g.category === "Other")
                  ?.pairings.map((pairing) => (
                    <button
                      key={pairing.ingredient}
                      onClick={() => onPairingClick?.(pairing.ingredient)}
                      className="result-item inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                      title={`${pairing.sharedMolecules} shared molecules`}
                    >
                      <span className={`score-dot ${getScoreClass(pairing.score)}`} />
                      <span className="capitalize">{pairing.ingredient}</span>
                      <span className="text-xs text-muted">{formatScore(pairing.score)}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
