import { INGREDIENT_FAMILIES } from '@/content/ingredients/families'
import { ingredientsInFamily } from '@/content/ingredients/membership'

/**
 * The eight ingredient-family sections on Ingredients.
 *
 * Server-rendered with no client boundary, because these sections are the
 * destination of `/inci#humectants`-style links from Science. An anchor has to
 * resolve against markup the browser already has — if these lived inside the
 * transparency tabs below, a direct link would land on hidden content and a
 * visitor without JavaScript would find nothing at all.
 *
 * `scroll-mt-24` gives the heading breathing room rather than sitting flush
 * against the viewport edge. Neither the site header nor the education nav is
 * sticky today, so this is comfort rather than compensation — and insurance if
 * a sticky header ever arrives.
 *
 * These sections organise; they do not declare composition. The full glossary,
 * INCI lists and actives table remain below, and product pages remain the
 * authority on what is in any given formula.
 */
export function IngredientFamilySections() {
  const ordered = [...INGREDIENT_FAMILIES].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-16">
      {ordered.map((family) => {
        const ingredients = ingredientsInFamily(family.id)

        return (
          <section
            key={family.id}
            id={family.id}
            aria-labelledby={`${family.id}-heading`}
            className="scroll-mt-24 border-t border-[#0E2A22]/12 pt-10"
          >
            <h2
              id={`${family.id}-heading`}
              className="font-serif text-2xl text-[#0E2A22] md:text-3xl"
            >
              {family.label}
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#0E2A22]/75">
              {family.description}
            </p>

            <ul className="mt-8 space-y-5">
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} className="max-w-3xl">
                  <p className="font-medium text-[#0E2A22]">{ingredient.name}</p>
                  <p className="mt-1 leading-7 text-[#0E2A22]/70">{ingredient.role}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
