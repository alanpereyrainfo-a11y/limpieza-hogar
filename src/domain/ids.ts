export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
