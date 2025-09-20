"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiFetch } from "@/lib/api";

import { Search, Filter, RotateCcw } from "lucide-react";

import UserRoleDialog from "@/components/admin/UserRoleDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UserType = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "seller" | "viewer";
};

export default function ManageUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const result = await res.json();
        setUser(result.data);
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setIsChecking(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };
    fetchUser();
  }, [router]);

  const fetchUsers = async () => {
    if (!user) return;
    setLoadingUsers(true);

    try {
      const res = await apiFetch<{ status: boolean; message: string; data: UserType[] }>(
        "/admin/users",
        { method: "GET" }
      );

      if (res.status && res.data) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter((u) => u.role === "admin").length;
    const seller = users.filter((u) => u.role === "seller").length;
    const viewer = users.filter((u) => u.role === "viewer").length;

    return { total, admin, seller, viewer };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === "all" || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 🚫 Kalau bukan admin → tampilkan dialog akses ditolak
  if (user.role !== "admin") {
    return (
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
          </DialogHeader>

          {user.role === "seller" && (
            <>
              <p>Halaman ini khusus <b>Admin</b>. Anda masuk sebagai <b>Seller</b>.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                  Ke Dashboard
                </Button>
                <Button variant="destructive" onClick={() => router.push("/login")}>
                  Ke Login
                </Button>
              </div>
            </>
          )}

          {user.role === "viewer" && (
            <>
              <p>Halaman ini khusus <b>Admin</b>. Anda masuk sebagai <b>Viewer</b>.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => router.push("/home")}>
                  Ke Home
                </Button>
                <Button variant="destructive" onClick={() => router.push("/login")}>
                  Ke Login
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // ✅ Kalau admin → render halaman
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset className="w-full p-6">
        <div
          className={`relative w-full flex flex-col gap-6 transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
            <p className="text-gray-500">Kelola akun, role, dan akses pengguna</p>
          </div>

          {/* Statistik + Search + Filter */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <h3 className="text-xl font-bold">{stats.total}</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-sm">Admin</p>
                <h3 className="text-xl font-bold text-blue-600">{stats.admin}</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-sm">Seller</p>
                <h3 className="text-xl font-bold text-green-600">{stats.seller}</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-sm">Viewer</p>
                <h3 className="text-xl font-bold text-yellow-600">{stats.viewer}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-32 md:w-48 pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Semua</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                onClick={resetFilters}
                className="p-2 rounded-lg border hover:bg-gray-100"
                title="Reset filter"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabel Users */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse">
              <thead className="bg-green-50">
                <tr>
                  <th className="w-12 p-3 border-b">#</th>
                  <th className="w-48 p-3 border-b">Nama</th>
                  <th className="w-64 p-3 border-b">Email</th>
                  <th className="w-32 p-3 border-b">Role</th>
                  <th className="w-32 p-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      Tidak ada user ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-green-50 transition">
                      <td className="p-3 border-b">{idx + 1}</td>
                      <td className="p-3 border-b whitespace-normal break-words">{u.name}</td>
                      <td className="p-3 border-b whitespace-normal break-words">{u.email}</td>
                      <td className="p-3 border-b font-medium capitalize">{u.role}</td>
                      <td className="p-3 border-b text-center">
                        <div className="flex justify-center gap-2">
                          <UserRoleDialog
                            user={{ id: u.id, name: u.name, role: u.role }}
                            onUpdated={fetchUsers}
                            currentUserId={user?.id}
                          />
                          <DeleteUserDialog
                            user={{ id: u.id, name: u.name }}
                            onDeleted={fetchUsers}
                            currentUserId={user?.id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
