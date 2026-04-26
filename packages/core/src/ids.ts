export function stableHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).padStart(7, "0");
}

export function createStableId(prefix: string, parts: Array<string | number>): string {
  const normalized = parts.map((part) => String(part).trim()).join("|");
  return `${prefix}-${stableHash(normalized)}`;
}
