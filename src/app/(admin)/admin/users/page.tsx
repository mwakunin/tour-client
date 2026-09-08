// src/app/(admin)/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, User as UserIcon, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { usersApi, type UserUpdate } from "@/lib/api/users";
import { queryKeys } from "@/lib/api/queryKeys";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import EditUserDialog, { type EditableUser } from "@/components/admin/users/EditUserDialog";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { UsersTable } from "@/components/admin/tables/UsersTable";
import { useAuth } from "@/contexts/AuthContext";
import { UsersTableSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch users (only if authenticated)
  const { data: usersData, isLoading } = useQuery({
    queryKey: queryKeys.users.list({
      search: debouncedSearch,
      role: selectedRole,
      page: currentPage,
    }),
    queryFn: () =>
      usersApi.getAll({
        search: debouncedSearch,
        role: selectedRole === "all" ? undefined : selectedRole,
        // One row beyond the page: its presence is what tells us another page
        // exists. It is sliced off before rendering.
        limit: ITEMS_PER_PAGE + 1,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }),
    enabled: !!user,
  });

  // Fetch stats (only if authenticated)
  const { data: stats } = useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: usersApi.getStats,
    enabled: !!user,
  });

  const refreshUsers = () => {
    // The root covers the list and the stats tiles in one call.
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      refreshUsers();
      toast.success("User deleted");
    },
    onError: (error) => {
      toast.error("Could not delete user", { description: getApiErrorMessage(error) });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "user" }) =>
      usersApi.changeRole(id, role),
    onSuccess: (_data, variables) => {
      refreshUsers();
      toast.success(`Role changed to ${variables.role}`);
    },
    onError: (error) => {
      toast.error("Could not change role", { description: getApiErrorMessage(error) });
    },
  });

  // Edit mutation — name/email for anyone, role for admins (API enforces both)
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UserUpdate }) =>
      usersApi.update(id, updates),
    onSuccess: () => {
      refreshUsers();
      setEditingUser(null);
      toast.success("User updated");
    },
    onError: (error) => {
      toast.error("Could not update user", { description: getApiErrorMessage(error) });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleRole = (id: string, currentRole: string) => {
    // The row's button is disabled for your own account; this covers a stale
    // render, and keeps the rule identical to the edit dialog's.
    if (id === user?.id) {
      toast.error("You cannot change your own role — ask another admin.");
      return;
    }

    const newRole = currentRole === "admin" ? "user" : "admin";
    if (window.confirm(`Change ${newRole === "admin" ? "to Admin" : "to User"}?`)) {
      changeRoleMutation.mutate({ id, role: newRole as "admin" | "user" });
    }
  };

  if (authLoading) {
    return <UsersTableSkeleton />;
  }

  const fetched = usersData?.users || [];
  const users = fetched.slice(0, ITEMS_PER_PAGE);
  // /users/stats answers { success, message, data: { total, admins, regular } } —
  // reading stats.total straight off the envelope silently yielded undefined,
  // which collapsed the page count to 1 and hid every user past the tenth.
  const userStats = stats?.data;
  const totalUsers: number = userStats?.total ?? users.length;
  const isFiltered = debouncedSearch.trim() !== "" || selectedRole !== "all";
  // A filtered list has no total to divide by, so the probe row answers instead
  // of assuming a full page means another one follows.
  const totalPages = isFiltered ? null : Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE));
  const hasNextPage =
    totalPages === null ? fetched.length > ITEMS_PER_PAGE : currentPage < totalPages;
  const isSearching = searchQuery !== debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage all registered users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <UserIcon className="text-white" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {userStats?.admins ?? users.filter((u: any) => u.role === "admin").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Shield className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Regular Users</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {userStats?.regular ?? users.filter((u: any) => u.role === "user").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <UserIcon className="text-green-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <Loading size="sm" />
              </div>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="focus:ring-primary rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </Card>
      {/* ✅ Table Section - Show skeleton ONLY for table */}
      {isLoading ? (
        <UsersTableSkeleton />
      ) : (
        <>
          {/* Users Table */}
          <UsersTable
            users={users}
            isLoading={isLoading}
            currentUserId={user?.id}
            onEdit={setEditingUser}
            onDelete={handleDelete}
            onToggleRole={handleToggleRole}
            isDeleting={deleteMutation.isPending}
            isTogglingRole={changeRoleMutation.isPending}
          />

          {/* Pagination */}
          {(currentPage > 1 || hasNextPage) && (
            <Card className="flex items-center justify-between p-4">
              <div className="text-sm text-gray-600">
                Page {currentPage}
                {totalPages !== null ? ` of ${totalPages}` : ""} ({users.length} users shown)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>
            </Card>
          )}

          <EditUserDialog
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={(id, updates) => updateMutation.mutate({ id, updates })}
            isSaving={updateMutation.isPending}
            currentUserId={user?.id}
          />
        </>
      )}
    </div>
  );
}
