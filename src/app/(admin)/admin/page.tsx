"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Plus,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  getAllUsers,
  deleteUser,
  type AdminUserDto,
} from "@/app/(admin)/api/admin";
import AdminUserModal from "@/app/(admin)/components/admin-user-modal";

type TabType = "all" | "clients" | "mhps" | "admins";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (activeTab === "clients") {
      filtered = filtered.filter((u) =>
        u.roles.some((r) => r.toLowerCase() === "user"),
      );
    } else if (activeTab === "mhps") {
      filtered = filtered.filter((u) =>
        u.roles.some((r) => r.toLowerCase() === "mhp"),
      );
    } else if (activeTab === "admins") {
      filtered = filtered.filter((u) =>
        u.roles.some((r) => r.toLowerCase() === "admin"),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [users, activeTab, searchQuery]);

  const handleEdit = (user: AdminUserDto) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setIsDeleting(id);
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSaved = (newUser: AdminUserDto) => {
    if (modalMode === "create") {
      setUsers([newUser, ...users]);
    } else {
      setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)));
    }
    handleModalClose();
  };

  const getRoleBadgeColor = (role: string) => {
    const lower = role.toLowerCase();
    if (lower === "mhp")
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300";
    if (lower === "client")
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    if (lower === "admin")
      return "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300";
  };

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-500/15 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Admin Management
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage all platform users, MHPs, and clients
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-4">
          {[
            { id: "all", label: "All Users" },
            { id: "clients", label: "Clients" },
            { id: "mhps", label: "MHPs" },
            { id: "admins", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-teal-600 text-teal-600 dark:text-teal-400"
                  : "border-b-2 border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {tab.label} (
              {
                users.filter((u) =>
                  tab.id === "all"
                    ? true
                    : tab.id === "clients"
                      ? u.roles.some((r) => r.toLowerCase() === "user")
                      : tab.id === "mhps"
                        ? u.roles.some((r) => r.toLowerCase() === "mhp")
                        : u.roles.some((r) => r.toLowerCase() === "admin"),
                ).length
              }
              )
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 px-6 py-12">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Loading users...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchQuery ? "No users match your search." : "No users found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white text-xs font-bold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeColor(
                            role,
                          )}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${user.isActive ? "bg-teal-600 dark:bg-teal-400" : "bg-rose-600 dark:bg-rose-400"}`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting === user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting === user.id ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AdminUserModal
        isOpen={modalOpen}
        mode={modalMode}
        user={selectedUser}
        onClose={handleModalClose}
        onSave={handleUserSaved}
      />
    </div>
  );
}
