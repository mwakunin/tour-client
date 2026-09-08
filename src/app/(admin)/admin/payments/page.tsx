"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  CreditCard,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";

import { paymentsApi } from "@/lib/api/payments";
import { queryKeys } from "@/lib/api/queryKeys";

export default function AdminBankTransferConfirmation() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [confirmationData, setConfirmationData] = useState({
    receipt_number: "",
    amount_received: "",
    notes: "",
  });

  // Fetch pending bank transfers
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.payments.pendingBankTransfers(),
    queryFn: paymentsApi.getPendingBankTransfers,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Confirm bank transfer mutation
  const confirmMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      paymentsApi.confirmBankTransfer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      // Confirming flips the booking's payment_status to paid, so the bookings
      // table, the customer's own booking, and the revenue tiles are all stale.
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setSelectedBooking(null);
      setConfirmationData({
        receipt_number: "",
        amount_received: "",
        notes: "",
      });
      alert("Payment confirmed successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to confirm payment");
    },
  });

  const pendingTransfers = data?.data || [];

  // Filter bookings
  const filteredBookings = pendingTransfers.filter(
    (booking: any) =>
      booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedBooking) return;

    const confirmData = {
      receipt_number: confirmationData.receipt_number || undefined,
      amount_received: confirmationData.amount_received
        ? parseFloat(confirmationData.amount_received)
        : undefined,
      notes: confirmationData.notes || undefined,
    };

    confirmMutation.mutate({
      id: selectedBooking.id,
      data: confirmData,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${parseFloat(amount?.toString() || "0").toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pending Bank Transfers
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Confirm customer bank transfer payments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{pendingTransfers.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by reference, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bookings List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg bg-white p-8 text-center dark:bg-gray-800">
                <Loader2 className="mx-auto mb-2 animate-spin text-orange-600" size={32} />
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center dark:bg-gray-800">
                <Clock className="mx-auto mb-2 text-gray-400" size={48} />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No matching bookings found" : "No pending bank transfers"}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`cursor-pointer rounded-lg bg-white p-4 transition-all dark:bg-gray-800 ${
                    selectedBooking?.id === booking.id
                      ? "shadow-lg ring-2 ring-orange-500"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {booking.booking_reference}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.tour?.title || "Safari Tour"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {formatCurrency(booking.total_price, booking.currency)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User size={14} />
                      {booking.customer_name}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail size={14} />
                      {booking.customer_email}
                    </div>
                    {booking.customer_phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone size={14} />
                        {booking.customer_phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(booking.start_date).toLocaleDateString()} -{" "}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Confirmation Panel */}
          <div className="h-fit lg:sticky lg:top-6">
            {selectedBooking ? (
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Payment
                </h2>

                {/* Booking Summary */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Reference</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBooking.booking_reference}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Amount</div>
                      <div className="font-bold text-orange-600">
                        {formatCurrency(selectedBooking.total_price, selectedBooking.currency)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-600 dark:text-gray-400">Customer</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {selectedBooking.customer_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedBooking.customer_email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Form */}
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Receipt/Transaction Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={confirmationData.receipt_number}
                      onChange={(e) =>
                        setConfirmationData({
                          ...confirmationData,
                          receipt_number: e.target.value,
                        })
                      }
                      placeholder="e.g., BANK-REF-12345"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount Received (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        value={confirmationData.amount_received}
                        onChange={(e) =>
                          setConfirmationData({
                            ...confirmationData,
                            amount_received: e.target.value,
                          })
                        }
                        placeholder={selectedBooking.total_price}
                        className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty if exact booking amount was received
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={confirmationData.notes}
                      onChange={(e) =>
                        setConfirmationData({
                          ...confirmationData,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Any additional notes about this payment..."
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={confirmMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirm Payment
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    disabled={confirmMutation.isPending}
                    className="rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                {/* Warning */}
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Confirming will mark this booking as paid and send a confirmation email to
                    the customer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
                <CreditCard className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a booking to confirm payment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
