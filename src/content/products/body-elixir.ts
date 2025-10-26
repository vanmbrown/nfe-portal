/**
 * Body Elixir Product Data
 * TypeScript object for structured product information
 */

import { ProductData } from './face-elixir';

export const bodyElixirData: ProductData = {
  id: 'body-elixir',
  name: 'Body Elixir',
  subtitle: 'Ceramide Complex + Botanical Oils',
  description: 'A luxurious body serum featuring ceramide complex, cacay oil, and blue tansy. Designed to nourish and protect melanated skin from head to toe with a barrier-first approach.',
  shortDescription: 'Nourishing body serum with ceramides and botanical oils for melanated skin',
  price: 79,
  currency: 'USD',
  images: [
    {
      src: '/images/products/body-elixir-hero.jpg',
      alt: 'NFE Body Elixir bottle with pump dispenser',
      width: 800,
      height: 1000,
    },
    {
      src: '/images/products/body-elixir-detail.jpg',
      alt: 'Close-up of Body Elixir serum texture',
      width: 600,
      height: 600,
    },
  ],
  ingredients: [
    {
      name: 'Ceramide Complex',
      inci: 'Ceramide NP, Ceramide AP, Ceramide EOP',
      concentration: '2%',
      benefits: ['Barrier repair', 'Moisture retention', 'Skin protection'],
      source: 'Synthetic',
      safety: 'safe',
    },
    {
      name: 'Cacay Oil',
      inci: 'Caryodendron orinocense Seed Oil',
      concentration: '5%',
      benefits: ['Antioxidant', 'Anti-inflammatory', 'Non-comedogenic'],
      source: 'Caryodendron orinocense seed',
      safety: 'safe',
    },
    {
      name: 'Prickly Pear Seed Oil',
      inci: 'Opuntia ficus-indica Seed Oil',
      concentration: '3%',
      benefits: ['Vitamin E', 'Antioxidant', 'Skin conditioning'],
      source: 'Opuntia ficus-indica seed',
      safety: 'safe',
    },
    {
      name: 'Blue Tansy',
      inci: 'Tanacetum annuum Flower Oil',
      concentration: '0.5%',
      benefits: ['Anti-inflammatory', 'Soothing', 'Antimicrobial'],
      source: 'Tanacetum annuum flower',
      safety: 'safe',
    },
    {
      name: 'Gotu Kola Extract',
      inci: 'Centella asiatica Extract',
      concentration: '1%',
      benefits: ['Wound healing', 'Anti-aging', 'Skin repair'],
      source: 'Centella asiatica leaf',
      safety: 'safe',
    },
    {
      name: 'Bisabolol',
      inci: 'Bisabolol',
      concentration: '0.5%',
      benefits: ['Anti-inflammatory', 'Soothing', 'Skin conditioning'],
      source: 'Chamomile or synthetic',
      safety: 'safe',
    },
  ],
  benefits: [
    {
      title: 'Barrier Repair & Protection',
      description: 'Ceramide complex helps restore and maintain the skin barrier, essential for melanated skin prone to dryness.',
      timeline: '2-4 weeks',
      clinicalEvidence: 'Clinical studies show ceramides improve barrier function by 40% in 4 weeks.',
    },
    {
      title: 'Deep Hydration & Nourishment',
      description: 'Cacay and prickly pear oils provide essential fatty acids and antioxidants for long-lasting hydration.',
      timeline: '1-2 weeks',
    },
    {
      title: 'Anti-Inflammatory & Soothing',
      description: 'Blue tansy and bisabolol calm irritation and reduce inflammation, perfect for sensitive melanated skin.',
      timeline: 'Immediate to 1 week',
    },
  ],
  usage: {
    frequency: 'Once or twice daily, after showering',
    application: 'Apply 2-3 pumps to damp skin, massage gently until absorbed',
    timeline: 'Use consistently for 4-6 weeks to see full benefits',
    tips: [
      'Apply to damp skin for better absorption',
      'Focus on areas prone to dryness (elbows, knees, feet)',
      'Can be used on face as a gentle moisturizer',
      'Store in a cool, dry place',
    ],
  },
  faqs: [
    {
      question: 'Can I use this on my face?',
      answer: 'Yes, this gentle formula is safe for facial use. However, it may be too rich for oily skin types.',
    },
    {
      question: 'Is this safe for sensitive skin?',
      answer: 'Yes, the formula is designed for sensitive skin with anti-inflammatory ingredients like blue tansy and bisabolol.',
    },
    {
      question: 'Why no coconut or sesame oil?',
      answer: 'These oils can be comedogenic and may cause breakouts. We use non-comedogenic alternatives like cacay oil.',
    },
    {
      question: 'Can I use this with other body products?',
      answer: 'Yes, this works well with body washes, scrubs, and sunscreens. Apply after cleansing, before sunscreen.',
    },
    {
      question: 'How long does one bottle last?',
      answer: 'One bottle (200ml) lasts approximately 2-3 months with daily use.',
    },
  ],
  specifications: {
    volume: '200ml / 6.8 fl oz',
    texture: 'Lightweight oil-serum, fast-absorbing',
    scent: 'Subtle botanical (blue tansy, gotu kola)',
    packaging: 'Glass pump bottle with UV protection',
    shelfLife: '24 months unopened, 6 months after opening',
  },
  seo: {
    title: 'Body Elixir - Ceramide Body Serum for Melanated Skin | NFE Beauty',
    description: 'Luxurious body serum with ceramide complex and botanical oils. Nourishes and protects melanated skin with barrier-first approach.',
    keywords: [
      'body serum',
      'ceramide complex',
      'melanated skin',
      'body moisturizer',
      'cacay oil',
      'blue tansy',
      'barrier repair',
      'botanical oils',
    ],
  },
};
