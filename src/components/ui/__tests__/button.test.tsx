import { render, screen } from "@/lib/test-utils";
import Button from "../button";
import "@testing-library/jest-dom";

describe("Button", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should apply primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText("Primary");
    expect(button).toHaveClass("border-primary", "text-primary");
  });

  it("should apply secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary");
    expect(button).toHaveClass("border-secondary");
  });

  it("should apply danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText("Delete");
    expect(button).toHaveClass("bg-error");
  });

  it("should apply ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText("Ghost");
    expect(button).toHaveClass("bg-transparent");
  });

  it("should apply small size", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText("Small");
    expect(button).toHaveClass("px-3", "py-1.5");
  });

  it("should apply medium size by default", () => {
    render(<Button>Medium</Button>);
    const button = screen.getByText("Medium");
    expect(button).toHaveClass("px-4", "py-2");
  });

  it("should apply large size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText("Large");
    expect(button).toHaveClass("px-6", "py-3");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });

  it("should be disabled when isLoading is true", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByText("Loading");
    expect(button).toBeDisabled();
  });

  it("should handle onClick events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByText("Click");
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not trigger onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    const button = screen.getByText("Disabled");
    button.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should merge custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText("Custom");
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref to button element", () => {
    const ref = { current: null };
    render(<Button ref={ref as any}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render as button type by default", () => {
    render(<Button>Button</Button>);
    const button = screen.getByText("Button");
    expect(button.tagName).toBe("BUTTON");
  });

  it("should accept type prop", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText("Submit");
    expect(button).toHaveAttribute("type", "submit");
  });
});
