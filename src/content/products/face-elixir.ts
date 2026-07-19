/**
 * Face Elixir Product Data
 * TypeScript object for structured product information
 */

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Ingredient {
  name: string;
  inci: string;
  benefits: string[];
  source: string;
  safety: 'safe' | 'caution' | 'avoid';
}

export interface Benefit {
  title: string;
  description: string;
  timeline: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProductData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  images: ProductImage[];
  ingredients: Ingredient[];
  benefits: Benefit[];
  usage: {
    frequency: string;
    application: string;
    timeline: string;
    tips: string[];
  };
  faqs: FAQ[];
  specifications: {
    volume: string;
    texture: string;
    scent: string;
    packaging: string;
    shelfLife: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const faceElixirData: ProductData = {
  id: 'face-elixir',
  name: 'Face Elixir',
  subtitle: 'THD Ascorbate + Bakuchiol + Peptides',
  description: 'A potent, barrier-first serum designed specifically for melanated skin. Features THD ascorbate (stable vitamin C), bakuchiol (retinol alternative), and copper peptides to support a visibly firmer, more even-looking complexion.',
  shortDescription: 'Stable vitamin C serum with bakuchiol and peptides for melanated skin',
  price: 89,
  currency: 'USD',
  // Product photography pending. The previous entries referenced 0-byte
  // placeholder files, which were removed in the pre-Phase-1 stabilization
  // pass. Restore only real, optimized WebP assets after founder approval.
  // See docs/nfe-product-photography-needs.md.
  images: [],
  ingredients: [
    {
      name: 'THD Ascorbate',
      inci: 'Tetrahexyldecyl Ascorbate',
      benefits: ['Visible radiance', 'Antioxidant support', 'More even-looking tone'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Bakuchiol',
      inci: 'Bakuchiol',
      benefits: ['Retinol alternative', 'Visible aging support', 'Gentle on sensitive skin'],
      source: 'Psoralea corylifolia seed',
      safety: 'safe',
    },
    {
      name: 'Copper Peptide',
      inci: 'Copper Tripeptide-1',
      benefits: ['Peptide support', 'Smoother-looking skin', 'Skin conditioning'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Palmitoyl Tripeptide-5',
      inci: 'Palmitoyl Tripeptide-5',
      benefits: ['Firmness appearance', 'Supple skin feel', 'Visible aging support'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Niacinamide',
      inci: 'Niacinamide',
      benefits: ['Pore refinement', 'Oil control', 'Barrier support'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Hyaluronic Acid',
      inci: 'Sodium Hyaluronate',
      benefits: ['Hydration', 'Plumping', 'Moisture retention'],
      source: 'Fermentation',
      safety: 'safe',
    },
  ],
  benefits: [
    {
      title: 'Radiance & Even-Looking Tone',
      description: 'THD ascorbate supports visible radiance and the appearance of more even-looking tone without aggressive brightening language.',
      timeline: '4-8 weeks',
    },
    {
      title: 'Visible Firmness & Smoothness',
      description: 'Bakuchiol and peptides support the appearance of smoother, firmer-looking skin while keeping the ritual barrier-first.',
      timeline: '6-12 weeks',
    },
    {
      title: 'Barrier Support',
      description: 'Niacinamide and hyaluronic acid strengthen the skin barrier and improve moisture retention.',
      timeline: '2-4 weeks',
    },
  ],
  usage: {
    frequency: 'Once daily, preferably in the morning',
    application: 'Apply 2-3 drops to clean skin, avoiding eye area',
    timeline: 'Use consistently for 8-12 weeks to see full benefits',
    tips: [
      'Start with every other day if you have sensitive skin',
      'Always follow with SPF during the day',
      'Store in a cool, dry place away from direct sunlight',
      'Patch test before first use',
    ],
  },
  faqs: [
    {
      question: 'Can I use this with other active ingredients?',
      answer: 'Yes, but avoid using with retinol or other vitamin C products. Use with niacinamide, hyaluronic acid, and gentle moisturizers.',
    },
    {
      question: 'Is this safe for sensitive skin?',
      answer: 'Yes, THD ascorbate is gentler than L-ascorbic acid. However, start slowly and patch test first.',
    },
    {
      question: 'Can I use this during pregnancy?',
      answer: 'Bakuchiol is generally considered safe during pregnancy, but consult your healthcare provider first.',
    },
    {
      question: 'How long does one bottle last?',
      answer: 'One bottle (30ml) lasts approximately 2-3 months with daily use.',
    },
    {
      question: 'Why no coconut or grapeseed oil?',
      answer: 'These oils can be comedogenic and may cause breakouts. We use non-comedogenic alternatives like cacay oil.',
    },
  ],
  specifications: {
    volume: '30ml / 1 fl oz',
    texture: 'Lightweight serum, fast-absorbing',
    scent: 'Unscented',
    packaging: 'Glass dropper bottle with UV protection',
    shelfLife: '24 months unopened, 6 months after opening',
  },
  seo: {
    title: 'Face Elixir - THD Ascorbate Serum for Melanated Skin | NFE Beauty',
    description: 'Professional-grade vitamin C serum with THD ascorbate, bakuchiol, and peptides. Formulated specifically for melanated skin concerns.',
    keywords: [
      'vitamin c serum',
      'THD ascorbate',
      'bakuchiol',
      'melanated skin',
      'well-aging serum',
      'brightening',
      'hyperpigmentation',
      'copper peptides',
    ],
  },
};
