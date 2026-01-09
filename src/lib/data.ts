import flavorData from "@/data/flavor-pairings.json";
import { Ingredient } from "./types";

// Clean up ingredient/pairing names
// Handles various messy patterns in the data
function normalizeIngredientName(name: string): string {
  // Trim and normalize whitespace
  let trimmed = name.trim().replace(/\s+/g, " ");

  // Remove parenthetical descriptions: "mahon (aged spanish cheese)" → "mahon"
  trimmed = trimmed.replace(/\s*\([^)]*\)/g, "").trim();

  // Remove orphaned parentheses and malformed entries
  trimmed = trimmed.replace(/\s*\([^)]*$/g, "").trim(); // unclosed "("
  trimmed = trimmed.replace(/^[^(]*\)\s*/g, "").trim(); // orphaned ")" at start
  trimmed = trimmed.replace(/\)\s*$/g, "").trim(); // orphaned ")" at end

  // Handle slashes - take first option: "coffee / espresso" → "coffee"
  if (trimmed.includes("/")) {
    trimmed = trimmed.split("/")[0].trim();
  }

  // Handle colons - take the part after colon if it's a sub-type
  // "steak: filet mignon" → "filet mignon"
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length === 2) {
      const after = parts[1].trim();
      if (after.length > 0) {
        trimmed = after;
      }
    }
  }

  // Handle "X and Y" patterns - extract just X (the base ingredient)
  // e.g., "pork and pork chops" → "pork", "pasta and pasta sauces" → "pasta"
  if (trimmed.toLowerCase().includes(" and ")) {
    const andIndex = trimmed.toLowerCase().indexOf(" and ");
    trimmed = trimmed.slice(0, andIndex).trim();
  }

  // Check if it contains a comma (indicating structured format)
  if (trimmed.includes(",")) {
    // Only take first comma-separated part if there are complex patterns
    const firstComma = trimmed.indexOf(",");
    const beforeComma = trimmed.slice(0, firstComma).trim();
    const afterComma = trimmed.slice(firstComma + 1).trim();

    // Skip if afterComma has more commas (complex pattern like "tomatoes, tomato juice, tomato sauce")
    if (afterComma.includes(",")) {
      return beforeComma;
    }

    const afterLower = afterComma.toLowerCase();
    const beforeLower = beforeComma.toLowerCase();

    // Don't invert these - keep as "X juice", "X zest" format
    if (afterLower === "juice" || afterLower === "zest" || afterLower === "peel") {
      return `${beforeComma} ${afterComma}`;
    }

    // Meat cuts - just return the cut name (more useful for searching)
    // e.g., "beef, brisket" → "brisket", "pork, chops" → "pork chops"
    const meatCategories = ["beef", "pork", "lamb", "veal", "chicken", "turkey", "duck"];
    if (meatCategories.includes(beforeLower)) {
      // Some cuts read better with the meat name
      const keepMeatName = ["ribs", "chops", "roast", "belly"];
      if (keepMeatName.some(k => afterLower.includes(k))) {
        return `${beforeComma} ${afterComma}`;
      }
      // Others are fine standalone
      return afterComma;
    }

    // Standard inversion: "Category, Descriptor" → "Descriptor Category"
    return `${afterComma} ${beforeComma}`;
  }

  return trimmed;
}

// Map variant items to their parent category
// This reduces grey pills by mapping things like "morel mushrooms" → "mushrooms"
function mapToParentCategory(name: string): string {
  const lower = name.toLowerCase().trim();

  // Direct mappings for specific items
  const directMappings: Record<string, string> = {
    // Sesame
    "black sesame seeds": "sesame seeds",
    "white sesame seeds": "sesame seeds",
    // Ginger variants
    "fresh ginger": "ginger",
    "ground ginger": "ginger",
    "dried ginger": "ginger",
    "candied ginger": "ginger",
    "crystallized ginger": "ginger",
    "pickled ginger": "ginger",
    "ginger juice": "ginger",
    "minced ginger": "ginger",
    "grated ginger": "ginger",
    // Common consolidations
    "coconut milk": "coconut",
    "miso soup": "miso",
    // Mushroom variants → mushrooms
    "button mushrooms": "mushrooms",
    "cremini mushrooms": "mushrooms",
    "oyster mushrooms": "mushrooms",
    "shiitake mushrooms": "mushrooms",
    "shiitakes mushrooms": "mushrooms",
    "enoki mushrooms": "mushrooms",
    "wild mushrooms": "mushrooms",
    "cultivated mushrooms": "mushrooms",
    "white mushrooms": "mushrooms",
    "japanese mushrooms": "mushrooms",
    "morel mushrooms": "morels",
    "morels mushrooms": "morels",
    "chanterelle mushrooms": "chanterelles",
    "cepes mushrooms": "porcini mushrooms",
    // Stocks → base ingredient
    "chicken stock": "chicken",
    "chicken stocks": "chicken",
    "beef stock": "beef",
    "beef stocks": "beef",
    "fish stock": "fish",
    "fish stocks": "fish",
    // Onion variants
    "red onions": "onions",
    "yellow onions": "onions",
    "white onions": "onions",
    "spanish onions": "onions",
    "vidalia onions": "onions",
    "pearl onions": "onions",
    "cipollini onions": "onions",
    "spring onions": "scallions",
    "green onions": "scallions",
    // Tomato variants
    "cherry tomatoes": "tomatoes",
    "grape tomatoes": "tomatoes",
    "plum tomatoes": "tomatoes",
    "fresh tomatoes": "tomatoes",
    "canned tomatoes": "tomatoes",
    "roasted tomatoes": "tomatoes",
    "sun-dried tomatoes": "tomatoes",
    "tomato juice": "tomatoes",
    "tomato paste": "tomatoes",
    "tomato sauce": "tomatoes",
    "tomato puree": "tomatoes",
    "tomato purée": "tomatoes",
    "green tomatoes": "tomatoes",
    "fried green tomatoes": "tomatoes",
    "yellow tomatoes": "tomatoes",
    "heirloom tomatoes": "tomatoes",
    "ripe tomatoes": "tomatoes",
    "raw tomatoes": "tomatoes",
    "diced tomatoes": "tomatoes",
    "crushed tomatoes": "tomatoes",
    "stewed tomatoes": "tomatoes",
    "fire-roasted tomatoes": "tomatoes",
    "roma tomatoes": "tomatoes",
    "beefsteak tomatoes": "tomatoes",
    // Potato variants
    "red potatoes": "potatoes",
    "mashed potatoes": "potatoes",
    "baked potatoes": "potatoes",
    // Olive variants
    "black olives": "olives",
    "green olives": "olives",
    "kalamata olives": "olives",
    "niçoise olives": "olives",
    // Bean variants
    "dried beans": "beans",
    "fresh beans": "beans",
    "baked beans": "beans",
    "refried beans": "beans",
    // Garlic variants
    "fresh garlic": "garlic",
    "roasted garlic": "garlic",
    // Parsley variants
    "flat-leaf parsley": "parsley",
    "flat leaf parsley": "parsley",
    "flat-leaf parlsey": "parsley", // typo in data
    "flat-leaf parsley herbs": "parsley",
    "curly parsley": "parsley",
    "italian parsley": "parsley",
    // Mint variants
    "fresh mint": "mint",
    "spearmint": "mint",
    "peppermint": "mint",
    // Basil variants
    "fresh basil": "basil",
    "thai basil": "basil",
    "sweet basil": "basil",
    "purple basil": "basil",
    // Thyme variants
    "fresh thyme": "thyme",
    // Rosemary variants
    "fresh rosemary": "rosemary",
    // Sage variants
    "fresh sage": "sage",
    // Sauce consolidation
    "hollandaise sauces": "hollandaise sauce",
    // Kaffir lime variants
    "kaffir lime leaf": "kaffir limes",
    "kaffir lime leaves": "kaffir limes",
    "kaffir lime": "kaffir limes",
    // Mole variants
    "mole sauce": "mole",
    "mole sauces": "mole",
    "mole negro": "mole",
    // Red wine variants → red wine
    "dry brandy": "brandy",
    "dry red wine": "red wine",
    "dry red": "red wine",
    "pinot noir wine": "red wine",
    "pinot noir) wine": "red wine",
    "syrah) wine": "red wine",
    "madeira red wine": "red wine",
    "fruity wine": "red wine",
    "red wine sauces": "red wine",
    // White wine variants → white wine
    "dry white wine": "white wine",
    "dry white wines": "white wine",
    "dry to off-dry white wine": "white wine",
    "chardonnay wine": "white wine",
    "pinot blanc wine": "white wine",
    "riesling wine": "white wine",
    "sauternes wine": "white wine",
    "sweet white wine": "white wine",
    "or white wine": "white wine",
    // Other wine/spirit consolidation
    "dry sherry": "sherry",
    "dry sherry wine": "sherry",
    "sherry wine": "sherry",
    "sweet sherry wine": "sherry",
    "dry vermouth": "vermouth",
    "vermouth wine": "vermouth",
    "dry wine": "wine",
    "sweet wine": "wine",
    "sweet wines": "wine",
    "champagne wine": "champagne",
    "madeira wine": "madeira",
    "marsala wine": "marsala",
    "port wine": "port",
    "rosé wine": "rosé",
    "sparkling wine": "champagne",
    "vin santo wine": "vin santo",
    "ice wine wine": "ice wine",
    "reduced-wine sauces": "wine",
    // Egg variants → eggs
    "egg": "eggs",
    "chicken eggs": "eggs",
    "custard eggs": "eggs",
    "egg dishes": "eggs",
    "egg salad": "eggs",
    "egg whites": "eggs",
    "egg yolks": "eggs",
    "egg-based dishes eggs": "eggs",
    "hard-boiled egg": "eggs",
    "omelets eggs": "eggs",
    "quail eggs": "eggs",
    "scrambled eggs": "eggs",
    "yolk eggs": "eggs",
    "yolks egg": "eggs",
    "yolks eggs": "eggs",
    "frittata eggs": "eggs",
    // Tea variants → tea
    "black tea": "tea",
    "green tea": "tea",
    "white tea": "tea",
    "oolong tea": "tea",
    "herbal tea": "tea",
    "jasmine tea": "tea",
    "earl grey tea": "tea",
    "chamomile tea": "tea",
    "mint tea": "tea",
    "iced tea": "tea",
    "chai tea": "tea",
    "apple tea": "tea",
    "apricot tea": "tea",
    "lemon tea": "tea",
    "peach tea": "tea",
    // Gin
    "gin flavors": "gin",
    // Anchovies
    "anchovy": "anchovies",
    "anchovy paste": "anchovies",
    "white anchovies": "anchovies",
    // Pepper
    "black peppercorns": "black pepper",
    "white peppercorns": "white pepper",
    "green peppercorns": "green pepper",
    "peppercorns": "black pepper",
    // Cream
    "half-and-half cream": "heavy cream",
    "half and half cream": "heavy cream",
    "half-and-half": "heavy cream",
    "light cream": "heavy cream",
    "whipping cream": "heavy cream",
    // Ham variants -> pork
    "ham": "pork",
    "ham hocks": "pork",
    "ham hock": "pork",
    "hock ham": "pork",
    "hocks ham": "pork",
    "baked ham": "pork",
    "cured ham": "pork",
    "smoked ham": "pork",
    "country ham": "pork",
    "prosciutto": "pork",
    "serrano ham": "pork",
    "iberico ham": "pork",
  };

  if (directMappings[lower]) {
    return directMappings[lower];
  }

  return name;
}

// Consolidate similar ingredients into a single canonical form
function consolidateIngredient(name: string): string {
  // First apply parent category mapping
  let result = mapToParentCategory(name);
  const lower = result.toLowerCase();

  // Skip further consolidation for these categories (keep separate)
  const keepSeparate = [
    // Oils
    "oil", "olive oil", "sesame oil", "coconut oil", "peanut oil",
    // Lemon-prefixed herbs (not the fruit)
    "lemon basil", "lemon thyme", "lemon verbena", "lemongrass",
    // Celery parts
    "celery", "celery root", "celery seed", "celery salt", "celeriac",
    // Mustard variants - keep separate
    "mustard", "mustard seed", "mustard greens", "dijon mustard",
    // Specific varieties to keep
    "meyer lemon", "blood orange", "mandarin orange",
  ];

  if (keepSeparate.some(k => lower === k || lower.includes(" oil"))) {
    return result;
  }

  // Modifiers to strip (fresh, dried, ground, etc.)
  const modifierPrefixes = [
    "fresh ", "dried ", "ground ", "whole ", "raw ", "roasted ",
    "toasted ", "smoked ", "candied ", "crystallized ", "powdered ",
  ];

  for (const prefix of modifierPrefixes) {
    if (lower.startsWith(prefix)) {
      const base = result.slice(prefix.length);
      const baseLower = base.toLowerCase();

      // Keep modifiers on these categories
      const stripModifierExceptions = [
        "pasta", "bread",
        // Keep smoked separate for proteins
        ...(prefix === "smoked " ? ["salmon", "trout", "ham", "bacon", "pork", "chicken", "turkey", "duck", "beef", "sausage", "fish", "mackerel", "eel", "haddock"] : [])
      ];
      if (stripModifierExceptions.some(e => baseLower.includes(e))) {
        return result;
      }

      return base;
    }
  }

  // Juice/zest consolidation with base fruit
  const juiceZestSuffixes = [" juice", " zest", " peel"];
  for (const suffix of juiceZestSuffixes) {
    if (lower.endsWith(suffix)) {
      const base = result.slice(0, -suffix.length);
      const fruits = ["lemon", "lime", "orange", "grapefruit", "tangerine", "yuzu"];
      if (fruits.some(f => base.toLowerCase() === f)) {
        return base;
      }
    }
  }

  return result;
}

// Entries to exclude (not real ingredients or too vague)
const excludeIngredients = new Set([
  "hotness",
  "hearty vegetables",
  "delicate vegetables",
  "vegetables",
  "fruit",
  "freshness",
  "richness",
  "sweetness",
  "tartness",
  "etc.",
  "most fruits",
  "most other herbs",
  "most herbs",
  "most spices",
  "other herbs",
  "other spices",
  "dishes",
  "sauces",
  "stocks",
  "broths",
  "soups",
  "salads",
  "nuts",
  "seeds",
  "herbs",
  "spices",
  "meats",
  "poultry",
  "fruits",
  "cream",
  "milk",
  "holiday cooking",
  "many herbs",
  "many spices",
  "meat",
  "meat dishes",
  "meat ham",
  "meat stews",
  "meat stocks",
  "meat-based sauces",
  "meat-based stocks",
  // Dishes and preparations (not single ingredients)
  "stew", "stews", "stewed dishes",
  "risotto", "risottos",
  "desserts", "dessert",
  "beverages", "beverage",
  "breakfast", "lunch", "dinner",
  "sandwiches", "sandwich",
  "pasta", "pastas",
  "noodles", "noodle",
  "puddings", "pudding", "rice pudding",
  "custard", "custards",
  "pies", "pie",
  "cakes", "cake",
  "cookies", "cookie",
  "tarts", "tart",
  "pastries", "pastry", "pastry crust",
  "breads", "bread",
  "pancakes", "pancake",
  "baked goods",
  "braised dishes", "grilled dishes", "stir-fried dishes",
  "brined dishes", "vegetarian dishes",
  "fruit salads", "green salads", "potato salads",
  "tea sandwiches",
  // Sauces and preparations as categories
  "cream sauces", "white sauces", "mexican sauces",
  "brown butter sauce", "brown butter sauces",
  "béarnaise sauces", "béchamel sauce", "béchamel sauces",
  "mornay sauces", "romesco sauce", "romesco sauces",
  "salsa", "salsas", "fruit salsas",
  "marinades", "marinade",
  "dressings", "salad dressings",
  "vinaigrette", "vinaigrettes", "mustard vinaigrette",
  "clam stocks", "mushroom stocks",
  "shrimp stocks", "turkey stocks", "veal stock", "veal stocks", "vegetable stocks",
  "mirepoix",
  "aioli", "mayonnaise", "pesto",
  "chutney", "chutneys",
  "jams", "jam",
  "sorbet", "sorbets",
  "ice cream", "vanilla ice cream",
  "meringue", "meringues",
  "soufflés", "soufflé",
  "stuffing", "stuffings",
  "savory",
  "stock", "stocks",
  "strongly flavoured foods", "strongly flavored foods",
  "bold flavoured foods", "bold flavored foods",
  "delicate flavoured foods", "delicate flavored foods",
  // Vegetable categories (not single ingredients)
  "root vegetables", "leafy vegetables", "green vegetables",
  "cruciferous vegetables", "bitter greens", "salad greens",
  "winter vegetables", "summer vegetables", "spring vegetables",
  "cooked vegetables", "raw vegetables", "grilled vegetables",
  "roasted vegetables", "steamed vegetables",
  // Other non-specific terms
  "warming",
  "winter savory",
  // Seed oils
  "canola oil", "vegetable oil", "sunflower oil", "safflower oil",
  "corn oil", "soybean oil", "grapeseed oil", "cottonseed oil",
  "rapeseed oil", "sunflower seed oil",
  // Spice categories (not single spices)
  "spice blends", "spice mixes", "warm spices", "sweet spices",
  "pickling spices", "baking spices", "indian spices", "asian spices",
  "middle eastern spices", "african spices", "cajun spices",
  // Cooking methods
  "braising", "grilling", "roasting", "sautéing", "sauteing",
  "frying", "deep frying", "pan frying", "stir frying",
  "baking", "steaming", "poaching", "blanching", "searing",
  "broiling", "smoking", "curing", "pickling", "fermenting",
  "marinating", "brining", "caramelizing", "reducing",
  // More baked goods and multi-ingredient items
  "shortbread", "shortbread baked goods", "shortcake",
  "biscuits", "scones", "muffins", "croissants", "brioche",
  "smoked",
  // Specific dishes and prepared foods
  "borscht", "biryani", "cassoulet", "gumbo", "gumbos",
  "enchiladas", "falafel", "fondue", "fondues", "gazpacho",
  "kebabs", "osso buco", "tagines", "chili con carne",
  "paella", "risotto", "ratatouille", "goulash", "paprikash",
  "brandade", "caponata", "carpaccio", "gravlax", "lox",
  "ceviche", "sashimi", "tempura", "teriyaki", "sukiyaki",
  "confit", "ragu", "bolognese", "carbonara", "alfredo",
  "primavera", "puttanesca", "amatriciana", "arrabbiata",
  "bouillabaisse", "cioppino", "jambalaya", "etouffee",
  "choucroute", "coq au vin", "beef bourguignon",
  "thanksgiving", "christmas", "holiday",
  // Beverages and drinks
  "margaritas", "bloody marys", "smoothies", "eggnog",
  "lemonade", "punch", "cocktails",
  // Other non-ingredients
  "cooking", "finishing", "seasoning", "astringency",
  "caffeine", "richness", "freshness", "tartness",
  // More specific dishes and prepared items
  "aligot", "beurre blanc", "blini", "chiles rellenos",
  "mousse", "consommé", "coleslaw", "rub", "brines",
  "compote", "compotes", "crisp", "crisps", "cobbler", "cobblers",
  "chutney", "chutneys", "relish", "relishes",
  "biscotti", "biscuit", "candy", "marshmallow", "marshmallows",
  "toffee", "caramel", "fudge", "nougat",
  "pilaf", "dumplings", "spring rolls", "blintzes",
  "gravy", "jus", "reduction", "glaze",
  "croutons", "crumbs", "stuffing",
  // More specific items to exclude
  "cherry pie", "ladyfingers", "mexican beverages",
  "mushroom stock", "sous-vide cooking", "sous vide cooking",
  "summer savory", "ripe ingredients", "rare", "roasts",
  "pear beefeater", "orange flower water", "orange-flower water",
  "angel hair noodles", "braised", "eastern mediterranean", "finnan haddie",
  "raw", "sea vegetables", "shad", "sweet vegetables",
  "vegetable", "vegetable puree", "vegetable stock", "vegetarian meals",
  "water",
]);

function shouldExclude(name: string): boolean {
  const lower = name.toLowerCase();

  // Pattern-based exclusions for multi-ingredient items
  const excludePatterns = [
    "sauce", "salad", "baked goods", "dishes", "foods", "soups",
    "stew", "stocks", "chowder", "casserole", "liqueur", "cocktail",
    "dessert", "pastry", "bread", "cake", "cookie", "pie",
    " oils", " nuts", " spices", " herbs", " greens", " cheeses",
    " berries", " poultry", " meats", " roasted",
    "compote", "beverage", " fruits",
    "cuisine", "cusine", "-style",
  ];

  if (excludePatterns.some(p => lower.includes(p))) {
    return true;
  }

  return (
    excludeIngredients.has(lower) ||
    lower.length < 2 ||
    lower.includes(" or ") // Exclude "X or Y" type entries
  );
}

// Clean up and consolidate the data
// 1. Normalize names (fix inverted format)
// 2. Consolidate similar ingredients (fresh ginger + ground ginger → ginger)
// 3. Merge pairings for consolidated ingredients
// 4. Filter out non-ingredient entries
function processData(): Ingredient[] {
  // First pass: normalize and consolidate names
  const consolidated = flavorData
    .map((item) => {
      const normalizedName = normalizeIngredientName(item.ingredient);
      const consolidatedName = consolidateIngredient(normalizedName);
      const consolidatedPairings = item.pairings
        .map((p) => {
          const normalizedPairing = normalizeIngredientName(p);
          return consolidateIngredient(normalizedPairing);
        })
        .filter((p) => !shouldExclude(p)); // Filter out excluded pairings
      return {
        ingredient: consolidatedName,
        pairings: consolidatedPairings,
      };
    })
    .filter((item) => !shouldExclude(item.ingredient)); // Filter out excluded ingredients

  // Second pass: merge ingredients with the same consolidated name
  const mergedMap = new Map<string, Set<string>>();
  for (const item of consolidated) {
    const key = item.ingredient.toLowerCase();
    if (!mergedMap.has(key)) {
      mergedMap.set(key, new Set());
    }
    const pairingsSet = mergedMap.get(key)!;
    for (const pairing of item.pairings) {
      // Don't add the ingredient itself as a pairing
      if (pairing.toLowerCase() !== key) {
        pairingsSet.add(pairing);
      }
    }
  }

  // Convert back to array, keeping original casing from first occurrence
  const nameMap = new Map<string, string>();
  for (const item of consolidated) {
    const key = item.ingredient.toLowerCase();
    if (!nameMap.has(key)) {
      nameMap.set(key, item.ingredient);
    }
  }

  const result: Ingredient[] = [];
  for (const [key, pairingsSet] of mergedMap) {
    result.push({
      ingredient: nameMap.get(key)!,
      pairings: [...pairingsSet],
    });
  }

  // Third pass: Create reverse pairings for grey items that appear in 3+ ingredient lists
  // This turns common pairings into searchable ingredients
  const primarySet = new Set(result.map(r => r.ingredient.toLowerCase()));
  const reverseLookup = new Map<string, Set<string>>();

  // Build reverse lookup: for each pairing, which ingredients list it?
  for (const item of result) {
    for (const pairing of item.pairings) {
      const pairingLower = pairing.toLowerCase();
      if (!reverseLookup.has(pairingLower)) {
        reverseLookup.set(pairingLower, new Set());
      }
      reverseLookup.get(pairingLower)!.add(item.ingredient);
    }
  }

  // Create new ingredients from grey items with 3+ appearances
  for (const [pairingLower, ingredients] of reverseLookup) {
    if (!primarySet.has(pairingLower) && ingredients.size >= 3 && !shouldExclude(pairingLower)) {
      // Find the best casing for this pairing
      let displayName = pairingLower;
      for (const item of result) {
        const found = item.pairings.find(p => p.toLowerCase() === pairingLower);
        if (found) {
          displayName = found;
          break;
        }
      }

      // Add as new ingredient with reverse pairings
      result.push({
        ingredient: displayName,
        pairings: [...ingredients],
      });
      primarySet.add(pairingLower);
    }
  }

  return result;
}

const cleanedData: Ingredient[] = processData();

export function getAllIngredients(): string[] {
  return cleanedData.map((item) => item.ingredient).sort();
}

// All unique items (ingredients + pairings) for the "all" view
const allItems = (() => {
  const itemSet = new Set<string>();
  for (const item of cleanedData) {
    const ing = item.ingredient.trim();
    if (ing.length > 1) itemSet.add(ing);
    for (const pairing of item.pairings) {
      const p = pairing.trim();
      if (p.length > 1) itemSet.add(p);
    }
  }
  return [...itemSet].sort();
})();

export function getPairingsForIngredient(ingredient: string): string[] {
  // Special "all" ingredient returns everything (ingredients + pairings)
  if (ingredient.toLowerCase() === "all") {
    return allItems;
  }

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

  // Include "all" as a special searchable option
  const results = cleanedData
    .filter((item) => item.ingredient.toLowerCase().includes(lowerQuery))
    .map((item) => item.ingredient)
    .slice(0, 10);

  // Add "all" if it matches the query
  if ("all".includes(lowerQuery)) {
    return ["all", ...results].slice(0, 10);
  }

  return results;
}

export function getIngredientCount(): number {
  return cleanedData.length;
}

// Check if an ingredient has its own pairings entry (is a "primary" ingredient)
const ingredientSet = new Set(cleanedData.map((i) => i.ingredient.toLowerCase()));

export function isPrimaryIngredient(ingredient: string): boolean {
  // "all" is a special pseudo-ingredient
  if (ingredient.toLowerCase() === "all") return true;
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

// Build a list of primary ingredients sorted by length (longest first) for matching
const primaryIngredientsList = [...ingredientSet].sort((a, b) => b.length - a.length);

// Common suffixes that indicate category membership
const categorySuffixes = [
  "mushrooms", "mushroom",
  "cheese", "cheeses",
  "onions", "onion",
  "peppers", "pepper",
  "tomatoes", "tomato",
  "potatoes", "potato",
  "beans", "bean",
  "berries", "berry",
  "greens", "green",
  "olives", "olive",
  "cherries", "cherry",
  "apples", "apple",
  "pears", "pear",
  "plums", "plum",
  "nuts", "nut",
  "seeds", "seed",
  "herbs", "herb",
  "lettuces", "lettuce",
  "squash",
  "melons", "melon",
  "citrus",
  "vinegar", "vinegars",
  "wine", "wines",
  "stock", "stocks",
  "broth", "broths",
  "tea", "teas",
];

// Map a pairing to its best matching primary ingredient
// Returns the original if no match found
export function mapToPrimaryIngredient(pairing: string): string {
  const lower = pairing.toLowerCase().trim();

  // If already a primary ingredient, return as-is
  if (ingredientSet.has(lower)) {
    // Return with proper casing from the primary list
    const match = cleanedData.find(i => i.ingredient.toLowerCase() === lower);
    return match?.ingredient || pairing;
  }

  // Try singular/plural forms
  // If plural, try singular
  if (lower.endsWith("ies")) {
    const singular = lower.slice(0, -3) + "y"; // berries → berry
    if (ingredientSet.has(singular)) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === singular);
      return match?.ingredient || singular;
    }
  }
  if (lower.endsWith("es")) {
    const singular = lower.slice(0, -2); // tomatoes → tomato
    if (ingredientSet.has(singular)) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === singular);
      return match?.ingredient || singular;
    }
    const singular2 = lower.slice(0, -1); // wines → wine (via 'es' ending)
    if (ingredientSet.has(singular2)) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === singular2);
      return match?.ingredient || singular2;
    }
  }
  if (lower.endsWith("s") && !lower.endsWith("ss")) {
    const singular = lower.slice(0, -1); // oils → oil
    if (ingredientSet.has(singular)) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === singular);
      return match?.ingredient || singular;
    }
  }
  // If singular, try plural
  const pluralS = lower + "s";
  if (ingredientSet.has(pluralS)) {
    const match = cleanedData.find(i => i.ingredient.toLowerCase() === pluralS);
    return match?.ingredient || pluralS;
  }
  const pluralEs = lower + "es";
  if (ingredientSet.has(pluralEs)) {
    const match = cleanedData.find(i => i.ingredient.toLowerCase() === pluralEs);
    return match?.ingredient || pluralEs;
  }

  // Try suffix matching: "wild mushrooms" → "mushrooms"
  for (const suffix of categorySuffixes) {
    if (lower.endsWith(" " + suffix) || lower === suffix) {
      // Check if the suffix itself is a primary ingredient
      if (ingredientSet.has(suffix)) {
        const match = cleanedData.find(i => i.ingredient.toLowerCase() === suffix);
        return match?.ingredient || suffix;
      }
      // Check for plural/singular variants
      const singular = suffix.endsWith("s") ? suffix.slice(0, -1) : suffix;
      const plural = suffix.endsWith("s") ? suffix : suffix + "s";
      if (ingredientSet.has(singular)) {
        const match = cleanedData.find(i => i.ingredient.toLowerCase() === singular);
        return match?.ingredient || singular;
      }
      if (ingredientSet.has(plural)) {
        const match = cleanedData.find(i => i.ingredient.toLowerCase() === plural);
        return match?.ingredient || plural;
      }
    }
  }

  // Try finding a primary ingredient as a suffix of the pairing
  // e.g., "fresh ginger" → "ginger", "roasted garlic" → "garlic"
  for (const primary of primaryIngredientsList) {
    if (lower.endsWith(" " + primary) && primary.length > 3) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === primary);
      return match?.ingredient || primary;
    }
  }

  // Try finding a primary ingredient as a prefix
  // e.g., "ginger juice" → "ginger"
  for (const primary of primaryIngredientsList) {
    if (lower.startsWith(primary + " ") && primary.length > 3) {
      const match = cleanedData.find(i => i.ingredient.toLowerCase() === primary);
      return match?.ingredient || primary;
    }
  }

  // No match found, return original
  return pairing;
}
