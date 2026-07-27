import {
  FAMILY_BY_ID,
  SCIENCE_PAGE,
  type ConcernFormulaMatrixRow,
  type PathwayId,
} from '@/content/science'

interface ConcernFormulaMatrixProps {
  rows: ConcernFormulaMatrixRow[]
  /** Pathways currently selected. Empty means the default state. */
  emphasized: PathwayId[]
}

const { columns, caption } = SCIENCE_PAGE.formulaMatrix

/**
 * The Concern-to-Formula Matrix.
 *
 * Presentational and pure. Selection emphasises rows; it never sorts, filters,
 * hides, ranks or promotes them, and no row is ever marked recommended.
 *
 * Two representations, never both exposed at once:
 *
 *  - At lg and above, a real semantic table. The content is genuinely tabular
 *    -- the point of the module is scanning down a column -- so it gets
 *    <caption>, <thead>, <th scope="col"> and <th scope="row">.
 *  - Below lg, a stacked list. The stacked form repeats each column name as a
 *    real element rather than as ::before content, so the labels are read
 *    reliably rather than depending on pseudo-element support.
 *
 * The table breaks at lg, not md, because it was measured rather than assumed:
 * at 768px the four columns are ~160px each and every cell wraps to four to six
 * lines, which is the dense spreadsheet feeling this module is meant to avoid.
 * Tablets get the stacked layout instead.
 *
 * Each representation is `hidden` at the other's breakpoint. display:none
 * removes a subtree from the accessibility tree, so exactly one is exposed to
 * assistive technology at any viewport -- verified in the accessibility tree
 * rather than assumed.
 */
export function ConcernFormulaMatrix({ rows, emphasized }: ConcernFormulaMatrixProps) {
  const ordered = [...rows].sort((a, b) => a.order - b.order)

  const familyLabels = (row: ConcernFormulaMatrixRow) =>
    row.ingredientFamilyIds.map((id) => FAMILY_BY_ID[id].label).join(' · ')

  return (
    <>
      {/* lg and up — semantic table. */}
      <div className="mt-12 hidden lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-nfe-gold/30">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 pb-5 align-bottom text-xs font-medium uppercase tracking-[0.2em] text-nfe-gold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => {
              const active = emphasized.includes(row.pathwayId)
              return (
                <tr
                  key={row.id}
                  className={`border-b border-nfe-paper/12 align-top transition-colors duration-200 ease-out ${
                    active ? 'bg-white/[0.055]' : ''
                  }`}
                >
                  <th
                    scope="row"
                    className={`border-l-2 px-5 py-7 text-left font-serif text-xl font-normal leading-snug transition-colors duration-200 ease-out ${
                      active
                        ? 'border-l-nfe-gold text-nfe-gold'
                        : 'border-l-transparent text-nfe-paper'
                    }`}
                  >
                    {row.explorationLabel}
                    {active ? (
                      <span className="mt-2 block text-[0.625rem] uppercase tracking-[0.2em] text-nfe-gold/85">
                        In focus
                      </span>
                    ) : null}
                  </th>
                  <td className="px-5 py-7 leading-7 text-nfe-paper/75">
                    {row.layerContext}
                  </td>
                  <td className="px-5 py-7 leading-7 text-nfe-paper/75">
                    {row.formulationPrinciple}
                  </td>
                  <td className="px-5 py-7 leading-7 text-nfe-paper/75">
                    {familyLabels(row)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Below lg — stacked. Same order, same content, no hidden columns. */}
      <ul className="mt-10 space-y-4 lg:hidden">
        {ordered.map((row) => {
          const active = emphasized.includes(row.pathwayId)
          return (
            <li key={row.id}>
              <article
                className={`border-l-2 px-5 py-7 transition-colors duration-200 ease-out ${
                  active
                    ? 'border-l-nfe-gold bg-white/[0.055]'
                    : 'border-l-nfe-paper/15 bg-white/[0.015]'
                }`}
              >
                <h4
                  className={`font-serif text-xl leading-snug transition-colors duration-200 ease-out ${
                    active ? 'text-nfe-gold' : 'text-nfe-paper'
                  }`}
                >
                  {row.explorationLabel}
                </h4>
                {active ? (
                  <p className="mt-2 text-[0.625rem] uppercase tracking-[0.2em] text-nfe-gold/85">
                    In focus
                  </p>
                ) : null}

                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-nfe-paper/55">
                      {columns[1]}
                    </dt>
                    <dd className="mt-1.5 leading-7 text-nfe-paper/78">
                      {row.layerContext}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-nfe-paper/55">
                      {columns[2]}
                    </dt>
                    <dd className="mt-1.5 leading-7 text-nfe-paper/78">
                      {row.formulationPrinciple}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-nfe-paper/55">
                      {columns[3]}
                    </dt>
                    <dd className="mt-1.5 leading-7 text-nfe-paper/78">
                      {familyLabels(row)}
                    </dd>
                  </div>
                </dl>
              </article>
            </li>
          )
        })}
      </ul>
    </>
  )
}
