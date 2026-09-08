"use client";

import { use } from "react"; // ← Add this import
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TourForm from "@/components/admin/forms/TourForm";
import { Loading } from "@/components/ui/loading";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "sonner";
import { EditTourPageSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

export default function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← Change to Promise
}) {
  const { id } = use(params); // ← Unwrap the Promise
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.detailById(id),
    queryFn: () => toursApi.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => toursApi.update(id, data),
    onSuccess: () => {
      // The root covers this tour's detail key whether a reader looked it up
      // by id (admin) or by slug (public), plus every list and carousel.
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      // A destination's page lists its tours under the destinations root, so
      // that query is not reached by the tours root alone.
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      toast.success("Tour updated successfully!");
      router.push("/admin/tours");
    },
    onError: (error: any) => {
      console.error("Error updating tour:", error.response?.data ?? error);
      toast.error("Failed to update tour", {
        description: getApiErrorMessage(error, "Please try again."),
        duration: 10000,
      });
    },
  });

  if (isLoading) return <EditTourPageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tour</h1>
        <p className="mt-1 text-sm text-gray-500">Update tour information</p>
      </div>

      <TourForm
        initialData={data?.data}
        onSubmit={(data) => updateMutation.mutate(data)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
