import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles – NFE Skincare for Mature Melanated Skin',
  description: 'A thoughtful collection of reflections, rituals, and real conversations on the care of mature melanated skin.',
  openGraph: {
    title: 'Articles – NFE Skincare for Mature Melanated Skin',
    description: 'A thoughtful collection of reflections, rituals, and real conversations on the care of mature melanated skin.',
    type: 'website',
  },
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}








