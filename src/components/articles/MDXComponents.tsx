import React from "react";

// MDX component mappings for article content
// These components match the ones defined in the MDX files

export const Divider = () => (
  <hr style={{ margin: "2.25rem 0", border: 0, borderTop: "1px solid rgba(0,0,0,0.12)" }} />
);

export const Callout = ({ title, children, variant }: { title?: string; children: React.ReactNode; variant?: string }) => {
  const variantStyles: Record<string, { border: string; background: string }> = {
    brand: { border: "1px solid rgba(212, 175, 55, 0.3)", background: "rgba(212, 175, 55, 0.05)" },
    quote: { border: "1px solid rgba(0,0,0,0.15)", background: "rgba(0,0,0,0.03)" },
    note: { border: "1px solid rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.05)" },
    warning: { border: "1px solid rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.05)" },
  };
  
  const style = variant && variantStyles[variant] 
    ? variantStyles[variant] 
    : { border: "1px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.02)" };

  return (
    <div style={{
      padding: "1.1rem 1.1rem",
      borderRadius: "18px",
      border: style.border,
      background: style.background,
      margin: "1.25rem 0"
    }}>
      {title ? <div style={{ fontWeight: 650, marginBottom: ".45rem" }}>{title}</div> : null}
      <div style={{ lineHeight: 1.65 }}>{children}</div>
    </div>
  );
};

export const KeyTakeaways = ({ items }: { items: string[] }) => (
  <div style={{
    padding: "1.1rem 1.1rem",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.12)",
    margin: "1.25rem 0"
  }}>
    <div style={{ fontWeight: 650, marginBottom: ".45rem" }}>Key takeaways</div>
    <ul style={{ margin: 0, paddingLeft: "1.15rem", lineHeight: 1.7 }}>
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  </div>
);

export const TwoCol = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
    margin: "1.5rem 0"
  }}>
    <div style={{
      padding: "1rem",
      borderRadius: "18px",
      border: "1px solid rgba(0,0,0,0.12)"
    }}>{left}</div>
    <div style={{
      padding: "1rem",
      borderRadius: "18px",
      border: "1px solid rgba(0,0,0,0.12)"
    }}>{right}</div>
  </div>
);

export const ScienceDiagram = ({ title, caption, kind }: { title?: string; caption?: string; kind?: string }) => (
  <div style={{
    padding: "1.5rem",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.02)",
    margin: "1.5rem 0",
    textAlign: "center"
  }}>
    {title && <div style={{ fontWeight: 650, marginBottom: ".5rem", fontSize: "1.1rem" }}>{title}</div>}
    <div style={{ 
      minHeight: "200px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      color: "rgba(0,0,0,0.5)",
      fontStyle: "italic"
    }}>
      [Science Diagram: {kind || "diagram"}]
    </div>
    {caption && <div style={{ marginTop: ".75rem", fontSize: "0.9rem", color: "rgba(0,0,0,0.6)" }}>{caption}</div>}
  </div>
);

export const ProductCard = ({ title, subtitle, description, tags }: { title: string; subtitle?: string; description: string; tags?: string[] }) => (
  <div style={{
    padding: "1.5rem",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.02)",
    margin: "1.25rem 0"
  }}>
    <div style={{ fontWeight: 650, fontSize: "1.1rem", marginBottom: ".5rem" }}>{title}</div>
    {subtitle && <div style={{ fontSize: "0.9rem", color: "rgba(0,0,0,0.6)", marginBottom: ".75rem" }}>{subtitle}</div>}
    <div style={{ lineHeight: 1.65, marginBottom: tags && tags.length > 0 ? ".75rem" : "0" }}>{description}</div>
    {tags && tags.length > 0 && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: ".75rem" }}>
        {tags.map((tag, i) => (
          <span key={i} style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "0.75rem",
            background: "rgba(0,0,0,0.05)",
            color: "rgba(0,0,0,0.7)"
          }}>
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Export all components as a single object for MDX
export const mdxComponents = {
  Divider,
  Callout,
  KeyTakeaways,
  TwoCol,
  ScienceDiagram,
  ProductCard,
};

