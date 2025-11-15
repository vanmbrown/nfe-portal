export async function fetchFilteredIngredients(
  skinType: string,
  concerns: string[]
) {
  const query = `/api/ingredients?skinType=${encodeURIComponent(
    skinType
  )}&concerns=${encodeURIComponent(concerns.join(','))}`;

  const res = await fetch(query);
  if (!res.ok) throw new Error('Failed to fetch ingredients');
  return res.json();
}

// Backward compatibility - keep old signature for existing code
export async function fetchFilteredIngredientsLegacy(skinType: string, concern: string) {
  return fetchFilteredIngredients(skinType, [concern]);
}
