"use client";

import { useEffect, useState } from "react";
import { SiteHeaderHome } from "@/components/site-header-home";
import ProtectedRoute from "@/components/protectedRoute";
import { useRouter } from "next/navigation";
import { FaEdit, FaHome, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UserType = {
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  skills?: string[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error();

        setUser({
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
          avatar: data.data.avatar || null,
          skills: ["HTML", "CSS", "JavaScript"], // dummy
        });
      } catch {
        setUser({
          name: "Vivian Raihan",
          email: "user@gmail.com",
          role: "viewer",
          avatar: null,
          skills: ["HTML", "CSS", "React"],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isAdminOrSeller = user.role === "admin" || user.role === "seller";

  const ProfileContent = (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md overflow-hidden relative">
      {/* Cover Gradient */}
      <div className="h-32 bg-gradient-to-r from-pink-500 via-orange-400 to-cyan-400 relative">
        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100">
          <FaEdit className="text-gray-600" />
        </button>
      </div>

      {/* Avatar overlap */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700 border-4 border-white shadow">
          {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : initial}
        </div>
      </div>

      {/* Role badge */}
      <div className="absolute top-[120px] right-6">
        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-xs shadow">{user.role}</span>
      </div>

      {/* Profile Info */}
      <div className="px-6 mt-20 flex flex-col items-center">
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-gray-500">{user.email}</p>

        {/* Skills */}
        {user.skills && (
          <div className="mt-4 mb-3 flex flex-wrap gap-2 justify-center">
            {user.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Buttons → hanya tampil kalau bukan admin/seller */}
      {!isAdminOrSeller && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 border-t mt-6">
          <button onClick={() => router.push("/home")} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition flex flex-col items-center">
            <FaHome className="text-green-600 mb-2" size={20} />
            <span className="font-semibold text-gray-800">Home</span>
          </button>

          <button onClick={() => router.push("/cart")} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition flex flex-col items-center">
            <FaShoppingCart className="text-green-600 mb-2" size={20} />
            <span className="font-semibold text-gray-800">Cart</span>
          </button>

          <button onClick={() => setShowLogoutDialog(true)} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition flex flex-col items-center">
            <FaSignOutAlt className="text-red-600 mb-2" size={20} />
            <span className="font-semibold text-gray-800">Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      {isAdminOrSeller ? (
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" user={user} />
          <SidebarInset className="w-full p-6 flex justify-center items-center bg-gray-50">
            <div className="w-full max-w-2xl">{ProfileContent}</div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <div className="min-h-screen flex flex-col bg-gray-50">
          <SiteHeaderHome />
          <main className="flex-1 flex justify-center items-center px-4 py-10">
            {ProfileContent}
          </main>
        </div>
      )}

      {/* Dialog konfirmasi logout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">Apakah Anda yakin ingin logout?</p>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowLogoutDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
