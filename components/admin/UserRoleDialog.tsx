// components/admin/UserRoleDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

export type SimpleUser = {
  id: number;
  name: string;
  role: "admin" | "seller" | "viewer";
};

type Props = {
  user: SimpleUser;
  onUpdated?: () => void; // callback setelah sukses update
  currentUserId?: number; // optional, kalau mau disable perubahan tertentu
};

export function UserRoleDialog({ user, onUpdated, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<SimpleUser["role"]>(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (role === user.role) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      // backend route: PATCH /api/admin/users/{user}/role
      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });

      onUpdated?.();
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to update role:", err);
      // tampilkan pesan sederhana
      setError(err?.message || "Gagal memperbarui role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Ubah Role</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Role — {user.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Pilih role untuk user ini:</p>

          <Select value={role} onValueChange={(val) => setRole(val as SimpleUser["role"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          {currentUserId && currentUserId === user.id && (
            <p className="text-xs text-yellow-700 mt-2">
              Kamu sedang mengubah role akunmu sendiri — berhati-hati.
            </p>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserRoleDialog;
