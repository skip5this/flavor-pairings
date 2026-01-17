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
    <div className="flex flex-wrap items-center gap-2">
      {ingredients.map((ingredient) => (
        <button
          key={ingredient}
          onClick={() => onRemove(ingredient)}
          className="chip-accent inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize cursor-pointer"
        >
          {ingredient}
          <svg
            className="w-3.5 h-3.5 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ))}
      {ingredients.length > 1 && (
        <button
          onClick={onClear}
          className="text-xs text-muted hover:text-foreground transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
