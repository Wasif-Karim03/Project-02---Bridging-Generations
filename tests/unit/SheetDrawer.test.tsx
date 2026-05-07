import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SheetDrawer } from "@/components/ui/SheetDrawer";

// jsdom 25+ supports <dialog>. Older versions need polyfills.
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      (this as HTMLDialogElement).setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      (this as HTMLDialogElement).removeAttribute("open");
    };
  }
});

describe("SheetDrawer", () => {
  it("does not show content when closed", () => {
    render(
      <SheetDrawer open={false} onClose={() => {}} ariaLabel="Test drawer">
        <p>drawer body</p>
      </SheetDrawer>,
    );
    // The dialog element exists but is not open
    const dialog = document.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("shows content when open", async () => {
    render(
      <SheetDrawer open={true} onClose={() => {}} ariaLabel="Test drawer">
        <p>drawer body</p>
      </SheetDrawer>,
    );
    // showModal() runs in a microtask (iPhone Safari top-layer fix); await it.
    await Promise.resolve();
    const dialog = document.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);
    expect(screen.getByText("drawer body")).toBeInTheDocument();
  });

  it("uses native <dialog>", () => {
    const { container } = render(
      <SheetDrawer open={true} onClose={() => {}} ariaLabel="x">
        <span>x</span>
      </SheetDrawer>,
    );
    expect(container.querySelector("dialog")).not.toBeNull();
  });

  it("calls onClose on backdrop click (click on dialog itself, not children)", () => {
    let closed = false;
    render(
      <SheetDrawer
        open={true}
        onClose={() => {
          closed = true;
        }}
        ariaLabel="x"
      >
        <span>inner</span>
      </SheetDrawer>,
    );
    const dialog = document.querySelector("dialog");
    if (!dialog) throw new Error("dialog not found");
    // Simulate a click on the dialog element directly (target === currentTarget)
    fireEvent.click(dialog);
    expect(closed).toBe(true);
  });

  it("calls onClose on cancel event (ESC)", () => {
    let closed = false;
    render(
      <SheetDrawer
        open={true}
        onClose={() => {
          closed = true;
        }}
        ariaLabel="x"
      >
        <span>x</span>
      </SheetDrawer>,
    );
    const dialog = document.querySelector("dialog");
    if (!dialog) throw new Error("dialog not found");
    fireEvent(dialog, new Event("cancel"));
    expect(closed).toBe(true);
  });

  it("locks body scroll when open and restores on close", () => {
    const { rerender, unmount } = render(
      <SheetDrawer open={false} onClose={() => {}} ariaLabel="x">
        <span>x</span>
      </SheetDrawer>,
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    rerender(
      <SheetDrawer open={true} onClose={() => {}} ariaLabel="x">
        <span>x</span>
      </SheetDrawer>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(
      <SheetDrawer open={false} onClose={() => {}} ariaLabel="x">
        <span>x</span>
      </SheetDrawer>,
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    unmount();
  });
});
