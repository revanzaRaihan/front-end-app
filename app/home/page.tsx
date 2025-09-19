"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SiteHeaderHome } from "@/components/site-header-home";
import ProtectedRoute from "@/components/protectedRoute";
import { FaInfoCircle, FaShoppingCart } from "react-icons/fa";

export default function HomePage() {
  const { products, loading } = useProducts();
  const user = useAuthUser();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
        {/* Header */}
        <SiteHeaderHome />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-[1.618rem]"></div>
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          ) : (
            <div className="space-y-[6.18rem] pb-[6.18rem] overflow-hidden">
              {/* Hero / Banner */}
              <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                  alt="Hero Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 text-center text-white px-6">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-[1.618rem] leading-tight">
                    Premium Collection
                  </h1>
                  <p className="text-lg md:text-xl mb-[2.618rem] max-w-2xl mx-auto leading-relaxed">
                    Experience luxury shopping with curated products designed to enhance your lifestyle.
                  </p>
                  <Link
                    href="/products"
                    className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
                  >
                    Shop Now
                  </Link>
                </div>
              </section>

              {/* All Products */}
              <section className="px-6 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-[2.618rem] text-center tracking-tight">
                  All Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[3rem]">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} formatPrice={formatPrice} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-700 px-6 py-[3rem] mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[2.618rem]">
            <div>
              <h3 className="text-xl font-bold mb-[1.618rem]">About Us</h3>
              <p className="leading-relaxed text-sm">
                We are a premium e-commerce brand dedicated to bringing high-quality products to your doorstep. Our curated collection focuses on style, quality, and sophistication. Every product is selected to enhance your lifestyle and offer the best shopping experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-[1.618rem]">Contact</h3>
              <p className="leading-relaxed text-sm">
                Email: support@premiumshop.com <br />
                Phone: +62 812 3456 7890 <br />
                Address: Jalan Raya Luxury No. 88, Jakarta, Indonesia
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-[1.618rem]">Newsletter</h3>
              <p className="leading-relaxed text-sm mb-[1.618rem]">
                Subscribe to our newsletter to get the latest updates, promotions, and exclusive offers from our premium collection.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-[2.618rem] text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Premium Shop. All rights reserved.
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

function ProductCard({ product, formatPrice }: { product: any; formatPrice: (price: number) => string }) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transition flex flex-col">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={product.image || "https://via.placeholder.com/400"}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-[1.618rem] text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition tracking-tight">
            {product.name}
          </h3>
          <p className="mt-[0.618rem] text-green-700 font-bold text-lg">
            {formatPrice(product.price)}
          </p>
        </div>
        <div className="flex justify-center gap-[1.618rem] mt-[1.618rem]">
          <Link
            href={`/products/${product.id}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-700 transition"
          >
            <FaInfoCircle /> Detail
          </Link>
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
            onClick={() => {
              const cart = JSON.parse(localStorage.getItem("cart") || "[]");
              localStorage.setItem("cart", JSON.stringify([...cart, product]));
              alert(`${product.name} ditambahkan ke keranjang`);
            }}
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
