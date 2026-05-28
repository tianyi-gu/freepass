import type { Resource, ResourceCategory } from '@/hooks/use-resources';

function normalize(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

function compact(value: string | null | undefined): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}

export function resourceMatchesCategory(resource: Resource, category: ResourceCategory): boolean {
  if (resource.category_id && resource.category_id === category.id) return true;

  const categoryName = normalize(category.name);
  const categoryKey = compact(category.name);
  if (!categoryName) return false;

  const tags = resource.tags ?? [];
  return tags.some((tag) => {
    const tagName = normalize(tag);
    const tagKey = compact(tag);
    return tagName === categoryName || tagKey === categoryKey || tagName.includes(categoryName);
  });
}

export function resourceMatchesSearch(resource: Resource, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchable = [
    resource.name,
    resource.description,
    resource.address,
    resource.city,
    resource.state,
    resource.zip_code,
    resource.phone,
    resource.email,
    resource.website,
    resource.hours,
    resource.category?.name,
    ...(resource.tags ?? []),
  ].map(normalize).join(' ');

  return terms.every((term) => searchable.includes(term));
}
