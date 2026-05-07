import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children inside a button by default", () => {
    render(<Button>Donate</Button>);
    const button = screen.getByRole("button", { name: /donate/i });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("disabled prop blocks click handler and disables the button", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Donate
      </Button>,
    );
    const button = screen.getByRole("button", { name: /donate/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading shows a spinner, disables the button, and sets aria-busy", () => {
    render(<Button loading>Donate</Button>);
    const button = screen.getByRole("button", { name: /donate/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders an anchor when href is provided", () => {
    render(<Button href="/donate">Donate</Button>);
    const link = screen.getByRole("link", { name: /donate/i });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/donate");
  });

  it("renders the trailing arrow only on tertiary", () => {
    const { rerender } = render(<Button variant="tertiary">See all</Button>);
    expect(screen.getByText("→")).toBeInTheDocument();
    rerender(<Button variant="primary">Donate</Button>);
    expect(screen.queryByText("→")).not.toBeInTheDocument();
  });
});
