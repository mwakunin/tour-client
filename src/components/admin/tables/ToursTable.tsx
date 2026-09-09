"use client";

import Link from "next/link";
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ToursTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";
import posthog from "posthog-js";

interface Tour {
  id: string;
  title: string;
  slug: string;
  destinations?: Array<{
    id: string;
    title: string;
  }>;
  duration: number;
  duration_unit: string;
  pricing: {
    // null for tours priced entirely by pricing_periods
    amount: number | null;
    currency: "USD" | "KES" | null;
    discount_percentage?: number;
  };
  pricing_periods?: Array<{
    label?: string;
    start_date: string;
    end_date: string;
    pricing_tiers: Array<{
      pax: number;
      price_per_person: number;
      total?: number;
      currency: string;
    }>;
  }>;
  price_display?: string;
  pricing_display?: {
    display_price: string;
    has_periods: boolean;
  };
  status: string;
  featured: boolean;
  created_at: string;
}

interface ToursTableProps {
  tours: Tour[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function ToursTable({ tours, onDelete, isLoading }: ToursTableProps) {
  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      published: "success",
      draft: "warning",
      archived: "danger",
    };
    return variants[status] || "default";
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This action cannot be undone.`)) {
      posthog.capture("admin_tour_deleted", { tour_id: id, tour_title: title });
      onDelete?.(id);
    }
  };

  // ✅ NEW: Format destinations display
  const formatDestinations = (destinations?: Array<{ title: string }>) => {
    if (!destinations || destinations.length === 0) return "N/A";

    if (destinations.length === 1) {
      return destinations[0].title;
    }

    // Show first destination + count of others
    return `${destinations[0].title} +${destinations.length - 1}`;
  };

  if (isLoading) {
    return <ToursTableSkeleton />;
  }

  if (tours.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 py-12 text-center">
        <p className="mb-4 text-gray-500">No tours found</p>
        <Link href="/admin/tours/new">
          <Button onClick={() => posthog.capture("admin_create_first_tour_clicked")}>
            Create Your First Tour
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tour
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Created
            </th>
            {/* Pinned: this table is wider than the content area on a 1280–1366
                screen, which used to leave the actions scrolled out of sight */}
            <th className="sticky right-0 z-10 border-l border-gray-200 bg-gray-50 px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tours.map((tour) => (
            <tr key={tour.id} className="group hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{tour.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {tour.featured && (
                      <Badge variant="warning" className="text-xs">
                        Featured
                      </Badge>
                    )}
                    {/* Seasonal pricing indicator */}
                    {tour.pricing_periods && tour.pricing_periods.length > 0 && (
                      <Badge variant="info" className="text-xs text-white">
                        {tour.pricing_periods.length}{" "}
                        {tour.pricing_periods.length === 1 ? "season" : "seasons"}
                      </Badge>
                    )}
                  </div>
                </div>
              </td>
              {/* ✅ UPDATED: Display multiple destinations */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {/* Left wrapping rather than truncated: `truncate` would set
                    nowrap, and a table column grows to fit nowrap content —
                    capping it here measured *wider*, not narrower */}
                <div className="flex flex-col gap-1">
                  <span>{formatDestinations(tour.destinations)}</span>
                  {tour.destinations && tour.destinations.length > 1 && (
                    <span className="text-xs text-gray-400">
                      {tour.destinations.map((d) => d.title).join(", ")}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {tour.duration}{" "}
                {tour.duration === 1 ? tour.duration_unit.slice(0, -1) : tour.duration_unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {/* The API computes this from the active season; the flat
                        amount is null for seasonal tours so it can't be a fallback */}
                    {tour.pricing_display?.display_price ||
                      tour.price_display ||
                      (tour.pricing?.amount != null
                        ? formatCurrency(
                            Number(tour.pricing.amount),
                            tour.pricing.currency || "USD"
                          )
                        : "—")}
                  </span>
                  {tour.pricing_periods && tour.pricing_periods.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {tour.pricing_periods.reduce((n, p) => n + (p.pricing_tiers?.length ?? 0), 0)}{" "}
                      tiers across {tour.pricing_periods.length}{" "}
                      {tour.pricing_periods.length === 1 ? "season" : "seasons"}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getStatusVariant(tour.status)}>{tour.status}</Badge>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {formatDate(tour.created_at)}
              </td>
              <td className="sticky right-0 z-10 border-l border-gray-200 bg-white px-6 py-4 text-right text-sm whitespace-nowrap group-hover:bg-gray-50">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/tours/${tour.slug}`} target="_blank">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="View"
                      onClick={() =>
                        posthog.capture("admin_view_tour_clicked", {
                          tour_id: tour.id,
                          tour_slug: tour.slug,
                        })
                      }
                    >
                      <Eye size={16} />
                    </Button>
                  </Link>

                  <Link href={`/admin/tours/${tour.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit"
                      onClick={() =>
                        posthog.capture("admin_edit_tour_clicked", { tour_id: tour.id })
                      }
                    >
                      <Edit size={16} />
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tour.id, tour.title)}
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
