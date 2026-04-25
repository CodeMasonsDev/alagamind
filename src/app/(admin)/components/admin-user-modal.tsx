"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createUser,
  updateUser,
  type AdminUserDto,
  type CreateAdminDto,
  type UpdateAdminDto,
} from "@/app/(admin)/api/admin";

type AdminUserModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  user: AdminUserDto | null;
  onClose: () => void;
  onSave: (user: AdminUserDto) => void;
};

export default function AdminUserModal({
  isOpen,
  mode,
  user,
  onClose,
  onSave,
}: AdminUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const AVAILABLE_ROLES = [
    { id: 1, name: "Admin", label: "Administrator" },
    { id: 2, name: "User", label: "Client" },
    { id: 3, name: "MHP", label: "Mental Health Professional" },
  ];

  useEffect(() => {
    if (isOpen && mode === "edit" && user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPassword("");
      setIsActive(user.isActive);
      const userRole = user.roles?.[0];
      const roleId = userRole
        ? AVAILABLE_ROLES.find((r) => r.name.toLowerCase() === userRole.toLowerCase())?.id ?? ""
        : "";
      setSelectedRoleId(roleId);
      setError(null);
    } else if (isOpen && mode === "create") {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setIsActive(true);
      setSelectedRoleId("");
      setError(null);
    }
  }, [isOpen, mode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "create") {
        const dto: CreateAdminDto = {
          firstName,
          lastName,
          email,
          password,
          isActive,
          roleId: selectedRoleId || undefined,
        };
        const newUser = await createUser(dto);
        onSave(newUser);
      } else if (mode === "edit" && user) {
        const dto: UpdateAdminDto = {
          id: user.id,
          firstName,
          lastName,
          email,
          isActive,
          roleId: selectedRoleId || undefined,
        };
        const updatedUser = await updateUser(dto);
        onSave(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === "create" ? "Add User" : "Edit User"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg text-slate-500 hover:bg-slate-100 p-1 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <div className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            />
          </div>

          {mode === "create" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            >
              <option value="">-- Select Role --</option>
              {AVAILABLE_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-teal-600 accent-teal-600 dark:border-slate-700 dark:accent-teal-500"
            />
            <label
              htmlFor="isActive"
              className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Active User
            </label>
          </div>

          </div>

          <div className="flex shrink-0 gap-3 border-t border-slate-200 p-6 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create User"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
