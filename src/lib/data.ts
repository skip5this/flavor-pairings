import flavorData from "@/data/flavor-pairings.json";
import { Ingredient } from "./types";

// Transform "Category, Descriptor" to "Descriptor Category"
// e.g., "Butter, Unsalted" → "Unsalted Butter"
// e.g., "Cheese, Cheddar" → "Cheddar Cheese"
function normalizeIngredientName(name: string): string {
  const trimmed = name.trim();

  // Check if it contains a comma (indicating inverted format)
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length === 2) {
      // Reverse the order: "Category, Descriptor" → "Descriptor Category"
      return `${parts[1]} ${parts[0]}`;
    }
  }

  return trimmed;
}

// Clean up the data (normalize names, trim whitespace, and deduplicate pairings)
const cleanedData: Ingredient[] = flavorData.map((item) => ({
  ingredient: normalizeIngredientName(item.ingredient),
  pairings: [...new Set(item.pairings.map((p) => normalizeIngredientName(p)))],
}));

export function getAllIngredients(): string[] {
  return cleanedData.map((item) => item.ingredient).sort();
}

export function getPairingsForIngredient(ingredient: string): string[] {
  const item = cleanedData.find(
    (i) => i.ingredient.toLowerCase() === ingredient.toLowerCase()
  );
  return item?.pairings || [];
}

// Get pairings that work with ALL selected ingredients (intersection)
export function getCommonPairings(ingredients: string[]): string[] {
  if (ingredients.length === 0) return [];
  if (ingredients.length === 1) return getPairingsForIngredient(ingredients[0]);

  // Get pairings for each ingredient
  const pairingSets = ingredients.map((ing) =>
    new Set(getPairingsForIngredient(ing).map((p) => p.toLowerCase()))
  );

  // Find intersection
  const firstSet = pairingSets[0];
  const commonLower = [...firstSet].filter((pairing) =>
    pairingSets.every((set) => set.has(pairing))
  );

  // Return with original casing from first ingredient's pairings
  const firstPairings = getPairingsForIngredient(ingredients[0]);
  return firstPairings.filter((p) =>
    commonLower.includes(p.toLowerCase())
  );
}

export function searchIngredients(query: string): string[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase();
  return cleanedData
    .filter((item) => item.ingredient.toLowerCase().includes(lowerQuery))
    .map((item) => item.ingredient)
    .slice(0, 10); // Limit results for performance
}

export function getIngredientCount(): number {
  return cleanedData.length;
}

// Check if an ingredient has its own pairings entry (is a "primary" ingredient)
const ingredientSet = new Set(cleanedData.map((i) => i.ingredient.toLowerCase()));

export function isPrimaryIngredient(ingredient: string): boolean {
  return ingredientSet.has(ingredient.toLowerCase());
}

// Check if two ingredients mutually list each other as pairings
export function isMutualPairing(ingredientA: string, ingredientB: string): boolean {
  const aPairings = getPairingsForIngredient(ingredientA).map((p) => p.toLowerCase());
  const bPairings = getPairingsForIngredient(ingredientB).map((p) => p.toLowerCase());

  const aListsB = aPairings.includes(ingredientB.toLowerCase());
  const bListsA = bPairings.includes(ingredientA.toLowerCase());

  return aListsB && bListsA;
}
