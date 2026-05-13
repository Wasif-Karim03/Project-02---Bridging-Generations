import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionDemo } from "@/app/(site)/design/_components/MotionDemo";

const easeSmooth = [0.16, 1, 0.3, 1] as const;

describe("MotionDemo", () => {
  it("renders the name, source, duration, easing token, and reduced-motion contract", () => {
    const { getByText } = render(
      <MotionDemo
        name="develop"
        source="components/ui/Reveal.tsx · kind=develop"
        durationMs={900}
        easing={easeSmooth}
        easingToken="--ease-smooth"
        reducedMotion="Opacity-only fallback."
        reducedPreview={<span data-testid="reduced">reduced</span>}
      >
        <span data-testid="motion">motion</span>
      </MotionDemo>,
    );
    expect(getByText("develop")).toBeInTheDocument();
    expect(getByText(/components\/ui\/Reveal\.tsx/)).toBeInTheDocument();
    expect(getByText("900ms")).toBeInTheDocument();
    expect(getByText("--ease-smooth")).toBeInTheDocument();
    expect(getByText("Opacity-only fallback.")).toBeInTheDocument();
  });

  it("renders both motion and reduced previews", () => {
    const { getByTestId } = render(
      <MotionDemo
        name="x"
        source="x"
        durationMs={100}
        easing={easeSmooth}
        easingToken="--ease-smooth"
        reducedMotion="x"
        reducedPreview={<span data-testid="reduced">REDUCED</span>}
      >
        <span data-testid="motion">MOTION</span>
      </MotionDemo>,
    );
    expect(getByTestId("motion")).toHaveTextContent("MOTION");
    expect(getByTestId("reduced")).toHaveTextContent("REDUCED");
  });

  it("Replay re-mounts the children", () => {
    let mountCount = 0;
    const Counter = () => {
      mountCount++;
      return <span>counter</span>;
    };
    const { getByRole } = render(
      <MotionDemo
        name="x"
        source="x"
        durationMs={100}
        easing={easeSmooth}
        easingToken="--ease-smooth"
        reducedMotion="x"
        reducedPreview={<span>r</span>}
      >
        <Counter />
      </MotionDemo>,
    );
    expect(mountCount).toBe(1);
    fireEvent.click(getByRole("button", { name: /Replay/i }));
    expect(mountCount).toBe(2);
    fireEvent.click(getByRole("button", { name: /Replay/i }));
    expect(mountCount).toBe(3);
  });

  it("renders the timing-diagram svg with the expected easing path", () => {
    const { container } = render(
      <MotionDemo
        name="x"
        source="x"
        durationMs={100}
        easing={easeSmooth}
        easingToken="--ease-smooth"
        reducedMotion="x"
        reducedPreview={<span>r</span>}
      >
        <span>m</span>
      </MotionDemo>,
    );
    const path = container.querySelector("svg path");
    // easingPath([0.16, 1, 0.3, 1], 60, 30) → "M 0 30 C 9.6 0 18 0 60 0"
    expect(path?.getAttribute("d")).toBe("M 0 30 C 9.6 0 18 0 60 0");
  });
});
