"use client";

import { useState, useEffect, useRef } from "react";
import { searchIngredients } from "@/lib/data";

interface SearchInputProps {
  onSelect: (ingredient: string) => void;
  placeholder?: string;
}

export function SearchInput({
  onSelect,
  placeholder = "Search ingredients...",
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
      <div className="input-glow-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className="input-modern w-full px-4 py-3 text-sm text-foreground placeholder:text-muted/60 rounded-lg relative z-10"
        />
      </div>
      {isOpen && (
        <ul className="dropdown-modern absolute z-10 w-full mt-2 rounded-lg max-h-64 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className={`px-4 py-2.5 cursor-pointer capitalize text-sm text-foreground first:rounded-t-lg last:rounded-b-lg transition-colors ${
                index === selectedIndex
                  ? "bg-accent-light text-accent-dark"
                  : "hover:bg-muted-bg"
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
