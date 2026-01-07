"use client";

interface SelectedIngredientsProps {
  ingredients: string[];
  onRemove: (ingredient: string) => void;
  onClear: () => void;
}

export function SelectedIngredients({
  ingredients,
  onRemove,
  onClear,
}: SelectedIngredientsProps) {
  if (ingredients.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
          Combining {ingredients.length} ingredient{ingredients.length > 1 ? "s" : ""}
        </h2>
        <button
          onClick={onClear}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <button
            key={ingredient}
            onClick={() => onRemove(ingredient)}
            className="px-4 py-2 bg-lavender text-foreground rounded-xl text-sm capitalize hover:bg-lavender-dark active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
          >
            {ingredient}
            <span className="text-foreground/60">×</span>
          </button>
        ))}
      </div>
    </div>
  );
}
