"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  inboundThisMonth: number;
  totalOutboundLbsThisMonth: number;
  byCategory: Record<string, number>;
  byVendor: Record<string, number>;
  totalInboundAllTime: number;
  totalOutboundLbsAllTime: number;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topCategories = data
    ? Object.entries(data.byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">ITRA Tracker</h1>
            <p className="text-xs text-gray-500">R2v3 Throughput</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : data?.inboundThisMonth ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Inbound this month</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900">
              {loading
                ? "—"
                : (data?.totalOutboundLbsThisMonth ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Outbound lbs this month</p>
          </div>
        </div>

        {/* Top categories this month */}
        {topCategories.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Top categories this month
            </h2>
            <div className="space-y-1">
              {topCategories.map(([cat, lbs]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-2">{cat}</span>
                  <span className="font-medium text-gray-900">
                    {lbs.toLocaleString()} lbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main action buttons */}
        <div className="space-y-3">
          <Link href="/inbound/new" className="btn-primary block text-center">
            + New Inbound
          </Link>
          <Link href="/outbound/new" className="btn-primary block text-center">
            + New Outbound
          </Link>
        </div>

        {/* Secondary navigation */}
        <div className="card space-y-1">
          <Link
            href="/inbound"
            className="block px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Inbound History
          </Link>
          <Link
            href="/outbound"
            className="block px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Outbound History
          </Link>
          <Link
            href="/reports"
            className="block px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Reports
          </Link>
          <Link
            href="/documents"
            className="block px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Document Control
          </Link>
        </div>

        {/* All-time quick stats */}
        {!loading && data && (
          <div className="text-center text-xs text-gray-400">
            All-time: {data.totalInboundAllTime} inbound loads ·{" "}
            {data.totalOutboundLbsAllTime.toLocaleString()} lbs outbound
          </div>
        )}
      </main>
    </div>
  );
}
