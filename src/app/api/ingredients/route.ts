import { NextRequest } from 'next/server'
import { successResponse, ApiErrors } from '@/lib/api/response'

// Mock ingredient data - in production, this would come from a database
const MOCK_INGREDIENTS = [
  {
    id: 1,
    name: 'Niacinamide',
    description: 'A form of vitamin B3 that supports barrier function and helps even skin tone.',
    benefits: ['Barrier support', 'Tone-even look', 'Reduces appearance of fine lines'],
    category: 'Vitamin',
    layer: 'Epidermis',
    roles: ['Barrier lipids', 'Tone‑even look'],
  },
  {
    id: 2,
    name: 'Hyaluronic Acid 4D',
    description: 'Multi-weight hyaluronic acid that binds water at multiple skin layers.',
    benefits: ['Multi-level hydration', 'Plumps skin', 'Enhances comfort'],
    category: 'Humectant',
    layer: 'Stratum Corneum',
    roles: ['Hydration network', 'Water binding'],
  },
  {
    id: 3,
    name: 'Tranexamic Acid',
    description: 'Supports a more even-looking complexion by supporting the plasmin pathway.',
    benefits: ['Tone support', 'Helps calm look of discoloration'],
    category: 'Tone',
    layer: 'Epidermis',
    roles: ['Tone support', 'Even‑looking complexion'],
  },
  {
    id: 4,
    name: 'THD Ascorbate',
    description: 'Lipid-soluble form of Vitamin C that supports a brighter, more radiant appearance.',
    benefits: ['Antioxidant', 'Brighter look', 'Supports collagen'],
    category: 'Antioxidant',
    layer: 'Dermis',
    roles: ['Antioxidant', 'Brightened look'],
  },
  {
    id: 5,
    name: 'Bakuchiol',
    description: 'Retinol-alternative that supports smoother look and bouncier feel.',
    benefits: ['Smooth look', 'Elastic feel', 'Gentler than retinol'],
    category: 'Retinol‑alt',
    layer: 'Dermis',
    roles: ['Smooth look', 'Elastic feel'],
  },
]

// Mapping of skin types and concerns to ingredient IDs
const FILTER_MAP: Record<string, Record<string, number[]>> = {
  normal: {
    dark_spots: [1, 3, 4],
    dryness_barrier: [1, 2],
    fine_lines: [1, 4, 5],
    firmness: [4, 5],
    sensitivity_redness: [1, 2],
    texture_pores: [1, 4],
    tone_glow: [1, 3, 4],
    uneven_skin_tone: [1, 3],
  },
  dry: {
    dark_spots: [1, 3],
    dryness_barrier: [1, 2],
    fine_lines: [1, 2, 5],
    firmness: [4, 5],
    sensitivity_redness: [1, 2],
    texture_pores: [1, 2],
    tone_glow: [1, 3, 4],
    uneven_skin_tone: [1, 3],
  },
  combination: {
    dark_spots: [1, 3, 4],
    dryness_barrier: [1, 2],
    fine_lines: [1, 4, 5],
    firmness: [4, 5],
    sensitivity_redness: [1],
    texture_pores: [1, 4],
    tone_glow: [1, 3, 4],
    uneven_skin_tone: [1, 3],
  },
  sensitive: {
    dark_spots: [1, 3],
    dryness_barrier: [1, 2],
    fine_lines: [1, 2],
    firmness: [4],
    sensitivity_redness: [1, 2],
    texture_pores: [1],
    tone_glow: [1, 3],
    uneven_skin_tone: [1, 3],
  },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const skinType = searchParams.get('skinType')
    const concernsParam = searchParams.get('concerns') || searchParams.get('concern') // Support both for backward compatibility
    
    if (!skinType || !concernsParam) {
      return ApiErrors.badRequest('Missing required parameters: skinType and concerns');
    }

    // Parse concerns - support both single and comma-separated values
    const concerns = concernsParam.split(',').map(c => c.trim()).filter(Boolean)
    
    if (concerns.length === 0) {
      return ApiErrors.badRequest('At least one concern must be provided');
    }

    // Get ingredient IDs for all selected concerns (union logic - match any concern)
    const allIngredientIds = new Set<number>()
    
    concerns.forEach((concern) => {
      const ingredientIds = FILTER_MAP[skinType]?.[concern] || []
      ingredientIds.forEach(id => allIngredientIds.add(id))
    })

    // Filter ingredients based on collected IDs
    const filteredIngredients = MOCK_INGREDIENTS.filter((ingredient) =>
      allIngredientIds.has(ingredient.id)
    )

    // If no specific match, return all ingredients as fallback
    const ingredients = filteredIngredients.length > 0 
      ? filteredIngredients 
      : MOCK_INGREDIENTS

    return successResponse(ingredients)
  } catch (error: unknown) {
    console.error('Error fetching ingredients:', error)
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

