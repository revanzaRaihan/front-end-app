"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";
import { SiteHeaderHome } from "@/components/site-header-home";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ReportData = {
  total_users: number;
  total_sellers: number;
  total_products: number;
  total_orders: number;
  completed_orders: number;
  revenue: number;
  recent_completed: {
    id: number;
    buyer: string;
    product: { id: number; name: string; price: number };
    total: number;
    status: string;
    created_at: string;
  }[];
};

export default function AdminReportsPage() {
  const { user } = useAuthUser();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ status: boolean; data: ReportData }>("/admin/reports", { method: "GET" });
      if (res.status) {
        setReport(res.data);
      } else {
        setError("Gagal memuat laporan.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchReports();
  }, [user]);

  if (!user) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0, // Hapus desimal
    }).format(value);

  const formatDateTime = (dateStr: string) =>
    new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Generate chart data: Top Products by total sales
  const topProducts = report
    ? Object.values(
        report.recent_completed.reduce<Record<string, { name: string; total: number }>>((acc, order) => {
          const name = order.product.name.trim().toLowerCase(); // normalize
          if (!acc[name]) acc[name] = { name: order.product.name, total: 0 };
          acc[name].total += order.total;
          return acc;
        }, {})
      ).sort((a, b) => b.total - a.total)
    : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeaderHome cartCount={0} />
        <main className="flex-1 p-6 max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

          {loading ? (
            <p>Memuat laporan...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : report ? (
            <>
              {/* Ringkasan Metrik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { label: "Total Users", value: report.total_users },
                  { label: "Total Sellers", value: report.total_sellers },
                  { label: "Total Products", value: report.total_products },
                  { label: "Total Orders", value: report.total_orders },
                  {
                    label: "Completed Orders",
                    value: report.completed_orders,
                    color: "text-green-600",
                  },
                  {
                    label: "Total Revenue",
                    value: report.revenue,
                    color: "text-blue-600",
                    isCurrency: true,
                  },
                ].map((metric, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl shadow hover:shadow-md transition">
                    <p className="text-gray-500 text-sm">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color ? metric.color : ""}`}>{metric.isCurrency ? formatCurrency(metric.value as number) : metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Top Products Chart */}
              <div className="p-4 bg-white rounded-xl shadow">
                <h3 className="font-semibold mb-2">🏆 Top Products by Sales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => formatCurrency(Number(val))} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Orders Table */}
              <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.recent_completed.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.buyer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}
