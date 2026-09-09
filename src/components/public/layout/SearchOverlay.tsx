"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import Button from "@/components/ui/button";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);

  if (!open) return null;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.append("search", destination);
    if (date) params.append("date", date);
    if (maxPrice < 5000) params.append("max_price", maxPrice.toString());
    onClose();
    router.push(`/tours?${params.toString()}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="border-outline-variant bg-surface-container-lowest shadow-elevated absolute inset-x-0 top-full z-40 border-t">
        <form
          onSubmit={handleSearch}
          className="container mx-auto flex flex-col gap-6 px-4 py-6 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="text-on-surface-variant mb-2 block text-base font-medium">
              Search your destination:
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination or tour..."
                className="border-outline-variant bg-surface-container-low text-on-surface focus:ring-primary w-full rounded-none border px-4 py-2 pr-10 focus:ring-2"
              />
              <MapPin className="text-on-surface-variant absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-on-surface-variant mb-2 block text-base font-medium">
              Select your date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="border-outline-variant bg-surface-container-low text-on-surface focus:ring-primary w-full rounded-none border px-4 py-2 focus:ring-2"
            />
          </div>

          <div className="flex-1">
            <label className="text-on-surface-variant mb-2 block text-base font-medium">
              Max price:
              <span className="text-primary float-right font-bold">
                ${maxPrice.toLocaleString()}
              </span>
            </label>
            <div className="pt-2">
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="bg-surface-container-high accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
              <div className="text-on-surface-variant mt-1 flex justify-between text-xs">
                <span>$500</span>
                <span>$10,000</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 md:mb-0">
            <Button type="submit" className="w-full md:w-auto">
              Search
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
