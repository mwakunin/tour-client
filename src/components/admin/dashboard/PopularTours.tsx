"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import Link from "next/link";
import { TrendingUp, Users, Eye, Star } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils/format";
import { toursApi } from "@/lib/api/tours"; // ✅ Import the API
import { PopularToursWidgetSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

// ✅ UPDATED: Handle multiple destinations and pricing structure
interface PopularTour {
  id: string;
  title: string;
  slug: string;
  pricing: {
    // ✅ Pricing is an object
    amount: number;
    currency: "USD" | "KES";
  };
  bookings_count?: number;
  views_count?: number;
  rating?: number;
  destinations?: Array<{
    // ✅ Changed to array
    id: string;
    title: string;
  }>;
}

export default function PopularTours() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.popular(),
    queryFn: async () => {
      // ✅ Use the API client with destinations included
      return toursApi.getAllWithDestinations({
        featured: true,
        limit: 5,
      });
    },
  });

  // ✅ NEW: Format destinations for display
  const getDestinationDisplay = (destinations?: Array<{ title: string }>) => {
    if (!destinations || destinations.length === 0) return null;
    if (destinations.length === 1) return destinations[0].title;
    return `${destinations[0].title} +${destinations.length - 1}`;
  };

  if (isLoading) {
    return <PopularToursWidgetSkeleton />;
  }

  const tours: PopularTour[] = data?.data || [];

  return (
    <Card title="Popular Tours" description="Most booked and viewed tours">
      <div className="space-y-3">
        {tours.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No popular tours yet</div>
        ) : (
          tours.map((tour, index) => (
            <div
              key={tour.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              {/* Rank */}
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                {index + 1}
              </div>

              {/* Tour Info */}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold text-gray-900">{tour.title}</h4>

                {/* ✅ UPDATED: Display multiple destinations */}
                {tour.destinations && tour.destinations.length > 0 && (
                  <p className="truncate text-sm text-gray-600">
                    {getDestinationDisplay(tour.destinations)}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-1 flex items-center gap-3">
                  {tour.bookings_count !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users size={12} />
                      <span>{tour.bookings_count} bookings</span>
                    </div>
                  )}

                  {tour.views_count !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Eye size={12} />
                      <span>{tour.views_count} views</span>
                    </div>
                  )}

                  {tour.rating !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(
                    Number(tour.pricing?.amount || 0), // ✅ Fixed: tour.pricing.amount
                    tour.pricing?.currency || "USD" // ✅ Fixed: tour.pricing.currency
                  )}
                </p>
                <Link href={`/admin/tours/${tour.id}/edit`}>
                  <Button variant="ghost" size="sm" className="mt-1">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All */}
      {tours.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link href="/admin/tours">
            <Button variant="primary" className="w-full">
              <TrendingUp size={16} className="mr-2" />
              View All Tours
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
