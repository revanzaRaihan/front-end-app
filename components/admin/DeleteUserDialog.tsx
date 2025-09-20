// components/admin/DeleteUserDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export type SimpleUserShort = { id: number; name: string };

type Props = {
  user: SimpleUserShort;
  onDeleted?: () => void;
  currentUserId?: number; // untuk mencegah hapus diri sendiri di UI
};

export function DeleteUserDialog({ user, onDeleted, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async () => {
    setError(null);
    if (currentUserId && currentUserId === user.id) {
      setError("Tidak bisa menghapus akun sendiri.");
      return;
    }

    if (!confirm(`Yakin ingin menghapus user "${user.name}"?`)) return;

    setLoading(true);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      onDeleted?.();
      setOpen(false);
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      // jika backend return 403 atau pesan lain, tampilkan
      setError(err?.message || "Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Hapus</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus User</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p>Apakah kamu yakin ingin menghapus user <b>{user.name}</b>?</p>

          {currentUserId && currentUserId === user.id && (
            <p className="text-sm text-yellow-700 mt-2">Kamu tidak dapat menghapus akun sendiri.</p>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
            <Button variant="destructive" onClick={deleteUser} disabled={loading || (currentUserId === user.id)}>
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteUserDialog;
