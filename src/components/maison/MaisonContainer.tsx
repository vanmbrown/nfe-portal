interface MaisonContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Route-scoped max-width wrapper for Maison pilot pages. */
export function MaisonContainer({ children, className = '' }: MaisonContainerProps) {
  return <div className={`mx-auto max-w-6xl px-6 md:px-12 ${className}`}>{children}</div>;
}
