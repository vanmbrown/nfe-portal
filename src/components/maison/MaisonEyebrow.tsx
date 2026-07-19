interface MaisonEyebrowProps {
  children: React.ReactNode;
  /**
   * Surface the eyebrow sits on. Accent is mapped by role (DDR-7) — never one
   * accent universally. `photo-overlay` is deliberately NOT the accent color:
   * --maison-accent-on-dark is validated against flat dark surfaces (green,
   * green-900, cacao) only. Measured directly against the Our Story hero
   * photo, gold-on-photo dropped to 1.47:1 at one text position because the
   * scrim's opacity varies by vertical position and the photo itself has
   * bright patches — a contrast guarantee the flat-surface token was never
   * designed to survive. Text over imagery uses the same light neutral as
   * the rest of the overlay copy instead, relying on the scrim for contrast.
   */
  tone?: 'light' | 'dark' | 'photo-overlay';
  className?: string;
}

const TONE_CLASS: Record<'light' | 'dark' | 'photo-overlay', string> = {
  light: 'text-maison-accent-on-light',
  dark: 'text-maison-accent-on-dark',
  'photo-overlay': 'text-maison-bone',
};

/** Small uppercase tracked label used above section headings and in the hero. */
export function MaisonEyebrow({ children, tone = 'light', className = '' }: MaisonEyebrowProps) {
  return (
    <p
      className={`text-xs font-medium uppercase tracking-[0.24em] ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
