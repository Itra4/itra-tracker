"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface OutboundShipment {
  id: string;
  dateShipped: string;
  category: string;
  downstreamVendor: string;
  weightLbs: number | null;
  note?: string;
  createdBy: { name: string };
  createdAt: string;
}

export default function OutboundHistoryPage() {
  const [shipments, setShipments] = useState<OutboundShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/outbound")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setShipments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load outbound history");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 text-sm">
              ← Back
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Outbound History</h1>
          </div>
          <Link
            href="/outbound/new"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg"
          >
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4">
        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && shipments.length === 0 && (
          <div className="card text-center text-gray-500 py-8">
            No outbound shipments recorded yet.
          </div>
        )}

        <div className="space-y-3">
          {shipments.map((ship) => (
            <Link
              key={ship.id}
              href={`/outbound/${ship.id}`}
              className="card block hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{ship.category}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    → {ship.downstreamVendor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(ship.dateShipped)}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {ship.weightLbs != null
                      ? `${ship.weightLbs.toLocaleString()} lbs`
                      : "Weight pending"}
                  </p>
                </div>
              </div>
              {ship.note && (
                <p className="text-sm text-gray-500 mt-2">{ship.note}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Entered by {ship.createdBy.name} · Tap to add weight / PDF
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
