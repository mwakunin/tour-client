"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import BookingsTable from "@/components/admin/tables/BookingsTable";
import { BookingsTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: queryKeys.bookings.list({ search: debouncedSearch, status: statusFilter }),
    queryFn: () =>
      bookingsApi.getAll({
        search: debouncedSearch,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const isSearching = searchQuery !== debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage customer bookings and reservations</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {/* ✅ Show loading indicator while searching */}
          {isSearching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
              <Loading size="sm" />
            </div>
          )}
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>
      {/* ✅ Table Section - Show skeleton ONLY for table */}
      {isLoading ? (
        <BookingsTableSkeleton />
      ) : (
        <>
          {/* Bookings Table */}
          <Card>
            <BookingsTable
              bookings={bookings?.data || []}
              isLoading={isLoading}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </Card>
          {/* Empty State for Search */}
          {bookings?.data?.length === 0 && debouncedSearch && (
            <div className="py-8 text-center text-gray-500">
              No bookings found matching "{debouncedSearch}"
            </div>
          )}
        </>
      )}
    </div>
  );
}
