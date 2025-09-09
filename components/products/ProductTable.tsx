"use client"


import { Button } from "../ui/button"
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
}: {
   products: Product[];
   onEdit: (product: Product) => void;
   onDelete: (product: Product) => void;
   onDetail: (product: Product) => void;
}) {
 if (products.length === 0) {
   return <p className="text-center text-gray-500">Tidak ada produk tersedia</p>;
 }


 return (
   <Table>
     <TableCaption>List of available products</TableCaption>
     <TableHeader>
       <TableRow>
         <TableHead className="w-[50px]">NO</TableHead>
         <TableHead>Name</TableHead>
         <TableHead className="text-right">Price</TableHead>
         <TableHead className="text-right">Stock</TableHead>
         <TableHead className="text-center">Actions</TableHead>
       </TableRow>
     </TableHeader>
     <TableBody>
       {products.map((product, index) => (
         <TableRow key={product.id}>
           <TableCell>{index + 1}</TableCell>
           <TableCell className="font-medium">{product.name}</TableCell>
           <TableCell className="text-right">{product.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</TableCell>
           <TableCell className={`text-right ${product.stock < 10 ? "text-red-600 font-bold" : ""}`}>{product.stock}</TableCell>
           <TableCell className="text-center space-x-2">
             <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onDetail(product)}>
               Detail
             </Button>
             <Button variant="secondary" onClick={() => onEdit(product)}>
               Edit
             </Button>
             <Button variant="destructive" onClick={() => onDelete(product)}>
               Delete
             </Button>
           </TableCell>
         </TableRow>
       ))}
     </TableBody>
   </Table>
 );
}
  

