"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react"; // ✅ Add Users icon
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { bookingsApi } from "@/lib/api/bookings";
import { RevenueChartSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

// ============================================
// CUSTOM TOOLTIP
// ============================================
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
            {entry.name}:{" "}
            {entry.dataKey === "revenue" ||
            entry.dataKey === "avg_price_per_person" ||
            entry.dataKey === "target"
              ? `$${entry.value.toLocaleString()}`
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// REVENUE CHART COMPONENT
// ============================================
export default function RevenueChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.revenue(),
    queryFn: () => bookingsApi.getRevenueStats(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return <RevenueChartSkeleton />;
  }

  if (error) {
    return (
      <Card title="Revenue Overview">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <p className="mb-2 text-red-600">Failed to load revenue data</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data || !data.monthly_data || data.monthly_data.length === 0) {
    return (
      <Card title="Revenue Overview">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No revenue data available yet</p>
            <p className="mt-1 text-sm text-gray-400">Data will appear once you have bookings</p>
          </div>
        </div>
      </Card>
    );
  }

  const {
    monthly_data,
    total_revenue,
    average_monthly_revenue,
    growth_percentage,
    total_guests, // ✅ NEW
    avg_price_per_person, // ✅ NEW
  } = data;

  return (
    <Card title="Revenue Trends" description="Monthly revenue performance over time">
      {/* ✅ UPDATED: Summary Stats - Now 4 columns */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <DollarSign size={16} />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${total_revenue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="mb-1 flex items-center gap-2 text-green-600 dark:text-green-400">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Avg. Monthly</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(average_monthly_revenue).toLocaleString()}
          </p>
        </div>

        {/* ✅ NEW: Total Guests */}
        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="mb-1 flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Users size={16} />
            <span className="text-sm font-medium">Total Guests</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {total_guests?.toLocaleString() || 0}
          </p>
        </div>

        {/* ✅ NEW: Avg Price Per Person */}
        <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="mb-1 flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <DollarSign size={16} />
            <span className="text-sm font-medium">Avg Price/Person</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(avg_price_per_person || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ✅ NEW: Additional calculated metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Growth Rate
          </span>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {growth_percentage > 0 ? "+" : ""}
            {growth_percentage.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/20">
          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Revenue Per Guest
          </span>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${total_guests ? Math.round(total_revenue / total_guests).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* ✅ UPDATED: Line Chart with multiple lines */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={monthly_data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

          {/* Revenue Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />

          {/* ✅ NEW: Avg Price Per Person Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avg_price_per_person"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 3 }}
            name="Avg Price/Person"
          />

          {/* ✅ NEW: Total Guests Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_guests"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: "#8b5cf6", r: 3 }}
            name="Guests"
          />

          {/* Target Line (if exists) */}
          {monthly_data[0]?.target && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#10b981", r: 3 }}
              name="Target"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
