"use client"

import React from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Product, ProductPayload } from "@/services/products"

export function ProductForm({
    form, setForm, errors, isSubmitting, onSubmit
}:{
    form: ProductPayload;
    setForm: (form: ProductPayload) => void;
    errors: Record<string, string>;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Nama Product</Label>
                <Input id="name" value={form?.name} onChange={(e) => setForm({...form, name: e.target.value})}>
                </Input>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
                <Label htmlFor="description">Deskripsi Product</Label>
                <Input id="description" value={form?.description} onChange={(e) => setForm({...form, description: e.target.value})}>
                </Input>
            </div>
            <div>
                <Label htmlFor="price">Harga Product</Label>
                <Input id="price" value={form?.price === 0 ? "" : form.price} onChange={(e) => setForm({...form, price: Number(e.target.value) || 0})}>
                </Input>
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>
            <div>
                <Label htmlFor="stock">Stock Product</Label>
                <Input id="stock" value={form?.stock === 0 ? "" : form.stock} onChange={(e) => setForm({...form, stock: Number(e.target.value) || 0})}>
                </Input>
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
        </form>
    )
}