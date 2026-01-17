"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "@/components/SearchInput";
import { PairingsList } from "@/components/PairingsList";
import { SelectedIngredients } from "@/components/SelectedIngredients";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCommonPairings, getIngredientCount, type Pairing } from "@/lib/data";

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const pairings = useMemo(
    () => getCommonPairings(selectedIngredients),
    [selectedIngredients]
  );

  const addIngredient = (ingredient: string) => {
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
      {/* Background effects */}
      <div className="gradient-mesh">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
      </div>
      <div className="noise-overlay" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-5 py-16 sm:py-24">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Flavor Pairings
          </h1>
          <p className="text-muted text-sm">
            {getIngredientCount()} ingredients to explore
          </p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchInput
            onSelect={addIngredient}
            placeholder="Search ingredients..."
          />
        </div>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <SelectedIngredients
              ingredients={selectedIngredients}
              onRemove={removeIngredient}
              onClear={clearAll}
            />
          </div>
        )}

        {/* Results */}
        {selectedIngredients.length > 0 && (
          <div className="card-elevated rounded-xl p-5 animate-fade-in">
            {pairings.length > 0 ? (
              <PairingsList
                ingredients={selectedIngredients}
                pairings={pairings}
                onPairingClick={handlePairingClick}
              />
            ) : (
              <div className="text-center py-12 text-muted text-sm">
                No common pairings found
              </div>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {selectedIngredients.length === 0 && (
          <div className="text-center text-muted text-sm mt-16">
            <p>Start by searching for an ingredient above</p>
          </div>
        )}
      </div>
    </div>
  );
}
