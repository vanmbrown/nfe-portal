interface MaisonProseProps {
  children: React.ReactNode;
  className?: string;
}

/** 65ch-measure wrapper for long-form editorial paragraphs. */
export function MaisonProse({ children, className = '' }: MaisonProseProps) {
  return (
    <div
      className={`max-w-[65ch] space-y-6 text-[1.0625rem] leading-8 text-maison-espresso ${className}`}
    >
      {children}
    </div>
  );
}
