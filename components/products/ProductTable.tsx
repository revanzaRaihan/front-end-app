"use client";

import { Button } from "../ui/button";
import { 
    Table,
    TableBody,
    TableCaption,
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";

import { Product } from "@/services/products";

export function ProductTable({
    products, onEdit, onDelete, onDetail,
} : {
    products: Product[];
    onEdit:
    onDelete:
    onDetail:
})