export interface Ingredient {
  ingredient: string;
  pairings: string[];
}

export interface FlavorData {
  ingredients: Ingredient[];
}
