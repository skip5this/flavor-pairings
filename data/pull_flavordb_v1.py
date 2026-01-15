import csv
import json
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

BASE = "https://cosylab.iiitd.edu.in/flavordb/entities_json?id="
MAX_ID = 936  # FlavorDB has 936 ingredients/entities 

USER_AGENT = "Mozilla/5.0 (compatible; FlavorDBScraper/1.0)"

@dataclass
class IngredientRow:
    entity_id: int
    name: str
    synonyms: str
    scientific_name: str
    category: str

@dataclass
class IngredientMoleculeRow:
    entity_id: int
    ingredient_name: str
    pubchem_id: str
    molecule_name: str
    flavor_profile: str

def fetch_json(entity_id: int, retries: int = 3, backoff_s: float = 1.0) -> Optional[Dict[str, Any]]:
    url = f"{BASE}{entity_id}"
    headers = {"User-Agent": USER_AGENT}
    req = Request(url, headers=headers)

    for attempt in range(retries):
        try:
            with urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as e:
            if attempt < retries - 1:
                time.sleep(backoff_s * (attempt + 1))
            else:
                print(f"[WARN] Failed id={entity_id}: {e}")
                return None

def as_str(x: Any) -> str:
    if x is None:
        return ""
    if isinstance(x, list):
        return ", ".join([str(i).strip() for i in x if str(i).strip()])
    return str(x).strip()

def main():
    ingredients: List[IngredientRow] = []
    edges: List[IngredientMoleculeRow] = []

    for entity_id in range(1, MAX_ID + 1):
        data = fetch_json(entity_id)
        if not data:
            continue

        # These fields match FlavorDB's entity JSON structure 
        name = as_str(data.get("entity_alias_readable"))
        synonyms = as_str(data.get("entity_alias_synonyms"))
        scientific_name = as_str(data.get("natural_source_name"))
        category = as_str(data.get("category_readable"))

        ingredients.append(
            IngredientRow(
                entity_id=entity_id,
                name=name,
                synonyms=synonyms,
                scientific_name=scientific_name,
                category=category,
            )
        )

        mols = data.get("molecules") or []
        for m in mols:
            pubchem_id = as_str(m.get("pubchem_id") or m.get("pubchem id"))
            mol_name = as_str(m.get("common_name") or m.get("common name"))
            flavor_profile = as_str(m.get("flavor_profile") or m.get("flavor profile"))

            if pubchem_id or mol_name:
                edges.append(
                    IngredientMoleculeRow(
                        entity_id=entity_id,
                        ingredient_name=name,
                        pubchem_id=pubchem_id,
                        molecule_name=mol_name,
                        flavor_profile=flavor_profile,
                    )
                )

        # Be polite to their server
        if entity_id % 25 == 0:
            print(f"Fetched {entity_id}/{MAX_ID}...")
        time.sleep(0.15)

    # ingredients.csv
    with open("ingredients.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["entity_id", "ingredient_name", "synonyms", "scientific_name", "category"])
        for r in ingredients:
            w.writerow([r.entity_id, r.name, r.synonyms, r.scientific_name, r.category])

    # ingredient_molecules.csv
    with open("ingredient_molecules.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["entity_id", "ingredient_name", "pubchem_id", "molecule_name", "flavor_profile"])
        for r in edges:
            w.writerow([r.entity_id, r.ingredient_name, r.pubchem_id, r.molecule_name, r.flavor_profile])

    # molecules.csv (unique)
    seen = set()
    molecules_unique = []
    for r in edges:
        key = (r.pubchem_id, r.molecule_name)
        if key not in seen:
            seen.add(key)
            molecules_unique.append(r)

    with open("molecules.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["pubchem_id", "molecule_name", "example_flavor_profile"])
        for r in molecules_unique:
            w.writerow([r.pubchem_id, r.molecule_name, r.flavor_profile])

    print("✅ Done.")
    print(f"ingredients rows: {len(ingredients)}")
    print(f"ingredient–molecule rows: {len(edges)}")
    print(f"unique molecules rows: {len(molecules_unique)}")

if __name__ == "__main__":
    main()
