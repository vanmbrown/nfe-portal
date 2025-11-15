export default function EnclaveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-nfe-gold focus:text-nfe-ink">Skip to content</a>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}


