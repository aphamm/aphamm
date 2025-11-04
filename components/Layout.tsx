import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div
      style={{ maxWidth: 560, margin: "0 auto", padding: "96px 32px 128px" }}
    >
      <a
        href="/"
        style={{
          fontSize: 12,
          letterSpacing: "0.15em",
          marginBottom: 64,
          display: "inline-block",
        }}
      >
        ~
      </a>
      {children}
    </div>
  );
}
