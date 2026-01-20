/**
 * Product Data Registry
 * Static imports for product JSON files to avoid runtime fs access
 */

export const productData = {
  "face-elixir": () => import("../../../data/products/face-elixir.json"),
  "body-elixir": () => import("../../../data/products/body-elixir.json"),
} as const;

export const productsIndex = () => import("../../../data/products/index.json");

export type ProductSlug = keyof typeof productData;
export const allProductSlugs = Object.keys(productData) as ProductSlug[];
