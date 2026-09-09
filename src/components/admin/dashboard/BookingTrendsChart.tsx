// ============================================
// 1. BOOKINGS TRENDS CHART
// components/admin/dashboard/BookingTrendsChart.tsx
// ============================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users } from "lucide-react";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { bookingsApi } from "@/lib/api/bookings";
import { BookingTrendsChartSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="mb-2 font-semibold text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BookingTrendsChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.trends(),
    queryFn: () => bookingsApi.getBookingTrends(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <BookingTrendsChartSkeleton />;
  }

  if (error || !data?.monthly_data?.length) {
    return (
      <Card title="Booking Trends">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No booking data available</p>
          </div>
        </div>
      </Card>
    );
  }

  // const { monthly_data, total_bookings, avg_per_month, trend } = data;
  const { monthly_data, total_bookings = 0, avg_per_month = 0, trend = 0 } = data;

  return (
    <Card title="Booking Trends" description="Monthly booking performance">
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-blue-600">
            <Users size={16} />
            <span className="text-sm font-medium">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{total_bookings}</p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Monthly Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avg_per_month}</p>
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-purple-600">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Trend</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {trend > 0 ? "+" : ""}
            {trend}%
          </p>
        </div>
      </div>

      {/* Area Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthly_data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={{ stroke: "#d1d5db" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Area
            type="monotone"
            dataKey="current_year"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
            name="This Year"
          />
          {monthly_data[0]?.prev_year !== undefined && (
            <Area
              type="monotone"
              dataKey="prev_year"
              stroke="#9ca3af"
              fill="#9ca3af"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Last Year"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
