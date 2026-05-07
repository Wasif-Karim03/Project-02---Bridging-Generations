import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: ({ src, onLoad: _onLoad }: { src: string; onLoad?: () => void }) => (
    <script data-testid="gb-script" data-src={src} />
  ),
}));

import { GivebutterEmbed } from "@/components/domain/GivebutterEmbed";

describe("GivebutterEmbed", () => {
  it("mounts the widget and loads the script when both IDs are real", () => {
    const { getByTestId, container } = render(
      <GivebutterEmbed accountId="bridging-generations" campaignId="A1B2C3" />,
    );
    expect(getByTestId("gb-script").getAttribute("data-src")).toBe(
      "https://widgets.givebutter.com/latest.umd.cjs?acct=bridging-generations&p=other",
    );
    expect(container.querySelector("givebutter-widget")?.getAttribute("id")).toBe("A1B2C3");
  });

  it("renders the setup fallback when accountId is a [CONFIRM:] stub", () => {
    const { container, queryByTestId } = render(
      <GivebutterEmbed
        accountId="[CONFIRM: acct= value from Givebutter dashboard embed code]"
        campaignId="A1B2C3"
      />,
    );
    expect(queryByTestId("gb-script")).toBeNull();
    expect(container.querySelector("givebutter-widget")).toBeNull();
    expect(screen.getByText(/setup pending/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /info@bridginggenerations\.org/i })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:info@bridginggenerations.org"),
    );
  });

  it("renders the setup fallback when campaignId is a [CONFIRM:] stub", () => {
    const { container, queryByTestId } = render(
      <GivebutterEmbed
        accountId="bridging-generations"
        campaignId="[CONFIRM: six-character campaign code from Givebutter dashboard]"
      />,
    );
    expect(queryByTestId("gb-script")).toBeNull();
    expect(container.querySelector("givebutter-widget")).toBeNull();
    expect(screen.getByText(/setup pending/i)).toBeInTheDocument();
  });

  it("renders the setup fallback when either ID is empty", () => {
    const { container } = render(<GivebutterEmbed accountId="" campaignId="A1B2C3" />);
    expect(container.querySelector("givebutter-widget")).toBeNull();
    expect(screen.getByText(/setup pending/i)).toBeInTheDocument();
  });
});
