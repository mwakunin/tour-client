import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

interface TourFiltersProps {
  filters: {
    category: string | undefined;
    min_price: number | undefined;
    max_price: number | undefined;
    duration: number | undefined;
    date: string | undefined;
  };
  setFilters: (filters: any) => void;
}

export default function TourFilters({ filters, setFilters }: TourFiltersProps) {
  const categories = [
    "adventure",
    "cultural",
    "wildlife",
    "beach",
    "luxury",
    "budget",
    "family",
    "honeymoon",
    "group",
    "private",
  ];

  const handlePriceChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value === "" ? undefined : Number(value),
    });
  };

  const handleDurationChange = (value: string) => {
    setFilters({
      ...filters,
      duration: value === "" ? undefined : Number(value),
    });
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = value === "" ? undefined : value;
    setFilters({
      ...filters,
      category: newCategory,
    });
  };

  return (
    <Card title="Filter Tours" className="sticky top-24">
      {/* Category */}
      <div className="mb-6">
        <Select
          label="Category"
          value={filters.category || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((cat) => ({
              value: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
            })),
          ]}
        />
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <p className="label-caps text-on-surface-variant mb-2">Price Range</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ""}
            onChange={(e) => handlePriceChange("min_price", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ""}
            onChange={(e) => handlePriceChange("max_price", e.target.value)}
          />
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <Select
          label="Duration (days)"
          value={filters.duration ?? ""}
          onChange={(e) => handleDurationChange(e.target.value)}
          options={[
            { value: "", label: "Any Duration" },
            { value: "3", label: "Up to 3 days" },
            { value: "7", label: "4-7 days" },
            { value: "14", label: "8-14 days" },
            { value: "15", label: "15+ days" },
          ]}
        />
      </div>

      {/* Date Filter */}
      {filters.date && (
        <div className="mb-6">
          <p className="label-caps text-on-surface-variant mb-2">Selected Date</p>
          <div className="border-outline-variant bg-surface-container-low flex items-center justify-between rounded-none border px-3 py-2">
            <span className="text-on-surface text-sm">
              {new Date(filters.date).toLocaleDateString()}
            </span>
            <button
              onClick={() => setFilters({ ...filters, date: undefined })}
              className="text-error hover:text-error/80"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() =>
          setFilters({
            category: "",
            min_price: undefined,
            max_price: undefined,
            duration: undefined,
            date: undefined,
          })
        }
      >
        Clear Filters
      </Button>
    </Card>
  );
}
