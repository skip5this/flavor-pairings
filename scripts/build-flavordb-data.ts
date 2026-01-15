import { readFileSync, writeFileSync } from "fs";
import { parse } from "csv-parse/sync";

// Types
interface Ingredient {
  id: number;
  name: string;
  category: string;
}

interface IngredientMolecule {
  entityId: number;
  ingredientName: string;
  pubchemId: number;
  moleculeName: string;
}

interface Pairing {
  ingredient: string;
  score: number; // Jaccard similarity (0-1)
  sharedMolecules: number;
}

interface ProcessedIngredient {
  name: string;
  category: string;
  molecules: number[]; // Array of pubchem IDs
  pairings: Pairing[];
}

// Load and parse CSVs
console.log("Loading CSVs...");

const ingredientsRaw = readFileSync("data/ingredients.csv", "utf-8");
const ingredientMoleculesRaw = readFileSync("data/ingredient_molecules.csv", "utf-8");

const ingredients: Ingredient[] = (parse(ingredientsRaw, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[]).map((row) => ({
  id: parseInt(row.entity_id),
  name: row.ingredient_name,
  category: row.category,
}));

const ingredientMolecules: IngredientMolecule[] = (parse(ingredientMoleculesRaw, {
  columns: true,
  skip_empty_lines: true,
}) as Record<string, string>[]).map((row) => ({
  entityId: parseInt(row.entity_id),
  ingredientName: row.ingredient_name,
  pubchemId: parseInt(row.pubchem_id),
  moleculeName: row.molecule_name,
}));

console.log(`Loaded ${ingredients.length} ingredients`);
console.log(`Loaded ${ingredientMolecules.length} ingredient-molecule links`);

// Build ingredient -> molecule set mapping
console.log("Building molecule sets...");
const ingredientMoleculeMap = new Map<number, Set<number>>();
const ingredientNameMap = new Map<number, string>();
const ingredientCategoryMap = new Map<number, string>();

for (const ing of ingredients) {
  ingredientMoleculeMap.set(ing.id, new Set());
  ingredientNameMap.set(ing.id, ing.name);
  ingredientCategoryMap.set(ing.id, ing.category);
}

for (const im of ingredientMolecules) {
  const set = ingredientMoleculeMap.get(im.entityId);
  if (set) {
    set.add(im.pubchemId);
  }
}

// Filter out ingredients with no molecules
const validIngredientIds = Array.from(ingredientMoleculeMap.entries())
  .filter(([_, molecules]) => molecules.size > 0)
  .map(([id]) => id);

console.log(`${validIngredientIds.length} ingredients have molecules`);

// Calculate Jaccard similarity between two sets
function jaccardSimilarity(setA: Set<number>, setB: Set<number>): { score: number; shared: number } {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  const shared = intersection.size;
  const score = union.size > 0 ? shared / union.size : 0;
  return { score, shared };
}

// Calculate all pairings
console.log("Calculating pairings (this may take a moment)...");
const results: ProcessedIngredient[] = [];

for (let i = 0; i < validIngredientIds.length; i++) {
  const idA = validIngredientIds[i];
  const nameA = ingredientNameMap.get(idA)!;
  const categoryA = ingredientCategoryMap.get(idA)!;
  const moleculesA = ingredientMoleculeMap.get(idA)!;

  const pairings: Pairing[] = [];

  for (let j = 0; j < validIngredientIds.length; j++) {
    if (i === j) continue;

    const idB = validIngredientIds[j];
    const nameB = ingredientNameMap.get(idB)!;
    const moleculesB = ingredientMoleculeMap.get(idB)!;

    const { score, shared } = jaccardSimilarity(moleculesA, moleculesB);

    // Only include pairings with at least 1 shared molecule
    if (shared > 0) {
      pairings.push({
        ingredient: nameB,
        score: Math.round(score * 1000) / 1000, // Round to 3 decimals
        sharedMolecules: shared,
      });
    }
  }

  // Sort by score descending
  pairings.sort((a, b) => b.score - a.score);

  results.push({
    name: nameA,
    category: categoryA,
    molecules: Array.from(moleculesA), // Include molecule IDs
    pairings,
  });

  if ((i + 1) % 100 === 0) {
    console.log(`Processed ${i + 1}/${validIngredientIds.length} ingredients`);
  }
}

// Sort results alphabetically by name
results.sort((a, b) => a.name.localeCompare(b.name));

// Write output
const output = {
  generatedAt: new Date().toISOString(),
  ingredientCount: results.length,
  ingredients: results,
};

console.log("Writing output...");
writeFileSync("src/data/flavordb-pairings.json", JSON.stringify(output));
console.log(`Done! Wrote ${results.length} ingredients to src/data/flavordb-pairings.json`);

// Calculate molecule frequency (how many ingredients contain each molecule)
console.log("Calculating molecule frequencies...");
const moleculeFrequency = new Map<number, number>();
for (const ing of results) {
  for (const mol of ing.molecules) {
    moleculeFrequency.set(mol, (moleculeFrequency.get(mol) || 0) + 1);
  }
}

// Save frequency data
const frequencyOutput = {
  totalIngredients: results.length,
  frequencies: Object.fromEntries(moleculeFrequency),
};
writeFileSync("src/data/molecule-frequencies.json", JSON.stringify(frequencyOutput));
console.log(`Saved molecule frequencies for ${moleculeFrequency.size} molecules`);

// Print some stats
const avgPairings = results.reduce((sum, r) => sum + r.pairings.length, 0) / results.length;
const avgMolecules = results.reduce((sum, r) => sum + r.molecules.length, 0) / results.length;
console.log(`Average pairings per ingredient: ${avgPairings.toFixed(1)}`);
console.log(`Average molecules per ingredient: ${avgMolecules.toFixed(1)}`);
