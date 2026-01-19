import type { MDXComponents } from "mdx/types";
import {
  Callout,
  Divider,
  KeyTakeaways,
  TwoCol,
  ScienceDiagram,
  ProductCard,
} from "@/components/articles/MDXComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    Divider,
    KeyTakeaways,
    TwoCol,
    ScienceDiagram,
    ProductCard,
  };
}
