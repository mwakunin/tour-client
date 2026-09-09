import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TourForm from "../TourForm";
import { destinationsApi } from "@/lib/api/destinations";

jest.mock("posthog-js/react", () => ({ usePostHog: () => ({ capture: jest.fn() }) }));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// Stands in for the real uploader: reports how much room the form gave it, and
// hands back more URLs than the form is allowed to keep.
jest.mock("@/components/admin/forms/ImageUploader", () => ({
  __esModule: true,
  default: ({ onUploadComplete, maxFiles }: any) => (
    <button
      type="button"
      data-testid="fake-upload"
      data-maxfiles={String(maxFiles)}
      onClick={() =>
        onUploadComplete(Array.from({ length: 12 }, (_, i) => `https://img.test/${i}.jpg`))
      }
    >
      upload 12
    </button>
  ),
}));
jest.mock("@/lib/api/destinations", () => ({
  destinationsApi: { getAll: jest.fn() },
}));

const mockDestinations = destinationsApi.getAll as jest.Mock;

const renderForm = () => {
  const qc = new QueryClient({
    // retryDelay 0 because TourForm asks for retry: 1 on the destinations query
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <TourForm onSubmit={jest.fn()} isSubmitting={false} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  mockDestinations.mockReset();
  mockDestinations.mockResolvedValue({ data: [] });
});

describe("TourForm limit guards", () => {
  it("flags an over-long meta title live, before submit", () => {
    renderForm();
    expect(screen.getByText("0/60")).toBeInTheDocument();

    const inputs = document.querySelectorAll('input[name="meta_title"]');
    fireEvent.change(inputs[0], { target: { value: "x".repeat(75) } });

    expect(screen.getByText("75/60")).toBeInTheDocument();
    expect(screen.getByText(/Meta title is 15 characters over the 60 limit/)).toBeInTheDocument();
    expect(inputs[0]).toHaveClass("border-error");
  });

  it("lists every failing field instead of failing silently", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /create tour/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/fields need fixing/);
    expect(alert).toHaveTextContent(/Tour Title: Title is required/);
    expect(alert).toHaveTextContent(/Overview: Overview must be at least 100 characters/);
    expect(alert).toHaveTextContent(/Images: At least one image required/);
  });

  it("keeps only what fits when an upload returns more images than the cap", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /add images/i }));
    expect(screen.getByTestId("fake-upload")).toHaveAttribute("data-maxfiles", "10");

    fireEvent.click(screen.getByTestId("fake-upload"));

    await waitFor(() => expect(screen.getAllByAltText(/Tour image/)).toHaveLength(10));
    expect(screen.getByText(/2 images left out — 10 is the maximum/)).toBeInTheDocument();
    expect(screen.getByText("10/10")).toBeInTheDocument();
  });

  it("blocks an over-long tag with a message rather than dropping it", async () => {
    renderForm();
    const tagInput = screen.getByPlaceholderText("Type a tag and press Enter");
    fireEvent.change(tagInput, { target: { value: "y".repeat(60) } });

    expect(screen.getByText(/Tag is 10 characters over the 50 limit/)).toBeInTheDocument();
    const addTag = screen.getByRole("button", { name: "Add Tag" });
    expect(addTag).toBeDisabled();

    fireEvent.change(tagInput, { target: { value: "safari" } });
    await waitFor(() => expect(addTag).not.toBeDisabled());
  });
});

describe("TourForm cover image", () => {
  // Mirrors the state that left a deleted photo live on the site: the cover
  // still points at an image the tour no longer has.
  const tourWithStaleCover = {
    title: "Tsavo East and West",
    slug: "tsavo-east-and-west",
    overview: "x".repeat(150),
    destinations: [],
    categories: [],
    duration: 3,
    duration_unit: "days",
    status: "draft",
    featured: false,
    is_deal: false,
    images: ["https://img.test/keep-1.jpg", "https://img.test/keep-2.jpg"],
    cover_image: "https://img.test/deleted.jpg",
    pricing: { amount: 100, currency: "USD" },
    pricing_periods: [],
    itinerary: [],
    tags: [],
  };

  const renderWith = (initialData: any) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } });
    return render(
      <QueryClientProvider client={qc}>
        <TourForm initialData={initialData} onSubmit={jest.fn()} isSubmitting={false} />
      </QueryClientProvider>
    );
  };

  /** src of whichever tile currently carries the "Cover" badge */
  const coveredImage = () =>
    screen.getByText("Cover").parentElement?.querySelector("img")?.getAttribute("src");

  const tileFor = (src: string) =>
    document.querySelector(`img[src="${src}"]`)?.parentElement as HTMLElement;

  it("re-seeds a cover that is no longer one of the images", () => {
    renderWith(tourWithStaleCover);
    expect(coveredImage()).toBe("https://img.test/keep-1.jpg");
  });

  it("hands the cover to another image when the cover is deleted", async () => {
    renderWith(tourWithStaleCover);
    expect(coveredImage()).toBe("https://img.test/keep-1.jpg");

    // The cover tile's only button is its remove (X) control
    fireEvent.click(tileFor("https://img.test/keep-1.jpg").querySelector("button")!);

    await waitFor(() => expect(coveredImage()).toBe("https://img.test/keep-2.jpg"));
  });

  it("lets another image be promoted to cover", async () => {
    renderWith(tourWithStaleCover);

    fireEvent.click(screen.getByRole("button", { name: "Set as cover" }));

    await waitFor(() => expect(coveredImage()).toBe("https://img.test/keep-2.jpg"));
  });
});

describe("TourForm destinations picker", () => {
  it("says it is loading rather than showing an empty box", () => {
    renderForm();
    expect(screen.getByText("Loading destinations…")).toBeInTheDocument();
  });

  it("offers a retry when the destinations fetch fails", async () => {
    mockDestinations.mockRejectedValue(new Error("network down"));
    renderForm();

    expect(await screen.findByText("Could not load destinations.")).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Retry" });

    mockDestinations.mockResolvedValue({ data: [{ id: "d1", title: "Maasai Mara" }] });
    fireEvent.click(retry);

    expect(await screen.findByText("Maasai Mara")).toBeInTheDocument();
  });

  it("points at destination creation when there are none", async () => {
    renderForm();
    expect(await screen.findByText(/No destinations yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute(
      "href",
      "/admin/destinations/new"
    );
  });

  it("asks the API for more than the default 10 destinations", async () => {
    renderForm();
    await waitFor(() => expect(mockDestinations).toHaveBeenCalledWith({ limit: 100 }));
  });
});
