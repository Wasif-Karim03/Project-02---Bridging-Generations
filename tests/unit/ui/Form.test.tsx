import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

describe("Field", () => {
  it("wires label htmlFor to the input id", () => {
    render(<Field label="Name">{(props) => <Input {...props} placeholder="x" />}</Field>);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(input.id).toBeTruthy();
  });

  it("renders a helper hint linked via aria-describedby", () => {
    render(
      <Field label="Email" hint="We'll only use this to reply.">
        {(props) => <Input {...props} type="email" />}
      </Field>,
    );
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBeNull();
    const hint = document.getElementById(describedBy ?? "");
    expect(hint?.textContent).toContain("We'll only use this to reply.");
  });

  it("renders an error region with role=alert and sets aria-invalid", () => {
    render(
      <Field label="Subject" error="Subject is required.">
        {(props) => <Input {...props} />}
      </Field>,
    );
    const input = screen.getByLabelText("Subject") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Subject is required.");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("hides the hint when an error is also present", () => {
    render(
      <Field label="Subject" hint="hint copy" error="Required">
        {(props) => <Input {...props} />}
      </Field>,
    );
    expect(screen.queryByText("hint copy")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea aria-label="msg" />);
    expect(screen.getByLabelText("msg").tagName).toBe("TEXTAREA");
  });
});

describe("Select", () => {
  it("renders a select with options", () => {
    render(
      <Select aria-label="topic">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByLabelText("topic") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select.options.length).toBe(2);
  });
});
