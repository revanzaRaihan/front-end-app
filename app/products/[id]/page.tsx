"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useState, useEffect } from "react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, loading } = useProducts(); // ambil loading dari hook
  const [product, setProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    const p = products.find((prod) => prod.id === Number(id));
    setProduct(p || null);
  }, [id, products]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return <p className="p-6 text-center">Produk tidak ditemukan</p>;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    localStorage.setItem("cart", JSON.stringify([...cart, product]));
    alert(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8">
        {/* Gambar Produk */}
        <div className="md:w-1/2 flex justify-center items-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[400px] object-cover rounded-lg shadow"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Detail Produk */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center md:text-left">{product.name}</h1>
            <p className="text-green-700 font-bold text-2xl mb-4 text-center md:text-left">
              Rp {product.price.toLocaleString()}
            </p>
            <p
              className={`mb-4 font-medium text-center md:text-left ${
                product.stock === 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {product.stock === 0 ? "Out of Stock" : `${product.stock} in stock`}
            </p>

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-300 flex justify-center md:justify-start gap-4">
              {["description", "specs", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 font-medium border-b-2 ${
                    activeTab === tab ? "border-green-600 text-green-600" : "border-transparent text-gray-600"
                  } transition`}
                >
                  {tab === "description" ? "Deskripsi" : tab === "specs" ? "Spesifikasi" : "Review"}
                </button>
              ))}
            </div>

            <div className="text-gray-700 mb-6">
              {activeTab === "description" && (
                <p>{product.description || "Tidak ada deskripsi untuk produk ini."}</p>
              )}
              {activeTab === "specs" && (
                <ul className="list-disc list-inside">
                  <li>Berat: 1kg (contoh)</li>
                  <li>Ukuran: Medium (contoh)</li>
                  <li>Bahan: Plastik / Logam (contoh)</li>
                </ul>
              )}
              {activeTab === "reviews" && (
                <p>Belum ada review untuk produk ini.</p>
              )}
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="flex justify-center md:justify-start gap-4 flex-wrap">
            <button
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 transition"
              onClick={() => router.back()}
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
