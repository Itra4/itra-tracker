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

export default function ReportsPage() {
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

  const sortedCategories = data
    ? Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])
    : [];

  const sortedVendors = data
    ? Object.entries(data.byVendor).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Reports</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {!loading && data && (
          <>
            {/* This month summary */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">This Month</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{data.inboundThisMonth}</p>
                  <p className="text-xs text-gray-500">Inbound loads</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {data.totalOutboundLbsThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Outbound lbs</p>
                </div>
              </div>
            </div>

            {/* By Category */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Outbound by Category (this month)
              </h2>
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-gray-500">No outbound weight recorded yet this month.</p>
              ) : (
                <div className="space-y-2">
                  {sortedCategories.map(([cat, lbs]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-700 pr-2">{cat}</span>
                      <span className="font-medium whitespace-nowrap">
                        {lbs.toLocaleString()} lbs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By Vendor */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Outbound by Vendor (this month)
              </h2>
              {sortedVendors.length === 0 ? (
                <p className="text-sm text-gray-500">No outbound weight recorded yet this month.</p>
              ) : (
                <div className="space-y-2">
                  {sortedVendors.map(([vendor, lbs]) => (
                    <div key={vendor} className="flex justify-between text-sm">
                      <span className="text-gray-700 pr-2">{vendor}</span>
                      <span className="font-medium whitespace-nowrap">
                        {lbs.toLocaleString()} lbs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All-time */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">All-Time Totals</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{data.totalInboundAllTime}</p>
                  <p className="text-xs text-gray-500">Inbound loads</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {data.totalOutboundLbsAllTime.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Outbound lbs</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
