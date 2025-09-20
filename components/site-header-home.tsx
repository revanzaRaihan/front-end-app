"use client";

import { FaShoppingCart, FaUser } from "react-icons/fa";
import Link from "next/link";

export function SiteHeaderHome({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="flex h-[80px] shrink-0 items-center border-b border-gray-200 bg-green-50 shadow-sm">
      <div className="flex w-full items-center justify-between px-6 lg:px-10">
        {/* Logo / Title */}
        <Link
          href="/"
          className="text-2xl font-bold text-green-700 hover:text-green-900 tracking-wide"
        >
          UDOO-시장
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-8 text-green-700">
          {/* Cart with badge */}
          <Link href="/cart" className="relative hover:text-green-900">
            <FaShoppingCart size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link href="/profile" className="hover:text-green-900">
            <FaUser size={26} />
          </Link>
        </div>
      </div>
    </header>
  );
}
