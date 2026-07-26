"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DocumentVersion {
  version: string;
  changeDescription: string;
  changedBy: { name: string };
  createdAt: string;
}

interface ControlledDocument {
  id: string;
  documentNumber: string;
  title: string;
  currentVersion: string;
  status: string;
  versions: DocumentVersion[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  OBSOLETE: "bg-gray-100 text-gray-600",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ControlledDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // New document form state
  const [docNumber, setDocNumber] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState("DRAFT");
  const [changeDesc, setChangeDesc] = useState("Initial version");
  const [saving, setSaving] = useState(false);

  function loadDocuments() {
    fetch("/api/documents")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load documents");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentNumber: docNumber,
          title,
          currentVersion: version,
          status,
          changeDescription: changeDesc,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }

      setShowForm(false);
      setDocNumber("");
      setTitle("");
      setVersion("1.0");
      setStatus("DRAFT");
      setChangeDesc("Initial version");
      loadDocuments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 text-sm">
              ← Back
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Document Control</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Add new document form */}
        {showForm && (
          <form onSubmit={handleCreate} className="card space-y-3">
            <h2 className="font-semibold">Add Controlled Document</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Number *
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                required
                placeholder="e.g. 4.3.2-P"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Receiving Procedure"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version *
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="OBSOLETE">Obsolete</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Description
              </label>
              <input
                type="text"
                value={changeDesc}
                onChange={(e) => setChangeDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Document"}
            </button>
          </form>
        )}

        {loading && (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && documents.length === 0 && !showForm && (
          <div className="card text-center text-gray-500 py-8">
            No controlled documents yet.
            <br />
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 mt-2"
            >
              Add the first one
            </button>
          </div>
        )}

        <div className="space-y-3">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="card block hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    {doc.documentNumber}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{doc.title}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusColors[doc.status] || "bg-gray-100"
                    }`}
                  >
                    {doc.status.replace("_", " ")}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    v{doc.currentVersion}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
