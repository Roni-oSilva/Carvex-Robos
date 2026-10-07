"use client";

import { addCategory, addTag, deleteCategory, deleteTag } from "@/actions/taxonomy.actions";
import { TaxonomyManager } from "./taxonomy-manager";

type Item = { id: string; name: string };

export function CategoriesManager({ items }: { items: Item[] }) {
  return <TaxonomyManager title="Categorias" items={items} onAdd={addCategory} onDelete={deleteCategory} />;
}

export function TagsManager({ items }: { items: Item[] }) {
  return <TaxonomyManager title="Tags" items={items} onAdd={addTag} onDelete={deleteTag} />;
}
