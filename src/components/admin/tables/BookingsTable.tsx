"use client";

import Link from "next/link";
import { Eye, Calendar, User } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  tour?: {
    title: string;
  };
  start_date: string;
  group_size: number;
  total_price: number;
  currency: "USD" | "KES";
  status: string;
  payment_status: string;
  created_at: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  searchQuery: string; // ✅ Add this
  statusFilter: string; // ✅ Add this
}

export default function BookingsTable({
  bookings,
  isLoading,
  searchQuery,
  statusFilter,
}: BookingsTableProps) {
  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: "warning",
      confirmed: "info",
      completed: "success",
      cancelled: "danger",
    };
    return variants[status] || "default";
  };

  const getPaymentVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: "warning",
      paid: "success",
      failed: "danger",
      refunded: "default",
    };
    return variants[status] || "default";
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 py-12 text-center">
        <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tour
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Payment
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{booking.customer_name}</div>
                  <div className="text-sm text-gray-500">{booking.customer_email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs truncate text-sm text-gray-900">
                  {booking.tour?.title || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {formatDate(booking.start_date)}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(Number(booking.total_price), booking.currency)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getPaymentVariant(booking.payment_status)}>
                  {booking.payment_status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                <Link href={`/admin/bookings/${booking.id}`}>
                  <Button variant="ghost" size="sm" title="View Details">
                    <Eye size={16} />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
