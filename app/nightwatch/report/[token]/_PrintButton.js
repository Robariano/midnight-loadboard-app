"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="nw-noprint"
      style={{ background: "#14181f", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
      Print / save as PDF
    </button>
  );
}
