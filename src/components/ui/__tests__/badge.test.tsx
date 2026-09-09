import { render, screen } from "@/lib/test-utils";
import { Badge } from "../badge";
import "@testing-library/jest-dom";

describe("Badge", () => {
  it("should render badge with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should apply default variant by default", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-surface-container-high", "text-on-surface-variant");
  });

  it("should apply primary variant", () => {
    render(<Badge variant="primary">Primary</Badge>);
    const badge = screen.getByText("Primary");
    expect(badge).toHaveClass("bg-primary", "text-on-primary");
  });

  it("should apply secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-secondary-container", "text-on-secondary-container");
  });

  it("should apply success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-secondary-container", "text-on-secondary-container");
  });

  it("should apply warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-tertiary-container", "text-on-tertiary-container");
  });

  it("should apply danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge).toHaveClass("bg-error-container", "text-on-error-container");
  });

  it("should apply info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveClass("bg-primary-container", "text-on-primary-container");
  });

  it("should merge custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-badge");
  });

  it("should render as span element", () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText("Badge");
    expect(badge.tagName).toBe("SPAN");
  });

  it("should forward ref to span element", () => {
    const ref = { current: null };
    render(<Badge ref={ref as any}>Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("should apply base classes", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "rounded-full",
      "px-2.5",
      "py-0.5",
      "label-caps"
    );
  });

  it("should pass through additional HTML attributes", () => {
    render(
      <Badge data-testid="test-badge" aria-label="test">
        Test
      </Badge>
    );
    const badge = screen.getByTestId("test-badge");
    expect(badge).toHaveAttribute("aria-label", "test");
  });
});
