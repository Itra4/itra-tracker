"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface InboundLoad {
  id: string;
  date: string;
  clientSource: string;
  approximateSize: string;
  notes?: string;
  createdBy: { name: string };
  createdAt: string;
}

export default function InboundHistoryPage() {
  const [loads, setLoads] = useState<InboundLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/inbound")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setLoads(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load inbound history");
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
            <h1 className="text-lg font-bold text-gray-900">Inbound History</h1>
          </div>
          <Link
            href="/inbound/new"
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

        {!loading && !error && loads.length === 0 && (
          <div className="card text-center text-gray-500 py-8">
            No inbound loads recorded yet.
          </div>
        )}

        <div className="space-y-3">
          {loads.map((load) => (
            <div key={load.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    {load.clientSource}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {load.approximateSize}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(load.date)}
                </p>
              </div>
              {load.notes && (
                <p className="text-sm text-gray-500 mt-2">{load.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Entered by {load.createdBy.name}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
