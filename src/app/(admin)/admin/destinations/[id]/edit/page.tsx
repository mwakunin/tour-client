"use client";

import { use } from "react"; // ← Add this import
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DestinationForm from "@/components/admin/forms/DestinationForm";
import { Loading } from "@/components/ui/loading";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import { toast } from "sonner";
import { EditDestinationPageSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

export default function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← Change to Promise
}) {
  const { id } = use(params); // ← Unwrap the Promise
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.detailById(id),
    queryFn: () => destinationsApi.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => destinationsApi.update(id, data),
    onSuccess: () => {
      // The root covers this destination's detail key whether a reader looked
      // it up by id (admin) or by slug (public), plus every list and carousel.
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      // Tour cards carry their destination's name inline, so those lists go
      // stale too and are not reached by the destinations root alone.
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      toast.success("Destination updated successfully!");
      router.push("/admin/destinations");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update destination");
    },
  });

  if (isLoading) return <EditDestinationPageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Destination</h1>
        <p className="mt-1 text-sm text-gray-500">Update destination information</p>
      </div>

      <DestinationForm
        initialData={data?.data}
        onSubmit={(data) => updateMutation.mutate(data)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
