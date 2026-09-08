"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DestinationForm from "@/components/admin/forms/DestinationForm";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import { toast } from "sonner";

export default function NewDestinationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: destinationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.destinations.all });
      toast.success("Destination created successfully!");
      router.push("/admin/destinations");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create destination");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Destination</h1>
        <p className="mt-1 text-sm text-gray-500">Add a new travel destination</p>
      </div>

      <DestinationForm
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
