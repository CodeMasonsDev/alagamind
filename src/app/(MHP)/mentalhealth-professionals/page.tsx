"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getMe } from "@/api/auth/auth";
import {
  deleteClient,
  getMHPById,
  getClientsByMHP,
  getSessionsByMHP,
  type ClientData,
  type MHPData,
  type MHPSessionListItem,
} from "../api/mhp";
import { StatCard } from "../components/stat-card";
import { EmptyState } from "../components/empty-state";
import { ClientCard } from "../components/client-card";

function normalizeSeekRequests(rows: ClientData[]): ClientData[] {
  const getIsApproved = (row: ClientData) =>
    ((row as unknown as { isApproved?: boolean }).isApproved ??
      (row as unknown as { IsApproved?: boolean }).IsApproved) ??
    false;

  const asNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  // Only keep pending (not yet approved) requests.
  const pending = rows.filter((row) => !getIsApproved(row));

  // De-dupe pending requests by userId, picking the newest by numeric id.
  const byUserId = new Map<string, ClientData>();
  for (const row of pending) {
    const existing = byUserId.get(row.userId);
    if (!existing) {
      byUserId.set(row.userId, row);
      continue;
    }
    if (asNumber(row.id) > asNumber(existing.id)) {
      byUserId.set(row.userId, row);
    }
  }

  return Array.from(byUserId.values()).sort(
    (a, b) => asNumber(b.id) - asNumber(a.id),
  );
}

export default function MHPClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<ClientData[]>([]);
  const [approvedSessions, setApprovedSessions] = useState<MHPSessionListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const mhpUser = await getMe();
        console.log("🔍 Current MHP user:", mhpUser);

        if (mhpUser?.id) {
          const mhpProfile = await getMHPById(mhpUser.id).catch((error) => {
            console.error("Failed to load MHP profile:", error);
            return null as MHPData | null;
          });

          const effectiveMhpId = mhpProfile?.mhpId || mhpUser.id;
          const realClients = await getClientsByMHP(effectiveMhpId);
          // Keep stats consistent with Session Registry, which calls `getSessionsByMHP(mhp.id)`.
          let sessions = await getSessionsByMHP(mhpUser.id).catch((error) => {
            console.error("Failed to load approved sessions:", error);
            return [];
          });
          if (sessions.length === 0 && effectiveMhpId !== mhpUser.id) {
            sessions = await getSessionsByMHP(effectiveMhpId).catch((error) => {
              console.error("Failed to load approved sessions (fallback):", error);
              return [];
            });
          }
          setApprovedSessions(sessions);
          console.log("📋 Clients fetched from API:", realClients);

          if (realClients.length > 0) {
            console.log("✅ Clients loaded:", realClients);
            setClients(normalizeSeekRequests(realClients));
          } else {
            console.log("ℹ️ No clients found");
            setClients([]);
          }
        }
      } catch (error) {
        console.error("❌ Failed to load clients:", error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    setIsDeleting(id);
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      console.log("✅ Client deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete client:", error);
      alert("Failed to delete client. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        search.trim() === "" ||
        client.email.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [clients, search]);

  const stats = useMemo(
    () => ({
      // `clients` is already normalized to only unapproved, de-duped pending requests.
      pending: clients.length,
    }),
    [clients],
  );

  const approvedStats = useMemo(() => {
    const uniqueClients = new Set(approvedSessions.map((s) => s.userId));

    return {
      approvedSessions: approvedSessions.length,
      allClients: uniqueClients.size,
    };
  }, [approvedSessions]);

  return (
    <div className="min-h-full bg-transparent p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
            MHP Portal
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pending Requests
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400">
            Review new client requests and approve to add them to your active
            sessions.
          </p>
        </motion.div>

        {/* Stats Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              label="Pending Requests"
              value={stats.pending}
              icon={AlertCircle}
              color="amber"
              delay={0}
            />
            <StatCard
              label="Approved Sessions"
              value={approvedStats.approvedSessions}
              icon={CheckCircle}
              color="teal"
              delay={1}
            />
            <StatCard
              label="All Clients"
              value={approvedStats.allClients}
              icon={Users}
              color="violet"
              delay={2}
            />
          </motion.div>
        )}

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
        </motion.div>

        {/* Client List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600 dark:border-teal-900 dark:border-t-teal-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Loading your clients...
            </p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <EmptyState searchActive={search.trim() !== ""} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-3"
          >
            {filtered.map((client, index) => {
              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  status="New Request"
                  onDelete={handleDelete}
                  isDeleting={isDeleting === client.id}
                  delay={index}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
