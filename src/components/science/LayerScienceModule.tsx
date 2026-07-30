import { SCIENCE_PAGE } from '@/content/science/page'

const { eyebrow, heading, description, cards } = SCIENCE_PAGE.layerScience

/**
 * The Layer Science module — the editorial bridge into the interactive chapter.
 *
 * A spacious white section: the editorial column on the left, three layer cards
 * on the right. It explains what the layers *are* before the dark chapter asks
 * the visitor to explore them.
 *
 * Static and server-rendered. No state, no handler, no interactive control
 * inside the cards, so it costs nothing in the client bundle and reads fully
 * without JavaScript.
 *
 * Claims discipline: each card describes what is seen or felt at a layer, never
 * what a product does there. The Dermis card closes with the boundary sentence
 * that governs the whole module, and a test asserts it verbatim so it cannot be
 * softened or dropped.
 */
export function LayerScienceModule() {
  return (
    <section aria-labelledby="layer-science-heading" className="bg-white px-6 py-24 md:px-12 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {eyebrow}
          </p>
          <h2
            id="layer-science-heading"
            className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl"
          >
            {heading}
          </h2>
          <p className="mt-8 text-lg leading-8 text-nfe-ink/75">{description}</p>
        </div>

        <ul className="space-y-5">
          {cards.map((card) => (
            <li key={card.id}>
              <article className="rounded-2xl border border-nfe-green-900/15 bg-[#FCFBF8] p-7 md:p-8">
                <h3 className="font-primary text-xl text-nfe-green-900 md:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-4 text-[1.0625rem] leading-8 text-nfe-ink/75">
                  {card.body}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
