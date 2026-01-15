import flavorData from "@/data/flavordb-pairings.json";
import moleculeFreqData from "@/data/molecule-frequencies.json";

// Build set of "distinctive" molecules (appear in <20% of ingredients)
const DISTINCTIVE_THRESHOLD = 0.2; // Molecules in <20% of ingredients are "distinctive"
const distinctiveMolecules = new Set<number>();
const frequencies = moleculeFreqData.frequencies as Record<string, number>;
const totalIngredientsInData = moleculeFreqData.totalIngredients;

for (const [molId, freq] of Object.entries(frequencies)) {
  if (freq / totalIngredientsInData < DISTINCTIVE_THRESHOLD) {
    distinctiveMolecules.add(parseInt(molId));
  }
}

console.log(`Loaded ${distinctiveMolecules.size} distinctive molecules (appear in <${DISTINCTIVE_THRESHOLD * 100}% of ingredients)`);

export interface Pairing {
  ingredient: string;
  category: string;
  score: number;
  sharedMolecules: number;
}

export interface Ingredient {
  name: string;
  category: string;
  molecules: number[]; // PubChem IDs
  pairings: Pairing[];
}

// Filter out ingredients with incomplete/suspicious data:
// - Less than 10 molecules (clearly incomplete)
// - 92-97 molecules (FlavorDB "base set" - assigned to many ingredients without real data)
function hasGoodData(ingredient: Ingredient): boolean {
  const count = ingredient.molecules.length;
  if (count < 10) return false;
  if (count >= 92 && count <= 97) return false;
  return true;
}

const validIngredients = (flavorData.ingredients as Ingredient[]).filter(hasGoodData);

// Build lookup maps
const ingredientMap = new Map<string, Ingredient>();
const ingredientMoleculeSet = new Map<string, Set<number>>(); // For fast intersection
const ingredientsByCategory = new Map<string, Ingredient[]>();

for (const ingredient of validIngredients) {
  const key = ingredient.name.toLowerCase();
  ingredientMap.set(key, ingredient);
  ingredientMoleculeSet.set(key, new Set(ingredient.molecules));

  const categoryList = ingredientsByCategory.get(ingredient.category) || [];
  categoryList.push(ingredient);
  ingredientsByCategory.set(ingredient.category, categoryList);
}

// Sorted list of all ingredient names for search (only valid ingredients)
export const allIngredients: string[] = validIngredients
  .map((i) => i.name)
  .sort((a, b) => a.localeCompare(b));

// All categories
export const allCategories: string[] = Array.from(ingredientsByCategory.keys()).sort();

/**
 * Get total ingredient count
 */
export function getIngredientCount(): number {
  return allIngredients.length;
}

/**
 * Check if an ingredient exists in the database
 */
export function isValidIngredient(name: string): boolean {
  return ingredientMap.has(name.toLowerCase());
}

/**
 * Get ingredient data by name
 */
export function getIngredient(name: string): Ingredient | undefined {
  return ingredientMap.get(name.toLowerCase());
}

/**
 * Get ingredients by category
 */
export function getIngredientsByCategory(category: string): Ingredient[] {
  return ingredientsByCategory.get(category) || [];
}

// Minimum score threshold (5% - lower because Jaccard naturally gives lower scores with more ingredients)
const MIN_SCORE_THRESHOLD = 0.05;

// Max pairings to show (unless "all" is requested)
const MAX_PAIRINGS = 100;

/**
 * Get pairings for a single ingredient, sorted by score
 */
export function getPairings(ingredientName: string, showAll = false): Pairing[] {
  const ingredient = ingredientMap.get(ingredientName.toLowerCase());
  if (!ingredient) return [];

  // Add category to each pairing
  const withCategory = ingredient.pairings
    .filter(p => p.score >= MIN_SCORE_THRESHOLD)
    .map(p => {
      const pairingIngredient = ingredientMap.get(p.ingredient.toLowerCase());
      return {
        ...p,
        category: pairingIngredient?.category || "Other",
      };
    });

  return showAll ? withCategory : withCategory.slice(0, MAX_PAIRINGS);
}

/**
 * Calculate intersection of multiple sets
 */
function intersectSets(sets: Set<number>[]): Set<number> {
  if (sets.length === 0) return new Set();
  if (sets.length === 1) return new Set(sets[0]);

  const sorted = [...sets].sort((a, b) => a.size - b.size);
  let result = new Set(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    result = new Set([...result].filter(x => next.has(x)));
    if (result.size === 0) break;
  }

  return result;
}

/**
 * Get pairings using consistent Jaccard similarity
 *
 * Score = distinctive molecules shared by ALL (selected + pairing) /
 *         distinctive molecules in ANY (selected + pairing)
 *
 * This ensures scores naturally DECREASE as you add more ingredients,
 * since the union grows larger.
 */
export function getCommonPairings(ingredientNames: string[]): Pairing[] {
  if (ingredientNames.length === 0) return [];

  if (ingredientNames.length === 1) {
    return getPairings(ingredientNames[0]);
  }

  // Get molecule sets for selected ingredients (filtered to distinctive only)
  const selectedMoleculeSets = ingredientNames
    .map(name => {
      const fullSet = ingredientMoleculeSet.get(name.toLowerCase());
      if (!fullSet) return null;
      // Filter to distinctive molecules only
      return new Set([...fullSet].filter(m => distinctiveMolecules.has(m)));
    })
    .filter((set): set is Set<number> => set !== null);

  if (selectedMoleculeSets.length !== ingredientNames.length) {
    return [];
  }

  const results: Pairing[] = [];
  const selectedNamesLower = new Set(ingredientNames.map(n => n.toLowerCase()));

  for (const [name, fullMoleculeSet] of ingredientMoleculeSet) {
    // Skip selected ingredients
    if (selectedNamesLower.has(name)) continue;

    // Get distinctive molecules for this pairing ingredient
    const pairingDistinctive = new Set([...fullMoleculeSet].filter(m => distinctiveMolecules.has(m)));

    // Calculate Jaccard: intersection / union of ALL ingredients (selected + this pairing)
    const allSets = [...selectedMoleculeSets, pairingDistinctive];

    // Intersection: molecules in ALL sets
    let intersection = new Set(allSets[0]);
    for (let i = 1; i < allSets.length; i++) {
      intersection = new Set([...intersection].filter(x => allSets[i].has(x)));
    }

    // Union: molecules in ANY set
    const union = new Set(allSets.flatMap(s => [...s]));

    const sharedCount = intersection.size;
    if (sharedCount === 0) continue;

    // Jaccard similarity
    const score = union.size > 0 ? sharedCount / union.size : 0;

    const ingredient = ingredientMap.get(name);
    if (!ingredient) continue;

    results.push({
      ingredient: ingredient.name,
      category: ingredient.category,
      score: Math.round(score * 1000) / 1000,
      sharedMolecules: sharedCount,
    });
  }

  // Sort by score, then by shared count
  const filtered = results
    .filter(p => p.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score || b.sharedMolecules - a.sharedMolecules);

  // Dynamic limit based on selection size
  const count = ingredientNames.length;
  const dynamicLimit = count === 1 ? MAX_PAIRINGS
    : count === 2 ? 75
    : count === 3 ? 50
    : count <= 5 ? 30
    : count <= 10 ? 20
    : 15;

  return filtered.slice(0, dynamicLimit);
}

/**
 * Search ingredients by name (fuzzy match)
 */
export function searchIngredients(query: string, limit = 10): string[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: Array<{ name: string; score: number }> = [];

  for (const name of allIngredients) {
    const lowerName = name.toLowerCase();

    // Exact match
    if (lowerName === lowerQuery) {
      results.push({ name, score: 100 });
    }
    // Starts with query
    else if (lowerName.startsWith(lowerQuery)) {
      results.push({ name, score: 80 });
    }
    // Contains query
    else if (lowerName.includes(lowerQuery)) {
      results.push({ name, score: 60 });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.name);
}
