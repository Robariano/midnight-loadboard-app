"use client";
import { useState, useEffect } from "react";

const DOCUMENT_TYPES = ["Invoice", "Proof of Delivery", "Inspection Report", "Insurance Certificate", "Medical Card", "Other"];

export default function MyDocuments() {
    const [documents, setDocuments] = useState(null);
    const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
    const [notes, setNotes] = useState("");
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

  function loadDocuments() {
        fetch("/api/driver-documents")
          .then((r) => r.json())
          .then((d) => {
                if (d.error) { setError(d.error); setDocuments([]); }
                else { setDocuments(d.documents || []); setError(null); }
          });
  }

  useEffect(() => { loadDocuments(); }, []);

  async function handleUpload(e) {
        e.preventDefault();
        if (!file) { setError("Choose a file first."); return; }
        setStatus("uploading");
        setError(null);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_type", documentType);
        formData.append("notes", notes);
        const res = await fetch("/api/driver-documents", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                setFile(null);
                setNotes("");
                setStatus("done");
                loadDocuments();
        } else {
                setError(data.error || "Upload failed.");
                setStatus("error");
        }
  }

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>My Documents</h1>
      <p style={{ color: "#4b5568", marginBottom: 24 }}>
        A private, timestamped record of your own paperwork - invoices, delivery receipts,
        certifications. Only you can see these. Fast upload, no account beyond your existing
        carrier login, no extra steps.
      </p>

      <form onSubmit={handleUpload} style={{
        background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
        padding: "16px 18px", marginBottom: 24,
      }}>
        <label style={{ display: "block", fontSize: 13, color: "#4b5568", marginBottom: 6 }}>
          Document type
        </label>
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{
          width: "100%", padding: 8, marginBottom: 12, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 14,
        }}>
          {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={{ display: "block", fontSize: 13, color: "#4b5568", marginBottom: 6 }}>
          File
        </label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: 12 }} />

        <label style={{ display: "block", fontSize: 13, color: "#4b5568", marginBottom: 6 }}>
          Notes (optional)
        </label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Load #4471, submitted to dispatch"
          style={{
            width: "100%", padding: 8, marginBottom: 12, background: "#ffffff",
            border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 14,
          }} />

        <button type="submit" disabled={status === "uploading"} style={{
          background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
          padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          {status === "uploading" ? "Uploading..." : "Save Document"}
        </button>
        {error && <p style={{ color: "#991b1b", marginTop: 10, fontSize: 13 }}>{error}</p>}
      </form>

      <h2 style={{ color: "#14181f", fontSize: 16 }}>Your Saved Documents</h2>
      {documents === null && <p style={{ color: "#4b5568" }}>Loading...</p>}
      {documents && documents.length === 0 && !error && (
        <p style={{ color: "#4b5568" }}>No documents saved yet.</p>
      )}
      {documents && documents.map((d) => (
        <div key={d.id} style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
          padding: "12px 16px", marginBottom: 8,
        }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px", color: "#14181f" }}>
            {d.document_type}
          </p>
          <p style={{ fontSize: 12, color: "#8a92a0", margin: "0 0 6px" }}>
            Saved {new Date(d.submitted_at).toLocaleString()}
          </p>
          {d.notes && <p style={{ fontSize: 13, color: "#4b5568", margin: "0 0 6px" }}>{d.notes}</p>}
          <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={{
            color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            View file
          </a>
        </div>
      ))}
    </div>
  );
}
