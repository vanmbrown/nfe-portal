import { MaisonEyebrow } from './MaisonEyebrow';

interface MaisonSectionHeaderProps {
  eyebrow?: string;
  heading: string;
  /** Surface the header sits on — governs both eyebrow and heading color. */
  tone?: 'light' | 'dark';
  /** Constrains heading line length so it wraps deliberately, not accidentally. */
  headingMaxCh?: number;
  className?: string;
}

const HEADING_CLASS: Record<'light' | 'dark', string> = {
  light: 'text-nfe-green',
  dark: 'text-maison-accent-on-dark',
};

/** Eyebrow + heading pairing reused across the narrative, ethos, and closing sections. */
export function MaisonSectionHeader({
  eyebrow,
  heading,
  tone = 'light',
  headingMaxCh = 16,
  className = '',
}: MaisonSectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <MaisonEyebrow tone={tone} className="mb-4">
          {eyebrow}
        </MaisonEyebrow>
      ) : null}
      <h2
        className={`font-primary text-3xl font-medium leading-tight md:text-4xl ${HEADING_CLASS[tone]}`}
        style={{ maxWidth: `${headingMaxCh}ch` }}
      >
        {heading}
      </h2>
    </div>
  );
}
