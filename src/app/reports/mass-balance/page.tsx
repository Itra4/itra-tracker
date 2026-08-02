"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MassBalanceData {
  range: string;
  totalInboundLbs: number;
  totalOutboundLbs: number;
  variance: number;
  inboundLoadCount: number;
  outboundShipmentCount: number;
  byCategory: Record<string, number>;
}

export default function MassBalancePage() {
  const [data, setData] = useState<MassBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("this-month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/mass-balance?range=${range}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const sortedCategories = data
    ? Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/reports" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Mass Balance</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
          </select>
        </div>

        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {!loading && data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {data.totalInboundLbs.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Inbound lbs</p>
                <p className="text-xs text-gray-400">
                  {data.inboundLoadCount} load
                  {data.inboundLoadCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-700">
                  {data.
cat > src/app/reports/mass-balance/page.tsx << 'ENDOFFILE'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MassBalanceData {
  range: string;
  totalInboundLbs: number;
  totalOutboundLbs: number;
  variance: number;
  inboundLoadCount: number;
  outboundShipmentCount: number;
  byCategory: Record<string, number>;
}

export default function MassBalancePage() {
  const [data, setData] = useState<MassBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("this-month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/mass-balance?range=${range}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const sortedCategories = data
    ? Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/reports" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Mass Balance</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
          </select>
        </div>

        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {!loading && data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {data.totalInboundLbs.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Inbound lbs</p>
                <p className="text-xs text-gray-400">
                  {data.inboundLoadCount} load
                  {data.inboundLoadCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-700">
                  {data.totalOutboundLbs.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Outbound lbs</p>
                <p className="text-xs text-gray-400">
                  {data.outboundShipmentCount} shipment
                  {data.outboundShipmentCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="card text-center">
              <p className="text-sm text-gray-500 mb-1">
                Variance (Inbound − Outbound)
              </p>
              <p
                className={`text-3xl font-bold ${
                  data.variance >= 0 ? "text-gray-900" : "text-red-600"
                }`}
              >
                {data.variance >= 0 ? "+" : ""}
                {data.variance.toLocaleString()} lbs
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Positive = material still on hand or not yet shipped
              </p>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Outbound by Category
              </h2>
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No outbound weight recorded in this period.
                </p>
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

            <p className="text-xs text-gray-400 text-center px-4">
              Note: Inbound weight is currently captured as total load weight.
              Category-level inbound tracking can be added later if needed.
            </p>
          </>
        )}
      </main>
    </div>
git add src/app/reports/mass-balance/page.tsx
git commit -m "Fix corrupted Mass Balance page"
git push  );
cat > src/app/reports/mass-balance/page.tsx << 'ENDOFFILE'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MassBalanceData {
  range: string;
  totalInboundLbs: number;
  totalOutboundLbs: number;
  variance: number;
  inboundLoadCount: number;
  outboundShipmentCount: number;
  byCategory: Record<string, number>;
}

export default function MassBalancePage() {
  const [data, setData] = useState<MassBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("this-month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/mass-balance?range=${range}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const sortedCategories = data
    ? Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/reports" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Mass Balance</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
          </select>
        </div>

        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {!loading && data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {data.totalInboundLbs.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Inbound lbs</p>
                <p className="text-xs text-gray-400">
                  {data.inboundLoadCount} load
                  {data.inboundLoadCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-700">
                  {data.totalOutboundLbs.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Outbound lbs</p>
                <p className="text-xs text-gray-400">
                  {data.outboundShipmentCount} shipment
                  {data.outboundShipmentCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="card text-center">
              <p className="text-sm text-gray-500 mb-1">
                Variance (Inbound − Outbound)
              </p>
              <p
                className={`text-3xl font-bold ${
                  data.variance >= 0 ? "text-gray-900" : "text-red-600"
                }`}
              >
                {data.variance >= 0 ? "+" : ""}
                {data.variance.toLocaleString()} lbs
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Positive = material still on hand or not yet shipped
              </p>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Outbound by Category
              </h2>
              {sortedCategories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No outbound weight recorded in this period.
                </p>
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

            <p className="text-xs text-gray-400 text-center px-4">
              Note: Inbound weight is currently captured as total load weight.
              Category-level inbound tracking can be added later if needed.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
ENDOFFILE}
