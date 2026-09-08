"use client";

import Link from "next/link";
import { Edit, Trash2, MapPin, Eye } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { DestinationsTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

interface Destination {
  id: string;
  title: string;
  slug: string;
  country: string;
  region?: string;
  featured: boolean;
  created_at: string;
  tours_count?: number;
}

interface DestinationsTableProps {
  destinations: Destination[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function DestinationsTable({
  destinations,
  onDelete,
  isLoading,
}: DestinationsTableProps) {
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This action cannot be undone.`)) {
      onDelete?.(id);
    }
  };

  if (isLoading) {
    return <DestinationsTableSkeleton />;
  }

  if (destinations.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 py-12 text-center">
        <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="mb-4 text-gray-500">No destinations found</p>
        <Link href="/admin/destinations/new">
          <Button>Create Your First Destination</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {destinations.map((destination) => (
            <tr key={destination.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{destination.title}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {destination.country}
                {destination.region && `, ${destination.region}`}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {destination.tours_count || 0} tours
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {destination.featured && <Badge variant="warning">Featured</Badge>}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                {formatDate(destination.created_at)}
              </td>
              <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/destinations/${destination.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" title="View">
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Link href={`/admin/destinations/${destination.id}/edit`}>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Edit size={16} />
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(destination.id, destination.title)}
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
