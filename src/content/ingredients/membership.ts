import type { FamilyIngredient, IngredientFamilyId } from './types'

/**
 * Family membership for the ingredients in NFE's published glossary.
 *
 * Every entry here corresponds to an entry in
 * data/education/ingredientGlossary.json. Names and roles are taken from that
 * file rather than rewritten, and family assignment follows the `category` and
 * `function` values already recorded there. Nothing was invented: where the
 * glossary does not place an ingredient in one of the eight families, it is
 * left unassigned rather than forced into the nearest one.
 *
 * Five glossary entries are deliberately unassigned:
 *
 *  - Aqua (Water), Optiphen Plus, and the pH/stabilisation group are
 *    formulation infrastructure, not a cosmetic family.
 *  - Bakuchiol is recorded as "Retinol Alternative / Skin Conditioning", which
 *    maps to none of the eight. Assigning it would be a guess.
 *
 * All five remain visible in the full glossary on Ingredients, so nothing is
 * hidden — they simply do not appear under a family heading.
 *
 * WHAT THIS FILE IS NOT: a statement of product composition. The glossary and
 * data/products/*.json list different ingredient sets, and that discrepancy is
 * unresolved. A family listing says "NFE formulates with this kind of
 * ingredient", never "this is in your bottle". Product pages own verified INCI.
 */
export const FAMILY_INGREDIENTS: FamilyIngredient[] = [
  {
    id: 'rosa-damascena-flower-water',
    name: 'Rosa Damascena Flower Water',
    role: 'Aromatic hydrosol and humectant',
    familyIds: ['humectants'],
  },
  {
    id: 'hyaluronic-acid',
    name: 'Hyaluronic Acid',
    role: 'Humectant and hydration support',
    familyIds: ['humectants'],
  },
  {
    id: 'd-panthenol',
    name: 'D-Panthenol',
    role: 'Humectant with barrier support',
    familyIds: ['humectants'],
  },
  {
    id: 'humectant-film-formers',
    name: 'Propanediol, Glycerin, Gamma-PGA, Silk Amino Acids, Snow Mushroom Extract',
    role: 'Humectants and film-formers',
    familyIds: ['humectants'],
  },
  {
    id: 'texture-skin-feel-enhancers',
    name: 'Coco-Caprylate/Caprate, C12-15 Alkyl Benzoate, Squalane',
    role: 'Texture and skin-feel enhancers',
    familyIds: ['emollients'],
  },
  {
    id: 'emulsifying-emollients',
    name: 'Montanov 202, Sunflower Lecithin',
    role: 'Blend the oil and water phases',
    familyIds: ['emollients'],
  },
  {
    id: 'carrier-oils',
    name: 'Cacay, Rosehip, Tamanu, Prickly Pear Seed, Sea-Buckthorn, Jojoba, Sweet Almond, Babassu, Carrot Seed, Cocoa Butter, Shea Butter',
    role: 'Carrier oils and emollients',
    familyIds: ['botanical-oils', 'emollients'],
  },
  {
    id: 'ceramide-complex',
    name: 'Ceramide NP, Ceramide AP and Ceramide EOP',
    role: 'Barrier support and skin conditioning',
    familyIds: ['barrier-supportive-lipids'],
  },
  {
    id: 'ectoin',
    name: 'Ectoin',
    role: 'Barrier support',
    familyIds: ['barrier-supportive-lipids'],
  },
  {
    id: 'niacinamide',
    name: 'Niacinamide',
    role: 'Skin conditioning and tone support',
    familyIds: ['tone-supportive-cosmetic-ingredients'],
  },
  {
    id: 'tranexamic-acid',
    name: 'Tranexamic Acid',
    role: 'Skin conditioning and tone support',
    familyIds: ['tone-supportive-cosmetic-ingredients'],
  },
  {
    id: 'alpha-arbutin',
    name: 'Alpha-Arbutin',
    role: 'Skin conditioning and tone support',
    familyIds: ['tone-supportive-cosmetic-ingredients'],
  },
  {
    id: 'kojic-dipalmitate',
    name: 'Kojic Dipalmitate',
    role: 'Skin conditioning and tone support',
    familyIds: ['tone-supportive-cosmetic-ingredients'],
  },
  {
    id: 'thd-ascorbate',
    name: 'THD Ascorbate',
    role: 'Antioxidant with tone support',
    familyIds: ['antioxidant-supportive-ingredients', 'tone-supportive-cosmetic-ingredients'],
  },
  {
    id: 'argireline-np',
    name: 'Argireline NP (Acetyl Hexapeptide-8)',
    role: 'Peptide, smoothing',
    familyIds: ['peptides'],
  },
  {
    id: 'copper-tripeptide-1',
    name: 'Copper Tripeptide-1',
    role: 'Peptide, conditioning',
    familyIds: ['peptides'],
  },
  {
    id: 'coenzyme-q10',
    name: 'Coenzyme Q10',
    role: 'Antioxidant',
    familyIds: ['antioxidant-supportive-ingredients'],
  },
  {
    id: 'green-tea-extract',
    name: 'Green Tea Extract',
    role: 'Antioxidant and soothing',
    familyIds: ['antioxidant-supportive-ingredients'],
  },
  {
    id: 'rosemary-extract',
    name: 'Rosemary Extract',
    role: 'Antioxidant and stabiliser',
    familyIds: ['antioxidant-supportive-ingredients'],
  },
  {
    id: 'astaxanthin',
    name: 'Astaxanthin',
    role: 'Antioxidant',
    familyIds: ['antioxidant-supportive-ingredients'],
  },
  {
    id: 'aromatic-botanical-extracts',
    name: 'Blue Tansy Oil, Helichrysum Oil, Berry CO2 Extract',
    role: 'Calming, sensory and antioxidant character',
    familyIds: ['botanical-oils', 'antioxidant-supportive-ingredients'],
  },
  {
    id: 'centella-asiatica-extract',
    name: 'Centella Asiatica Extract',
    role: 'Soothing and barrier support',
    familyIds: ['sensorial-support'],
  },
  {
    id: 'bisabolol',
    name: 'Bisabolol',
    role: 'Soothing and delivery support',
    familyIds: ['sensorial-support'],
  },
  {
    id: 'optical-aesthetic-enhancers',
    name: 'Hydrophobic Silica, Boron Nitride, Gold Mica',
    role: 'Optical and aesthetic finish',
    familyIds: ['sensorial-support'],
  },
]

/** Ingredients in a family, in the order authored above. */
export const ingredientsInFamily = (id: IngredientFamilyId): FamilyIngredient[] =>
  FAMILY_INGREDIENTS.filter((ingredient) => ingredient.familyIds.includes(id))
