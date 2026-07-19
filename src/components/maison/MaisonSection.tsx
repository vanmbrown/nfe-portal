import { MaisonContainer } from './MaisonContainer';

export type MaisonSectionTone = 'bone' | 'ivory' | 'dark';

interface MaisonSectionProps {
  children: React.ReactNode;
  tone?: MaisonSectionTone;
  /** Wraps children in MaisonContainer. Disable when the section supplies its own width control. */
  contained?: boolean;
  className?: string;
}

const TONE_CLASS: Record<MaisonSectionTone, string> = {
  bone: 'bg-maison-bone',
  ivory: 'bg-maison-ivory',
  // Dark ground: deep green anchor, per DDR-1 nothing here replaces green with bronze/cacao.
  dark: 'bg-nfe-green-900 text-maison-bone',
};

/** Background + vertical rhythm wrapper for one editorial section. */
export function MaisonSection({
  children,
  tone = 'bone',
  contained = true,
  className = '',
}: MaisonSectionProps) {
  const content = contained ? <MaisonContainer>{children}</MaisonContainer> : children;
  return (
    <section className={`px-6 py-20 md:px-12 md:py-28 ${TONE_CLASS[tone]} ${className}`}>
      {content}
    </section>
  );
}
