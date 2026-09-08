"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { MapPin, DollarSign } from "lucide-react";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { destinationsApi } from "@/lib/api/destinations";
import { RevenueByDestinationChartSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="mb-1 font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">Revenue: ${data.revenue.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Share: {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function RevenueByDestinationChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.destinations.revenue(),
    queryFn: () => destinationsApi.getRevenueBreakdown(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <RevenueByDestinationChartSkeleton />;
  }

  // if (error || !data?.destinations?.length) {
  //   return (
  //     <Card title="Revenue by Destination">
  //       <div className="flex items-center justify-center py-12 text-center">
  //         <div>
  //           <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
  //           <p className="text-gray-500">No destination data available</p>
  //         </div>
  //       </div>
  //     </Card>
  //   );
  // }

  // const { destinations, total_revenue, top_destination } = data;
  if (error || !data?.destinations?.length || !data?.top_destination) {
    return (
      <Card title="Revenue by Destination">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No destination data available</p>
          </div>
        </div>
      </Card>
    );
  }

  const { destinations, total_revenue = 0, top_destination } = data;

  return (
    <Card title="Revenue by Destination" description="Revenue breakdown across destinations">
      {/* Top Destination */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-green-600">
          <MapPin size={20} />
          <span className="text-sm font-medium">Top Destination</span>
        </div>
        <h3 className="mb-1 text-xl font-bold text-gray-900">{top_destination.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>${top_destination.revenue.toLocaleString()}</span>
          <span className="font-medium text-green-600">{top_destination.percentage}% of total</span>
        </div>
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={destinations}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }: any) => `${name}: ${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="revenue"
          >
            {destinations.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with Details */}
      <div className="mt-6 space-y-2">
        {destinations.map((dest: any, index: number) => (
          <div
            key={dest.name}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-gray-900">{dest.name}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${dest.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{dest.percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Revenue */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign size={20} />
            <span className="font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${total_revenue.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}
