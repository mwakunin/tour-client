"use client";

import { User, Mail, Calendar, Shield, Trash2, Lock, Unlock, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { UsersTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

interface TableUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  // The API serialises better-auth's column as camelCase
  createdAt: string;
}

interface UsersTableProps {
  users: TableUser[];
  isLoading?: boolean;
  /** The signed-in admin — their own role toggle is locked off */
  currentUserId?: string;
  onEdit?: (user: TableUser) => void;
  onDelete?: (id: string, name: string) => void;
  onToggleRole?: (id: string, currentRole: string) => void;
  isDeleting?: boolean;
  isTogglingRole?: boolean;
}

export function UsersTable({
  users,
  isLoading,
  currentUserId,
  onEdit,
  onDelete,
  onToggleRole,
  isDeleting,
  isTogglingRole,
}: UsersTableProps) {
  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  if (users.length === 0) {
    return (
      <Card>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No users found</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Registered users will appear here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="from-primary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-purple-600 font-semibold text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || "Unknown User"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={16} className="mr-2" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.role === "admin" ? "primary" : "secondary"}>
                    {user.role === "admin" ? (
                      <Shield size={14} className="mr-1" />
                    ) : (
                      <User size={14} className="mr-1" />
                    )}
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit?.(user)}
                      title="Edit user"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onToggleRole?.(user.id, user.role)}
                      disabled={isTogglingRole || user.id === currentUserId}
                      title={
                        user.id === currentUserId
                          ? "You cannot change your own role"
                          : user.role === "admin"
                            ? "Make User"
                            : "Make Admin"
                      }
                    >
                      {user.role === "admin" ? <Unlock size={16} /> : <Lock size={16} />}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete?.(user.id, user.name)}
                      disabled={isDeleting}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
