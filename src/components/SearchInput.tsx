"use client";

import { useState, useEffect, useRef } from "react";
import { searchIngredients } from "@/lib/data";

interface SearchInputProps {
  onSelect: (ingredient: string) => void;
  placeholder?: string;
}

export function SearchInput({
  onSelect,
  placeholder = "Search for an ingredient...",
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const results = searchIngredients(query);
    setSuggestions(results);
    setIsOpen(results.length > 0 && query.length > 0);
    setSelectedIndex(-1);
  }, [query]);

  const handleSelect = (ingredient: string) => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onSelect(ingredient);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        className="w-full px-5 py-4 text-lg text-foreground placeholder:text-muted bg-card border-2 border-border rounded-2xl focus:border-lavender focus:ring-2 focus:ring-lavender/30 focus:outline-none transition-colors"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-2 bg-card border border-border rounded-2xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className={`px-4 py-3 cursor-pointer capitalize text-foreground first:rounded-t-2xl last:rounded-b-2xl ${
                index === selectedIndex
                  ? "bg-lavender/40"
                  : "hover:bg-sky/30"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
