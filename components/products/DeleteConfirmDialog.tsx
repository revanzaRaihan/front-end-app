"use client"

import { useState } from "react"
import { Product } from "@/services/products"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeleteConfirm({
  open,
  onOpenChange,
  product,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: () => Promise<void> | void // biar bisa async
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      await onConfirm()
      onOpenChange(false) // tutup modal setelah sukses
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogDescription>
            Apakah anda yakin ingin menghapus produk{" "}
            <span className="font-bold">{product?.name}</span>?<br />
            Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </div>
            ) : (
              "Hapus"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
