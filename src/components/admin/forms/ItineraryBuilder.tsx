// src/components/admin/forms/ItineraryBuilder.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Card from "@/components/ui/card";

interface ItineraryDay {
  day: string;
  title: string;
  activities: string;
  accommodation?: string;
  meals?: string;
}

interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (itinerary: ItineraryDay[]) => void;
  error?: string;
}

export default function ItineraryBuilder({ value = [], onChange, error }: ItineraryBuilderProps) {
  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      day: `Day ${value.length + 1}`,
      title: "",
      activities: "",
      accommodation: "",
      meals: "",
    };
    onChange([...value, newDay]);
  };

  const handleRemoveDay = (index: number) => {
    const newItinerary = value.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({
      ...day,
      day: `Day ${i + 1}`,
    }));
    onChange(renumbered);
  };

  const handleUpdateDay = (index: number, field: keyof ItineraryDay, newValue: string) => {
    const newItinerary = [...value];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: newValue,
    };
    onChange(newItinerary);
  };

  const handleMoveDay = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === value.length - 1)
    ) {
      return;
    }

    const newItinerary = [...value];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap items
    [newItinerary[index], newItinerary[targetIndex]] = [
      newItinerary[targetIndex],
      newItinerary[index],
    ];

    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({
      ...day,
      day: `Day ${i + 1}`,
    }));

    onChange(renumbered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Itinerary
            <span className="ml-1 text-red-500">*</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">Build your tour day-by-day schedule</p>
        </div>
        <Button type="button" onClick={handleAddDay} size="sm">
          <Plus size={16} className="mr-2" />
          Add Day
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Itinerary Days */}
      <div className="space-y-4">
        {value.length === 0 ? (
          <Card className="py-8 text-center">
            <p className="mb-4 text-gray-500">No itinerary days yet</p>
            <Button type="button" onClick={handleAddDay}>
              <Plus size={16} className="mr-2" />
              Add First Day
            </Button>
          </Card>
        ) : (
          value.map((day, index) => (
            <Card key={index} className="relative">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveDay(index, "up")}
                      disabled={index === 0}
                      className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Move up"
                    >
                      <GripVertical size={16} className="rotate-180 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDay(index, "down")}
                      disabled={index === value.length - 1}
                      className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Move down"
                    >
                      <GripVertical size={16} className="text-gray-400" />
                    </button>
                  </div>

                  <h4 className="font-semibold text-gray-900">Day {index + 1}</h4>
                </div>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveDay(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <Input
                  label="Day Title"
                  placeholder="e.g., Arrival in Nairobi"
                  value={day.title}
                  onChange={(e) => handleUpdateDay(index, "title", e.target.value)}
                  required
                />

                <Textarea
                  label="Activities"
                  placeholder="Describe the day's activities and highlights..."
                  value={day.activities}
                  onChange={(e) => handleUpdateDay(index, "activities", e.target.value)}
                  rows={4}
                  required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Accommodation (Optional)"
                    placeholder="e.g., Safari Lodge"
                    value={day.accommodation || ""}
                    onChange={(e) => handleUpdateDay(index, "accommodation", e.target.value)}
                  />

                  <Input
                    label="Meals (Optional)"
                    placeholder="e.g., Breakfast, Lunch, Dinner"
                    value={day.meals || ""}
                    onChange={(e) => handleUpdateDay(index, "meals", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {value.length > 0 && (
        <div className="flex items-center justify-between border-t pt-2 text-sm text-gray-600">
          <span>
            {value.length} day{value.length !== 1 ? "s" : ""} in itinerary
          </span>
          <Button type="button" variant="primary" size="sm" onClick={handleAddDay}>
            <Plus size={14} className="mr-1" />
            Add Another Day
          </Button>
        </div>
      )}
    </div>
  );
}

// Usage Example in TourForm:
/*
import ItineraryBuilder from '@/components/admin/forms/ItineraryBuilder';

const [formData, setFormData] = useState({
  // ... other fields
  itinerary: [],
});

<ItineraryBuilder
  value={formData.itinerary}
  onChange={(itinerary) => setFormData({ ...formData, itinerary })}
  error={errors.itinerary}
/>
*/
