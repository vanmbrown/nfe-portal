interface MaisonFounderNoteProps {
  quote: string;
  attribution: string;
  className?: string;
}

/** Restrained pull-quote in the founder's voice, with proper figure/blockquote semantics. */
export function MaisonFounderNote({ quote, attribution, className = '' }: MaisonFounderNoteProps) {
  return (
    // No opacity modifier on border-maison-accent-on-light — Tailwind can't
    // generate a working alpha variant for a var()-referenced color, so /50
    // silently falls back to Tailwind's default border color rather than a
    // lighter accent. Solid value, verified against computed style.
    <figure className={`border-l-2 border-maison-accent-on-light pl-6 ${className}`}>
      <blockquote className="font-primary text-xl italic leading-relaxed text-nfe-green md:text-2xl">
        {quote}
      </blockquote>
      <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-maison-text-muted">
        {attribution}
      </figcaption>
    </figure>
  );
}
