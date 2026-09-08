"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TourForm from "@/components/admin/forms/TourForm";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "sonner";

export default function NewTourPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: toursApi.create,
    onSuccess: () => {
      console.log("✅ Tour created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tours.all });
      // A destination's page lists its tours under the destinations root, so
      // that query is not reached by the tours root alone.
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      toast.success("Tour created successfully!");
      router.push("/admin/tours");
    },
    onError: (error: any) => {
      // The API names the offending fields in `details`; axios only carries
      // "Request failed with status code 400" on error.message.
      console.error("❌ Error creating tour:", error.response?.data ?? error);
      toast.error("Failed to create tour", {
        description: getApiErrorMessage(error, "Please try again."),
        duration: 10000,
      });
    },
  });

  const handleSubmit = (data: any) => {
    console.log("📤 Parent received data:", data);
    console.log("isPending before mutate:", createMutation.isPending);
    createMutation.mutate(data);
  };

  console.log("🔄 Render - isPending:", createMutation.isPending);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Tour</h1>
        <p className="mt-1 text-sm text-gray-500">Add a new safari tour package</p>
      </div>
      <TourForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}
