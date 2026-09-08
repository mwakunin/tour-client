"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { EditBookingPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import PageHero, { HERO_LIONESS } from "@/components/public/layout/PageHero";
import Card from "@/components/ui/card";
import Button, { buttonVariants } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const bookingId = params.id as string;

  const { data: booking, isLoading } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      const response = await bookingsApi.getById(bookingId);
      return response.data || response;
    },
    enabled: !!bookingId,
  });

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    special_requests: "",
  });

  // Initialize form data when booking loads
  useEffect(() => {
    if (booking) {
      setFormData({
        start_date: booking.start_date?.split("T")[0] || "",
        end_date: booking.end_date?.split("T")[0] || "",
        special_requests: booking.special_requests || "",
      });
    }
  }, [booking]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => bookingsApi.update(bookingId, data),
    onSuccess: () => {
      success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      router.push(`/bookings/${bookingId}`);
    },
    onError: (err: any) => {
      showError(err.response?.data?.error || "Failed to update booking");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <EditBookingPageSkeleton />;
  }

  if (booking?.payment_status === "paid") {
    return (
      <div className="bg-surface min-h-screen">
        <PageHero
          title="Edit Booking"
          description="Modify your booking details"
          image={HERO_LIONESS}
          height="compact"
        />

        {/* Cannot Edit Message */}
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="bg-surface-container-lowest shadow-elevated p-12 text-center">
            <div className="bg-error-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Edit className="text-on-error-container h-8 w-8" />
            </div>
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Cannot Edit Paid Booking</h2>
            <p className="text-on-surface-variant mb-6">
              This booking has already been paid and cannot be modified. Please contact support if
              you need to make changes.
            </p>
            <Link
              href={`/bookings/${bookingId}`}
              className={buttonVariants({
                variant: "primary",
                className: "inline-flex items-center gap-2",
              })}
            >
              <ArrowLeft size={20} />
              Back to Booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Edit Booking"
        description="Modify your booking details"
        image={HERO_LIONESS}
        height="compact"
      />

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/bookings/${bookingId}`}
          className="text-on-surface-variant hover:text-on-surface mb-6 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Booking
        </Link>

        {/* Edit Form */}
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <Edit className="text-on-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-on-surface text-xl font-bold">Booking Details</h2>
              <p className="text-on-surface-variant text-sm">
                Update your travel dates and special requests
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tour Info */}
            {booking?.tour && (
              <div className="bg-surface-container-low p-4">
                <p className="text-on-surface-variant text-sm">Tour</p>
                <p className="text-on-surface font-semibold">{booking.tour.title}</p>
              </div>
            )}

            {/* Date Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                type="date"
                label="Start Date *"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                min={new Date().toISOString().split("T")[0]}
              />

              <Input
                type="date"
                label="End Date *"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                min={formData.start_date || new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Special Requests */}
            <Textarea
              label="Special Requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              rows={4}
              placeholder="Any dietary requirements, accessibility needs, or special requests..."
              helpText="Let us know if you have any special requirements for your trip"
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="border-primary/30 border-t-primary h-5 w-5 animate-spin rounded-full border-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit size={20} />
                    Save Changes
                  </>
                )}
              </Button>

              <Link
                href={`/bookings/${bookingId}`}
                className={buttonVariants({
                  variant: "secondary",
                  className: "flex flex-1 items-center justify-center gap-2",
                })}
              >
                <ArrowLeft size={20} />
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
