import React from "react";

// MDX component mappings for article content
// These components match the ones defined in the MDX files

export const Divider = () => (
  <hr style={{ margin: "2.25rem 0", border: 0, borderTop: "1px solid rgba(0,0,0,0.12)" }} />
);

export const Callout = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div style={{
    padding: "1.1rem 1.1rem",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.02)",
    margin: "1.25rem 0"
  }}>
    {title ? <div style={{ fontWeight: 650, marginBottom: ".45rem" }}>{title}</div> : null}
    <div style={{ lineHeight: 1.65 }}>{children}</div>
  </div>
);

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

// Export all components as a single object for MDX
export const mdxComponents = {
  Divider,
  Callout,
  KeyTakeaways,
  TwoCol,
};

