export type ProductStatus = 'available' | 'coming_soon' | 'future_release';

export interface Product {
  slug: string;
  title: string;
  short_description: string;
  details: string; // Rich text / HTML
  benefits: string[]; // Array of benefit strings
  usage: string; // Rich text / HTML
  ingredients_inci: string; // Full INCI list + key actives
  texture_scent_experience: string; // Rich text / HTML
  status: ProductStatus;
  hero_image: string; // Image URL path
  secondary_images?: string[]; // Array of image URLs
  cta_label: string;
  cta_link?: string; // URL for CTA button
  seo_title?: string;
  seo_description?: string;
  related_product?: string; // Slug of related product
}

export interface ProductMetadata {
  slug: string;
  title: string;
  short_description: string;
  status: ProductStatus;
  hero_image: string;
  seo_title?: string;
  seo_description?: string;
  related_product?: string;
}








