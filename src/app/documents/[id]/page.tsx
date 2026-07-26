"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface DocumentVersion {
  id: string;
  version: string;
  changeDescription: string;
  changedBy: { name: string };
  approvedBy: string | null;
  fileName: string | null;
  createdAt: string;
}

interface ControlledDocument {
  id: string;
  documentNumber: string;
  title: string;
  currentVersion: string;
  status: string;
  currentFileName: string | null;
  versions: DocumentVersion[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  OBSOLETE: "bg-gray-100 text-gray-600",
};

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [doc, setDoc] = useState<ControlledDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);

  // Update form
  const [newVersion, setNewVersion] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [changeDesc, setChangeDesc] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function loadDoc() {
    fetch(`/api/documents/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setDoc(data);
        setNewVersion(data.currentVersion);
        setNewStatus(data.status);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load document");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadDoc();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("currentVersion", newVersion);
      formData.append("status", newStatus);
      formData.append("changeDescription", changeDesc || "Updated");
      if (approvedBy) formData.append("approvedBy", approvedBy);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setMessage("Document updated successfully");
      setShowUpdate(false);
      setChangeDesc("");
      setApprovedBy("");
      setFile(null);
      loadDoc();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Document not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/documents" className="text-blue-600 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {doc.documentNumber}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        {/* Current info */}
        <div className="card space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-900">{doc.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                Current version: v{doc.currentVersion}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                statusColors[doc.status] || "bg-gray-100"
              }`}
            >
              {doc.status.replace("_", " ")}
            </span>
          </div>

          {doc.currentFileName && (
            <p className="text-sm text-green-700">
              File on record: {doc.currentFileName}
            </p>
          )}

          <button
            onClick={() => setShowUpdate(!showUpdate)}
            className="btn-secondary mt-2"
          >
            {showUpdate ? "Cancel Update" : "Update Version / Status"}
          </button>
        </div>

        {/* Update form */}
        {showUpdate && (
          <form onSubmit={handleUpdate} className="card space-y-3">
            <h2 className="font-semibold">Update Document</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Version
                </label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
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
                What changed? *
              </label>
              <input
                type="text"
                value={changeDesc}
                onChange={(e) => setChangeDesc(e.target.value)}
                required
                placeholder="Brief description of the change"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved By
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Name of approver"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload new file (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Update"}
            </button>
          </form>
        )}

        {message && (
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Version history */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Version History</h2>
          {doc.versions.length === 0 ? (
            <p className="text-sm text-gray-500">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {doc.versions.map((v) => (
                <div
                  key={v.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">v{v.version}</span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(v.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {v.changeDescription}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Changed by {v.changedBy.name}
                    {v.approvedBy && ` · Approved by ${v.approvedBy}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
