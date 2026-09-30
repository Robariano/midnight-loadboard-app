"use client";
import { useState, useEffect } from "react";

const DOCUMENT_TYPES = ["Bill of Lading", "Rate Confirmation", "Lumper Receipt", "Invoice", "Proof of Delivery", "Inspection Report", "Insurance Certificate", "Medical Card", "Other"];

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

  const [shares, setShares] = useState([]);
  const [recipientLabel, setRecipientLabel] = useState("");
  const [shareStatus, setShareStatus] = useState(null);
  const [shareError, setShareError] = useState(null);

  function loadShares() {
    fetch("/api/document-shares")
      .then((r) => r.json())
      .then((d) => setShares(d.shares || []));
  }

  useEffect(() => { loadShares(); }, []);

  async function handleCreateShare(e) {
    e.preventDefault();
    if (!recipientLabel.trim()) { setShareError("Enter who you're sharing this with."); return; }
    setShareStatus("creating");
    setShareError(null);
    const res = await fetch("/api/document-shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_label: recipientLabel.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setRecipientLabel("");
      setShareStatus("done");
      loadShares();
    } else {
      setShareError(data.error || "Couldn't create the link.");
      setShareStatus("error");
    }
  }

  async function handleRevoke(id) {
    await fetch(`/api/document-shares/${id}/revoke`, { method: "POST" });
    loadShares();
  }

  const [openSendFor, setOpenSendFor] = useState(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendLabel, setSendLabel] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendStatus, setSendStatus] = useState(null);
  const [sendError, setSendError] = useState(null);

  function openSend(docId) {
    setOpenSendFor(docId);
    setSendEmail("");
    setSendLabel("");
    setSendNote("");
    setSendStatus(null);
    setSendError(null);
  }

  async function handleSendDocument(e, docId) {
    e.preventDefault();
    if (!sendEmail.trim()) { setSendError("Enter an email address."); return; }
    setSendStatus("sending");
    setSendError(null);
    const res = await fetch(`/api/driver-documents/${docId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient_email: sendEmail.trim(),
        recipient_label: sendLabel.trim(),
        note: sendNote.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSendStatus("done");
      loadDocuments();
    } else {
      setSendError(data.error || "Couldn't send it.");
      setSendStatus("error");
    }
  }


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
        <input type="file" accept="image/*,application/pdf" capture="environment"
          onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 12, color: "#8a92a0", marginTop: -8, marginBottom: 12 }}>
          On your phone this opens your camera directly - snap a photo of the paperwork, or choose
          an existing file instead.
        </p>

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
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: (d.sends && d.sends.length) ? 8 : 0 }}>
            <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={{
              color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              View file
            </a>
            <button onClick={() => openSend(d.id)} style={{
              background: "none", border: "1px solid #e2e5ea", borderRadius: 6,
              padding: "3px 10px", fontSize: 12, color: "#1d4ed8", cursor: "pointer",
            }}>
              Send
            </button>
          </div>

          {d.sends && d.sends.length > 0 && (
            <p style={{ fontSize: 12, color: "#8a92a0", margin: "0 0 6px" }}>
              {d.sends.map((s) => (s.recipient_label || s.recipient_email)).join(", ")}
              {" - last sent "}
              {new Date(d.sends[0].sent_at).toLocaleString()}
            </p>
          )}

          {openSendFor === d.id && (
            <form onSubmit={(e) => handleSendDocument(e, d.id)} style={{
              background: "#ffffff", border: "1px solid #e2e5ea", borderRadius: 8,
              padding: "10px 12px", marginTop: 8,
            }}>
              <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 4 }}>
                Send to (email)
              </label>
              <input value={sendEmail} onChange={(e) => setSendEmail(e.target.value)}
                placeholder="dispatch@rtsfinancial.com" type="email"
                style={{
                  width: "100%", padding: 7, marginBottom: 8, background: "#ffffff",
                  border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                }} />
              <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 4 }}>
                Who is this? (optional, e.g. "RTS Financial")
              </label>
              <input value={sendLabel} onChange={(e) => setSendLabel(e.target.value)}
                style={{
                  width: "100%", padding: 7, marginBottom: 8, background: "#ffffff",
                  border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                }} />
              <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 4 }}>
                Note (optional)
              </label>
              <input value={sendNote} onChange={(e) => setSendNote(e.target.value)}
                placeholder="Load #4471"
                style={{
                  width: "100%", padding: 7, marginBottom: 10, background: "#ffffff",
                  border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button type="submit" disabled={sendStatus === "sending"} style={{
                  background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                  padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                  {sendStatus === "sending" ? "Sending..." : "Send email"}
                </button>
                <button type="button" onClick={() => setOpenSendFor(null)} style={{
                  background: "none", border: "none", fontSize: 13, color: "#4b5568", cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
              {sendStatus === "done" && (
                <p style={{ color: "#166534", marginTop: 8, fontSize: 13 }}>Sent.</p>
              )}
              {sendError && <p style={{ color: "#991b1b", marginTop: 8, fontSize: 13 }}>{sendError}</p>}
            </form>
          )}
        </div>
      ))}

      <h2 style={{ color: "#14181f", fontSize: 16, marginTop: 32 }}>Share with a broker</h2>
      <p style={{ color: "#4b5568", marginBottom: 16, fontSize: 13 }}>
        Instead of emailing your documents, send a private link. You'll see exactly when they
        looked at it, and you can turn the link off any time.
      </p>

      <form onSubmit={handleCreateShare} style={{
        background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
        padding: "16px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-end",
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 13, color: "#4b5568", marginBottom: 6 }}>
            Who is this for? (e.g. broker name)
          </label>
          <input value={recipientLabel} onChange={(e) => setRecipientLabel(e.target.value)}
            placeholder="Coyote Point Brokerage"
            style={{
              width: "100%", padding: 8, background: "#ffffff",
              border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 14,
            }} />
        </div>
        <button type="submit" disabled={shareStatus === "creating"} style={{
          background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
          padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          {shareStatus === "creating" ? "Creating..." : "Create link"}
        </button>
      </form>
      {shareError && <p style={{ color: "#991b1b", marginBottom: 16, fontSize: 13 }}>{shareError}</p>}

      {shares.length === 0 && (
        <p style={{ color: "#4b5568", fontSize: 14 }}>No share links yet.</p>
      )}
      {shares.map((s) => {
        const isRevoked = !!s.revoked_at;
        const isExpired = new Date(s.expires_at) < new Date();
        const shareUrl = typeof window !== "undefined"
          ? `${window.location.origin}/shared/${s.share_token}`
          : `/shared/${s.share_token}`;
        return (
          <div key={s.id} style={{
            background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
            padding: "12px 16px", marginBottom: 8, opacity: (isRevoked || isExpired) ? 0.6 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px", color: "#14181f" }}>
                {s.recipient_label}
              </p>
              {!isRevoked && !isExpired && (
                <button onClick={() => handleRevoke(s.id)} style={{
                  background: "none", border: "1px solid #e2e5ea", borderRadius: 6,
                  padding: "4px 10px", fontSize: 12, color: "#991b1b", cursor: "pointer",
                }}>
                  Turn off
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: "#8a92a0", margin: "0 0 6px" }}>
              {isRevoked ? "Turned off" : isExpired ? "Expired" : `Expires ${new Date(s.expires_at).toLocaleDateString()}`}
              {" \u00b7 "}
              {s.view_count === 0
                ? "Not viewed yet"
                : `Viewed ${s.view_count} time${s.view_count === 1 ? "" : "s"}, last on ${new Date(s.last_viewed_at).toLocaleString()}`}
            </p>
            {!isRevoked && !isExpired && (
              <p style={{ fontSize: 13, color: "#1d4ed8", margin: 0, wordBreak: "break-all" }}>
                {shareUrl}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
