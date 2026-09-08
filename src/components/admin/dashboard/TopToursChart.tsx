"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Award, TrendingUp } from "lucide-react";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { toursApi } from "@/lib/api/tours";
import { TopToursChartSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function TopToursChart() {
  const [metric, setMetric] = useState<"bookings" | "revenue">("bookings");

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.tours.top(metric),
    queryFn: () => toursApi.getTopPerforming(metric),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <TopToursChartSkeleton />;
  }

  // if (error || !data?.tours?.length) {
  //   return (
  //     <Card title="Top Performing Tours">
  //       <div className="flex items-center justify-center py-12 text-center">
  //         <div>
  //           <Award size={48} className="mx-auto mb-4 text-gray-400" />
  //           <p className="text-gray-500">No tour data available</p>
  //         </div>
  //       </div>
  //     </Card>
  //   );
  // }

  // const { tours, top_tour } = data;
  if (error || !data?.tours?.length || !data?.top_tour) {
    return (
      <Card title="Top Performing Tours">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <Award size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No tour data available</p>
          </div>
        </div>
      </Card>
    );
  }
  const { tours, top_tour } = data;

  return (
    <Card title="Top Performing Tours" description="Most popular tours by bookings or revenue">
      {/* Top Tour Highlight */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-blue-600">
          <Award size={20} />
          <span className="text-sm font-medium">Top Performer</span>
        </div>
        <h3 className="mb-1 text-xl font-bold text-gray-900">{top_tour.title}</h3>
        <p className="text-sm text-gray-600">
          {metric === "bookings"
            ? `${top_tour.value} bookings`
            : `$${top_tour.value.toLocaleString()} revenue`}
        </p>
      </div>

      {/* Metric Toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMetric("bookings")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            metric === "bookings"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          By Bookings
        </button>
        <button
          onClick={() => setMetric("revenue")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            metric === "revenue"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          By Revenue
        </button>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={tours} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickFormatter={(value) =>
              metric === "revenue" ? `$${(value / 1000).toFixed(0)}k` : value
            }
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            width={150}
          />
          <Tooltip
            formatter={(value) =>
              metric === "revenue" ? `$${Number(value).toLocaleString()}` : `${value} bookings`
            }
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {tours.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
