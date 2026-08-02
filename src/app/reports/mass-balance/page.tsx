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
              <p className="text-sm text-gray-500 mb-