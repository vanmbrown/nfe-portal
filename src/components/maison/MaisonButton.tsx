import { forwardRef } from 'react';
import Link from 'next/link';

type MaisonButtonVariant = 'solid' | 'ghost';

interface MaisonButtonBaseProps {
  children: React.ReactNode;
  variant?: MaisonButtonVariant;
  className?: string;
}

interface MaisonButtonAsLink extends MaisonButtonBaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

interface MaisonButtonAsButton extends MaisonButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

type MaisonButtonProps = MaisonButtonAsLink | MaisonButtonAsButton;

const VARIANT_CLASS: Record<MaisonButtonVariant, string> = {
  // Flat, minimally rounded — no large pills (DDR-5 selective sharpness).
  solid: 'bg-nfe-green text-maison-bone hover:bg-nfe-green-700 focus-visible:bg-nfe-green-700',
  // For use over a dark hero image — inverts on hover/focus rather than filling.
  // NOTE: no opacity modifier on border-maison-bone. Tailwind cannot generate
  // a working alpha variant for a color whose value is `var(--maison-bone)`
  // rather than a literal hex — the class silently fails to match and the
  // border falls back to Tailwind's default gray. Verified by inspecting
  // computed style; see docs/nfe-founder-decisions-2026-07-19.md.
  ghost:
    'border border-maison-bone bg-transparent text-maison-bone hover:bg-maison-bone hover:text-nfe-green-900 focus-visible:bg-maison-bone focus-visible:text-nfe-green-900',
};

const SHARED_CLASS =
  'inline-flex min-h-[44px] items-center gap-2 rounded-maison-control px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nfe-gold';

/** One button primitive, two variants: solid for primary CTAs, ghost for use over imagery. */
export const MaisonButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, MaisonButtonProps>(
  function MaisonButton(props, ref) {
    const { children, variant = 'solid', className = '' } = props;
    const classes = `${SHARED_CLASS} ${VARIANT_CLASS[variant]} ${className}`;

    if ('href' in props && props.href) {
      return (
        <Link href={props.href} className={classes} ref={ref as React.Ref<HTMLAnchorElement>}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={('type' in props && props.type) || 'button'}
        onClick={'onClick' in props ? props.onClick : undefined}
        className={classes}
      >
        {children}
      </button>
    );
  }
);
