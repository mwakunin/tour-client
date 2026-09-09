"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import DestinationsTable from "@/components/admin/tables/DestinationsTable";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { DestinationsTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

const ITEMS_PER_PAGE = 10;

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch destinations with debounced search
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.list({
      search: debouncedSearch,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
    queryFn: () =>
      destinationsApi.getAll({
        search: debouncedSearch,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => destinationsApi.delete(id),
    onSuccess: () => {
      success("Destination deleted successfully");
      // Invalidate the whole prefix, not just this table, so the public
      // destinations list and the home page carousel drop it too.
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      // Tour cards carry their destination's name inline, so those lists go
      // stale too and are not reached by the destinations root alone.
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
    },
    onError: (err: any) => {
      error(err.message || "Failed to delete destination");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    deleteMutation.mutate(id);
  };

  const destinations = data?.data || [];
  const isSearching = searchQuery !== debouncedSearch;
  const hasNextPage = destinations.length === ITEMS_PER_PAGE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your travel destinations</p>
        </div>
        <Link href="/admin/destinations/new">
          <Button>
            <Plus className="mr-2" size={20} />
            Add Destination
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
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
              <Loading size="sm" />
            </div>
          )}
        </div>
      </Card>
      {/* ✅ Table Section - Show skeleton ONLY for table */}
      {isLoading ? (
        <DestinationsTableSkeleton />
      ) : (
        <>
          {/* Destinations Table */}
          <Card>
            <DestinationsTable
              destinations={destinations}
              onDelete={handleDelete}
              isLoading={deleteMutation.isPending}
            />
          </Card>

          {/* Empty State for Search */}
          {destinations.length === 0 && debouncedSearch && (
            <div className="py-8 text-center text-gray-500">
              No destinations found matching "{debouncedSearch}"
            </div>
          )}

          {/* Pagination */}
          {(currentPage > 1 || hasNextPage) && (
            <Card className="flex items-center justify-between p-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} ({destinations.length} shown)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
