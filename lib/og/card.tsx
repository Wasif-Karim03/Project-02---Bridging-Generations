import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

const TOKENS = {
  ground: "#f5f1ea",
  ground3: "#efe7d8",
  ink: "#1e1e1e",
  ink2: "#5c5c5c",
  hairline: "#ddd6c7",
  accent: "#0f4c5c",
  accent2Text: "#b5462b",
} as const;

const FONT_STACK =
  'Plus Jakarta Sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export type OGCardProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function OGCard({ title, subtitle, eyebrow }: OGCardProps): ReactElement {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: TOKENS.ground,
        padding: "80px 96px",
        fontFamily: FONT_STACK,
        color: TOKENS.ink,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            width: 96,
            height: 6,
            background: TOKENS.accent,
            borderRadius: 999,
          }}
        />
        {eyebrow ? (
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: TOKENS.accent2Text,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: TOKENS.ink,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 900,
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.3,
              color: TOKENS.ink2,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 32,
          borderTop: `1px solid ${TOKENS.hairline}`,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        <span style={{ display: "flex", color: TOKENS.ink }}>Bridging Generations</span>
        <span style={{ display: "flex", color: TOKENS.accent }}>bridginggenerations.org</span>
      </div>
    </div>
  );
}

export function renderOGImage(props: OGCardProps): ImageResponse {
  return new ImageResponse(<OGCard {...props} />, { ...OG_SIZE });
}
