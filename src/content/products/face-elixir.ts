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
  concentration?: string;
  benefits: string[];
  source: string;
  safety: 'safe' | 'caution' | 'avoid';
}

export interface Benefit {
  title: string;
  description: string;
  timeline: string;
  clinicalEvidence?: string;
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
  description: 'A potent, barrier-first serum designed specifically for melanated skin. Features THD ascorbate (stable vitamin C), bakuchiol (retinol alternative), and copper peptides for comprehensive anti-aging and brightening.',
  shortDescription: 'Stable vitamin C serum with bakuchiol and peptides for melanated skin',
  price: 89,
  currency: 'USD',
  images: [
    {
      src: '/images/products/face-elixir-hero.jpg',
      alt: 'NFE Face Elixir bottle with dropper',
      width: 800,
      height: 1000,
    },
    {
      src: '/images/products/face-elixir-detail.jpg',
      alt: 'Close-up of Face Elixir serum texture',
      width: 600,
      height: 600,
    },
  ],
  ingredients: [
    {
      name: 'THD Ascorbate',
      inci: 'Tetrahexyldecyl Ascorbate',
      concentration: '15%',
      benefits: ['Brightening', 'Antioxidant protection', 'Collagen synthesis'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Bakuchiol',
      inci: 'Bakuchiol',
      concentration: '1%',
      benefits: ['Retinol alternative', 'Anti-aging', 'Gentle on sensitive skin'],
      source: 'Psoralea corylifolia seed',
      safety: 'safe',
    },
    {
      name: 'Copper Peptide',
      inci: 'Copper Tripeptide-1',
      concentration: '0.1%',
      benefits: ['Wound healing', 'Collagen production', 'Skin repair'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Palmitoyl Tripeptide-5',
      inci: 'Palmitoyl Tripeptide-5',
      concentration: '0.05%',
      benefits: ['Firmness', 'Elasticity', 'Anti-aging'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Niacinamide',
      inci: 'Niacinamide',
      concentration: '5%',
      benefits: ['Pore refinement', 'Oil control', 'Barrier support'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Hyaluronic Acid',
      inci: 'Sodium Hyaluronate',
      concentration: '2%',
      benefits: ['Hydration', 'Plumping', 'Moisture retention'],
      source: 'Fermentation',
      safety: 'safe',
    },
  ],
  benefits: [
    {
      title: 'Brightening & Even Tone',
      description: 'THD ascorbate provides stable vitamin C benefits without irritation, helping to fade dark spots and even skin tone.',
      timeline: '4-8 weeks',
      clinicalEvidence: 'Clinical studies show 15% THD ascorbate reduces hyperpigmentation by 40% in 8 weeks.',
    },
    {
      title: 'Anti-Aging & Firmness',
      description: 'Bakuchiol and copper peptides work together to stimulate collagen production and improve skin firmness.',
      timeline: '6-12 weeks',
      clinicalEvidence: 'Bakuchiol shows comparable results to retinol with 44% less irritation.',
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
      'anti-aging serum',
      'brightening',
      'hyperpigmentation',
      'copper peptides',
    ],
  },
};
