"use client";
import { useState, useEffect } from "react";

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 14,
    background: "#12121e",
    border: "1px solid #2a2a3e",
    borderRadius: 6,
    color: "#e0e0e0",
    fontSize: 14,
};

const labelStyle = { display: "block", fontSize: 13, color: "#888", marginBottom: 4 };

export default function ManageLoad({ params }) {
    const { token } = params;
    const [load, setLoad] = useState(undefined);
    const [form, setForm] = useState({ rate: "", notes: "", pickup_date: "" });
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

  useEffect(() => {
        fetch(`/api/loads/manage/${token}`)
          .then((r) => r.json())
          .then((data) => {
                    setLoad(data.load || null);
                    if (data.load) {
                                setForm({
                                              rate: data.load.rate ?? "",
                                              notes: data.load.notes ?? "",
                                              pickup_date: data.load.pickup_date ?? "",
                                });
                    }
          })
          .catch(() => setLoad(null));
  }, [token]);

  async function handleSave(e) {
        e.preventDefault();
        setStatus("saving");
        setError(null);
        const res = await fetch(`/api/loads/manage/${token}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                setLoad(data.load);
                setStatus("saved");
        } else {
                setStatus("error");
                setError(data.error || "Something went wrong.");
        }
  }

  async function handleCancel() {
        if (!confirm("Cancel this load? Carriers will no longer see it.")) return;
        setStatus("saving");
        setError(null);
        const res = await fetch(`/api/loads/manage/${token}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cancel: true }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                setLoad(data.load);
                setStatus("cancelled");
        } else {
                setStatus("error");
                setError(data.error || "Something went wrong.");
        }
  }

  if (load === undefined) {
        return (
                <div>
                  <p style={{ color: "#888" }}>Loading...</p>
    </div>
      );
}

  if (load === null) {
        return (
                <div>
                  <h1 style={{ color: "#fff" }}>Link not found</h1>
        <p style={{ color: "#888" }}>This management link is invalid.</p>
    </div>
    );
}

  const isOpen = load.status === "open";

  return (
        <div>
          <h1 style={{ color: "#fff" }}>Manage Your Load</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
{load.pickup_city} → {load.delivery_city} · {load.equipment_type}
</p>

{!isOpen && (
          <p style={{ color: load.status === "cancelled" ? "#ff6b6b" : "#4caf50", marginBottom: 16 }}>
{load.status === "cancelled"
             ? "This load has been cancelled."
              : "This load has already been claimed by a carrier and can no longer be edited here."}
</p>
      )}

{isOpen && (
          <form onSubmit={handleSave}>
            <label style={labelStyle}>Pickup Date</label>
           <input style={inputStyle} type="date" value={form.pickup_date}
            onChange={(e) => setForm((f) => ({ ...f, pickup_date: e.target.value }))} />

                        <label style={labelStyle}>Rate ($)</label>
           <input style={inputStyle} type="number" value={form.rate}
            onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} />

                        <label style={labelStyle}>Notes</label>
           <textarea style={{ ...inputStyle, minHeight: 70 }} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />

                        <button type="submit" disabled={status === "saving"} style={{
                          width: "100%", padding: "14px", background: "#5c5cff", color: "#fff",
                          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 12,
            }}>
{status === "saving" ? "Saving..." : "Save Changes"}
</button>

          <button type="button" onClick={handleCancel} disabled={status === "saving"} style={{
              width: "100%", padding: "14px", background: "transparent", color: "#ff6b6b",
              border: "1px solid #ff6b6b", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
}}>
            Cancel This Load
              </button>

{status === "saved" && <p style={{ color: "#4caf50", marginTop: 12 }}>Saved.</p>}
{status === "error" && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
  </form>
      )}
</div>
  );
}
