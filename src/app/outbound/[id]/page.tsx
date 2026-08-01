"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatDate, formatDateTime } from "@/lib/utils";

interface LineItem {
  id: string;
  category: string;
  weightLbs: number;
}

interface OutboundShipment {
  id: string;
  dateShipped: string;
  category: string;
  downstreamVendor: string;
  weightLbs: number | null;
  settlementAmount: number | null;
  note?: string;
  pdfFileName?: string;
  createdBy: { name: string };
  createdAt: string;
  updatedAt: string;
  lineItems: LineItem[];
}

export default function OutboundDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [shipment, setShipment] = useState<OutboundShipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weight, setWeight] = useState("");
  const [settlementAmount, setSettlementAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/outbound/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setShipment(data);
        setWeight(data.weightLbs != null ? String(data.weightLbs) : "");
        setSettlementAmount(data.settlementAmount != null ? String(data.settlementAmount) : "");
        setNote(data.note || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load shipment");
        setLoading(false);
      });
  }, [id]);

  async function handleSaveWeight(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/outbound/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightLbs: weight ? parseFloat(weight) : null,
          settlementAmount: settlementAmount ? parseFloat(settlementAmount) : null,
          note,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setShipment((prev) =>
        prev ? { ...prev, weightLbs: updated.weightLbs, settlementAmount: updated.settlementAmount, note: updated.note } : null
      );
      setMessage("Saved successfully");
    } catch {
      setMessage("Error saving changes");
    } finally {
      setSaving(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/outbound/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage(data.message || "PDF uploaded");
      // Refresh shipment data
      const refreshed = await fetch(`/api/outbound/${id}`).then((r) => r.json());
      setShipment(refreshed);
    } catch (err: any) {
      setMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Shipment not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/outbound" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Outbound Detail</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        {/* Summary card */}
        <div className="card space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date Shipped</span>
            <span className="font-medium">{formatDate(shipment.dateShipped)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Category</span>
            <span className="font-medium text-right">{shipment.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Vendor</span>
            <span className="font-medium">{shipment.downstreamVendor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Entered by</span>
            <span className="text-sm">{shipment.createdBy.name}</span>
          </div>
        </div>

        {/* Weight entry */}
        <form onSubmit={handleSaveWeight} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Weight, Settlement & Notes</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight from buyer PDF"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Settlement Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={settlementAmount}
              onChange={(e) => setSettlementAmount(e.target.value)}
              placeholder="Total $ paid by buyer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              From the settlement PDF. Used to calculate $/lb by buyer.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Weight, Settlement & Notes"}
          </button>
        </form>

        {/* PDF Upload */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Buyer PDF</h2>

          {shipment.pdfFileName ? (
            <div className="space-y-2">
              <p className="text-sm text-green-700">
                PDF uploaded: {shipment.pdfFileName}
              </p>
              <a
                href={"/api/outbound/" + shipment.id + "/pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-block text-center"
              >
                View PDF
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No PDF uploaded yet</p>
          )}

          <div>
            <label className="btn-secondary block text-center cursor-pointer">
              {uploading ? "Uploading..." : "Upload Buyer PDF"}
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Automatic reading of weights from the PDF will be improved in the next
            round. For now, upload the PDF for your records and enter the weight
            manually above.
          </p>
        </div>

        {message && (
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Line items if any */}
        {shipment.lineItems && shipment.lineItems.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Line Items</h2>
            <div className="space-y-2">
              {shipment.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border-b border-gray-100 pb-2"
                >
                  <span>{item.category}</span>
                  <span className="font-medium">
                    {item.weightLbs.toLocaleString()} lbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
