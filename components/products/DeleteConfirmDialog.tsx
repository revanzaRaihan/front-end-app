"use client"

import { getProducts, Product } from "@/services/products"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DeleteConfirm({
    open,
    onOpenChange,
    product,
    onConfirm
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onConfirm: () => void
}) {
    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    <DialogDescription>
                        Apakah anda yakin ingin menghapus data produk <span className="font-bold">{product?.name}</span> tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant={"outline"} onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button variant={"destructive"} onClick={onConfirm}>
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}