import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story – NFE Skincare for Mature Melanated Skin',
  description: 'Discover Vanessa\'s journey behind NFE—a skincare line born from honesty, science, and care for mature, melanated skin.',
  openGraph: {
    title: 'Our Story – NFE Skincare for Mature Melanated Skin',
    description: 'Discover Vanessa\'s journey behind NFE—a skincare line born from honesty, science, and care for mature, melanated skin.',
    type: 'website',
  },
};

export default function OurStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}








