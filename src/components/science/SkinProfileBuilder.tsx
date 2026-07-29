'use client'

import { useId, useState } from 'react'

import type {
  SkinContextId,
  SkinProfileOption,
  SkinSignalId,
} from '@/content/science/skin-profile'
import type { SkinProfileContent } from '@/content/science/types'

interface SkinProfileBuilderProps {
  /**
   * Copy and options arrive as props rather than being imported here. The
   * labels then travel in the server payload as data instead of as client code
   * — the same reason Layer Context and the matrix are passed in.
   */
  copy: SkinProfileContent
  contexts: SkinProfileOption<SkinContextId>[]
  signals: SkinProfileOption<SkinSignalId>[]
  maxSignals: number
}

/**
 * The second way into the Science Map.
 *
 * A visitor describes what her skin is asking for; those choices resolve to the
 * same five pathways the controls above select directly. This component owns
 * only its own form state. The selected pathways live in the parent, and this
 * writes to them once, when the visitor asks it to.
 *
 * That timing is deliberate. Remapping on every checkbox would silently
 * overwrite pathways she had set by hand, and the map would shift under her
 * while she was still reading the options. Nothing here changes the page until
 * she activates the action.
 *
 * What this is not: there is no profile name, no score, no rank, no primary or
 * secondary concern, no recommendation and no result card. The only thing it
 * produces is a set of pathway ids, and the option data has nowhere to put
 * anything else.
 *
 * Privacy is structural rather than promised. No storage, no cookie, no
 * request — the selections exist in React state for as long as the page is
 * open and are never serialised anywhere, including the URL. Only the resulting
 * pathway ids continue through the existing continuity system.
 *
 * The form is native throughout: radios for the single choice, checkboxes for
 * the signals, real labels, real fieldsets. No custom keyboard handling, no
 * focus management, no auto-scroll.
 */
export function SkinProfileBuilder({
  copy,
  contexts,
  signals,
  maxSignals,
}: SkinProfileBuilderProps) {
  const groupId = useId()
  const [contextId, setContextId] = useState<SkinContextId | null>(null)
  const [signalIds, setSignalIds] = useState<SkinSignalId[]>([])

  const atLimit = signalIds.length >= maxSignals

  function toggleSignal(id: SkinSignalId) {
    setSignalIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= maxSignals) return current
      return [...current, id]
    })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      {/* Left — what this is, and what it is not. */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
          {copy.eyebrow}
        </p>
        <h3
          id={`${groupId}-heading`}
          className="mt-5 font-serif text-3xl leading-tight text-nfe-gold md:text-4xl"
        >
          {copy.heading}
        </h3>
        <p className="mt-6 text-lg leading-8 text-nfe-paper/80">
          {copy.description}
        </p>
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6 text-nfe-paper/70">
          <span className="text-nfe-gold">{copy.boundary}</span>
          <span>{copy.privacy}</span>
        </p>

      </div>

      {/* Right — the inputs. */}
      <form
        aria-labelledby={`${groupId}-heading`}
        // A reading aid, not a submission. There is nowhere to submit to.
        onSubmit={(event) => event.preventDefault()}
        className="rounded-[1.5rem] border border-nfe-gold/25 bg-white/[0.04] p-6 sm:p-8"
      >
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.22em] text-nfe-gold">
            {copy.contextLabel}
          </legend>
          <p className="mt-3 text-sm leading-6 text-nfe-paper/70">
            {copy.contextHelper}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {contexts.map((option) => {
              const id = `${groupId}-context-${option.id}`
              const active = contextId === option.id
              return (
                <span key={option.id}>
                  <input
                    type="radio"
                    id={id}
                    name={`${groupId}-context`}
                    value={option.id}
                    checked={active}
                    onChange={() => setContextId(option.id)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className="inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-4 py-2.5 text-sm leading-6 transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-nfe-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-nfe-green-900 border-nfe-paper/30 text-nfe-paper/85 hover:border-nfe-gold/70 peer-checked:border-nfe-gold peer-checked:bg-nfe-gold peer-checked:text-nfe-green-900"
                  >
                    {option.label}
                  </label>
                </span>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="mt-10 border-t border-nfe-paper/15 pt-8">
          <legend className="text-xs uppercase tracking-[0.22em] text-nfe-gold">
            {copy.signalsLabel}
          </legend>
          <p className="mt-3 text-sm leading-6 text-nfe-paper/70">
            {copy.signalsHelper}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {signals.map((option) => {
              const id = `${groupId}-signal-${option.id}`
              const checked = signalIds.includes(option.id)
              // Unchosen options go unavailable at the limit rather than
              // letting her click and be refused.
              const blocked = atLimit && !checked
              return (
                <span key={option.id}>
                  <input
                    type="checkbox"
                    id={id}
                    value={option.id}
                    checked={checked}
                    disabled={blocked}
                    onChange={() => toggleSignal(option.id)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2.5 text-sm leading-6 transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-nfe-gold peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-nfe-green-900 peer-checked:border-nfe-gold peer-checked:bg-nfe-gold peer-checked:text-nfe-green-900 ${
                      blocked
                        ? 'cursor-not-allowed border-nfe-paper/15 text-nfe-paper/45'
                        : 'cursor-pointer border-nfe-paper/30 text-nfe-paper/85 hover:border-nfe-gold/70'
                    }`}
                  >
                    {option.label}
                  </label>
                </span>
              )
            })}
          </div>
          {atLimit ? (
            <p className="mt-5 text-sm leading-6 text-nfe-paper/70">
              {copy.limitNote}
            </p>
          ) : null}
        </fieldset>
      </form>
    </div>
  )
}
