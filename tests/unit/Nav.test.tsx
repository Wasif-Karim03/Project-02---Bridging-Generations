import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects",
}));

import { Nav } from "@/components/layout/Nav";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("Nav", () => {
  it("renders a brand link to home", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /bridging generations/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("sets aria-current='page' on the active primary link", () => {
    render(<Nav />);
    const projects = screen.getByRole("link", { name: "Projects" });
    expect(projects).toHaveAttribute("aria-current", "page");
    // About BG is a dropdown button on desktop, not a plain link.
    const aboutDropdown = screen.getAllByRole("button", { name: /About BG/i })[0];
    expect(aboutDropdown).toBeInTheDocument();
    expect(aboutDropdown).not.toHaveAttribute("aria-current");
  });

  it("renders the .nav-active-motif notch only on the active item", () => {
    render(<Nav />);
    const projects = screen.getByRole("link", { name: "Projects" });
    expect(projects.querySelector(".nav-active-motif")).not.toBeNull();
    const aboutDropdown = screen.getAllByRole("button", { name: /About BG/i })[0];
    expect(aboutDropdown.querySelector(".nav-active-motif")).toBeNull();
  });

  it("renders Donate links to /donate at desktop and mobile-bar widths", () => {
    render(<Nav />);
    const donates = screen.getAllByRole("link", { name: "Donate" });
    expect(donates.length).toBeGreaterThanOrEqual(1);
    for (const donate of donates) {
      expect(donate).toHaveAttribute("href", "/donate");
    }
  });

  it("renders a collapsed hamburger with aria-controls omitted until menu opens", () => {
    render(<Nav />);
    const hamburger = screen.getByRole("button", { name: /open menu/i });
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(hamburger).not.toHaveAttribute("aria-controls");
  });

  it("locks body scroll while the mobile menu is open and restores on close", async () => {
    document.body.style.overflow = "scroll";
    const user = userEvent.setup();
    render(<Nav />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(document.body.style.overflow).toBe("hidden");

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /close menu/i }));
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores prior body overflow when unmounted with the menu open", async () => {
    document.body.style.overflow = "auto";
    const user = userEvent.setup();
    const { unmount } = render(<Nav />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
