"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import ToursTable from "@/components/admin/tables/ToursTable";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { ToursTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Debounce search - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tours with debounced search
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.list({ search: debouncedSearch, limit: 100 }),
    queryFn: () => toursApi.getAllWithDestinations({ search: debouncedSearch, limit: 100 }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => toursApi.delete(id),
    onSuccess: () => {
      success("Tour deleted successfully");
      // Invalidate the whole prefix, not just this table, so the public tour
      // list, detail pages, and home carousels drop it too.
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      // A destination's page lists its tours under the destinations root, so
      // that query is not reached by the tours root alone.
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
    },
    onError: (err: any) => {
      error(err.message || "Failed to delete tour");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour?")) return;
    deleteMutation.mutate(id);
  };

  const tours = data?.data || [];
  const isSearching = searchQuery !== debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your tour packages</p>
        </div>
        <Link href="/admin/tours/new">
          <Button>
            <Plus size={20} className="mr-2" />
            Add Tour
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {/* ✅ Optional: Show loading indicator while searching */}
          {isSearching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
              <Loading size="sm" />
            </div>
          )}
        </div>
      </Card>
      {/* ✅ Table Section - Show skeleton ONLY for table */}
      {isLoading ? (
        <ToursTableSkeleton />
      ) : (
        <>
          {/* Tours Table */}
          <Card>
            <ToursTable
              tours={tours}
              onDelete={handleDelete}
              isLoading={deleteMutation.isPending}
            />
          </Card>

          {/* Empty State for Search */}
          {tours.length === 0 && debouncedSearch && (
            <div className="py-8 text-center text-gray-500">
              No tours found matching "{debouncedSearch}"
            </div>
          )}
        </>
      )}
    </div>
  );
}
