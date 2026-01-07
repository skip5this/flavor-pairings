"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "@/components/SearchInput";
import { PairingsList } from "@/components/PairingsList";
import { SelectedIngredients } from "@/components/SelectedIngredients";
import { getCommonPairings, getIngredientCount } from "@/lib/data";

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const pairings = useMemo(
    () => getCommonPairings(selectedIngredients),
    [selectedIngredients]
  );

  const addIngredient = (ingredient: string) => {
    // Don't add if already selected
    if (selectedIngredients.some(
      (i) => i.toLowerCase() === ingredient.toLowerCase()
    )) {
      return;
    }
    setSelectedIngredients((prev) => [...prev, ingredient]);
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((i) => i.toLowerCase() !== ingredient.toLowerCase())
    );
  };

  const clearAll = () => {
    setSelectedIngredients([]);
  };

  const handlePairingClick = (pairing: string) => {
    // If pairing is already selected, remove it; otherwise add it
    if (selectedIngredients.some(
      (i) => i.toLowerCase() === pairing.toLowerCase()
    )) {
      removeIngredient(pairing);
    } else {
      addIngredient(pairing);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background image with fade */}
      <div
        className="absolute inset-0 bg-[url('/bg-image2.png')] bg-no-repeat bg-center bg-contain opacity-60 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 60% at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at center, black 20%, transparent 70%)',
        }}
      />
      {/* Top edge fade overlay - mobile and tablet only */}
      <div
        className="absolute inset-0 pointer-events-none lg:hidden"
        style={{
          background: 'linear-gradient(to bottom, var(--background) 0%, var(--background) 15%, transparent 35%)',
        }}
      />
      <div className="relative max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-8 lg:pt-32 lg:pb-12">
        {/* Header */}
        <header className="mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 font-[family-name:var(--font-display)] uppercase tracking-[0.2em] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            Flavor Pairings
          </h1>
          <p className="text-muted text-lg drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            Discover what ingredients work well together
          </p>
          <p className="text-sm text-muted/70 mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
            {getIngredientCount()} ingredients
          </p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            onSelect={addIngredient}
            placeholder="Search for an ingredient..."
          />
        </div>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mb-6">
            <SelectedIngredients
              ingredients={selectedIngredients}
              onRemove={removeIngredient}
              onClear={clearAll}
            />
          </div>
        )}

        {/* Results */}
        {selectedIngredients.length > 0 && (
          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
            {pairings.length > 0 ? (
              <PairingsList
                ingredients={selectedIngredients}
                pairings={pairings}
                onPairingClick={handlePairingClick}
              />
            ) : (
              <div className="text-center py-8 text-muted">
                No common pairings found for these ingredients
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
