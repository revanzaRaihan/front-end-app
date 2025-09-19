"use client";

import { FaShoppingCart, FaHeart, FaBell, FaUser } from "react-icons/fa";
import Link from "next/link";

export function SiteHeaderHome() {
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center border-b border-gray-200 bg-green-50">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        {/* Logo / Title */}
        <h1 className="text-lg font-semibold text-green-700">E-Commerce</h1>

        {/* Right side actions */}
        <div className="flex items-center gap-4 text-green-700">
          <Link href="/cart" className="hover:text-green-900">
            <FaShoppingCart size={18} />
          </Link>
          <Link href="/wishlist" className="hover:text-green-900">
            <FaHeart size={18} />
          </Link>
          <Link href="/notifications" className="hover:text-green-900">
            <FaBell size={18} />
          </Link>
          <Link href="/profile" className="hover:text-green-900">
            <FaUser size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
