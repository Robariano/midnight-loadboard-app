import { headers } from "next/headers";
import { getServiceClient } from "../../../lib/supabase";
import { isAdminRequest } from "../../../lib/admin-auth";
import { DRIVER_STEPS, statusInfo, stepIndex } from "../../../lib/driverStatus";
import AutoRefresh from "./AutoRefresh";

// Private driver status page, reached only from a link the dispatcher sends.
// Shows where the driver's next load stands. Never shows rates or broker
// names unless the dispatcher typed them into the message.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your load status | Steady Wake Dispatch",
  robots: { index: false, follow: false },
};

const DISPATCHER = {
  name: "Rob Ariano",
  company: "Steady Wake Dispatch",
  phone: "(970) 903-9226",
  tel: "+19709039226",
};

async function getLink(token) {
  if (!token || token.length > 64) return { link: null, reason: "not_found" };
  const supabase = getServiceClient();
  const { data: link, error } = await supabase
    .from("driver_status_links")
    .select("id, driver_name, lane, pickup_text, status, message, events, updated_at, expires_at, revoked_at, view_count")
    .eq("token", token)
    .single();
  if (error || !link) return { link: null, reason: "not_found" };
  if (link.revoked_at) return { link: null, reason: "revoked" };
  if (new Date(link.expires_at) < new Date()) return { link: null, reason: "expired" };
  // Count the view (read-then-write is fine at this volume), but not when
  // the dispatcher is the one looking (logged in as admin on this browser),
  // so "Driver opened it" only counts the driver.
  const viewer = { headers: { get: (name) => headers().get(name) } };
  if (isAdminRequest(viewer)) return { link, reason: null };
  await supabase
    .from("driver_status_links")
    .update({ view_count: (link.view_count || 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq("id", link.id);
  return { link, reason: null };
}

function ago(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function when(iso) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }) + " CT";
}

const card = {
  background: "#ffffff", border: "1px solid #e2e5ea", borderRadius: 12, padding: 20, marginBottom: 16,
};

function Contact() {
  return (
    <div style={{ ...card, background: "#f7f8fa" }}>
      <div style={{ fontSize: 13, color: "#4b5568" }}>Your dispatcher</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#14181f", marginTop: 2 }}>
        {DISPATCHER.name}, {DISPATCHER.company}
      </div>
      <a href={`tel:${DISPATCHER.tel}`} style={{
        display: "inline-block", marginTop: 10, background: "#1d4ed8", color: "#fff",
        padding: "10px 16px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15,
      }}>Call or text {DISPATCHER.phone}</a>
    </div>
  );
}

export default async function DriverStatus({ params }) {
  const { link, reason } = await getLink(params.token);

  if (!link) {
    const message = {
      expired: "This link has expired. Ask your dispatcher for a new one.",
      revoked: "This link was turned off by your dispatcher.",
      not_found: "This link isn't valid. Check that you opened the whole link.",
    }[reason];
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ color: "#14181f", fontSize: 22 }}>Load status</h1>
        <div style={card}><p style={{ margin: 0, color: "#4b5568" }}>{message}</p></div>
        <Contact />
      </div>
    );
  }

  const current = statusInfo(link.status);
  const at = stepIndex(link.status);
  const fellThrough = link.status === "fell_through";
  const history = (Array.isArray(link.events) ? link.events : []).slice().reverse();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <AutoRefresh seconds={60} />
      <h1 style={{ color: "#14181f", fontSize: 22, marginBottom: 4 }}>Hi {link.driver_name}, here's your load status</h1>
      <p style={{ color: "#4b5568", fontSize: 13, marginTop: 0 }}>
        Updated {ago(link.updated_at)}. This page refreshes on its own.
      </p>

      <div style={{ ...card, borderColor: fellThrough ? "#f5c26b" : "#bcd0fb", background: fellThrough ? "#fef8ec" : "#f3f7ff" }}>
        <div style={{ fontSize: 13, color: "#4b5568" }}>Right now</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#14181f", margin: "2px 0 6px" }}>{current.label}</div>
        <div style={{ fontSize: 15, color: "#2b3340" }}>{current.detail}</div>
        {link.message && (
          <div style={{ marginTop: 12, padding: 12, background: "#ffffff", borderRadius: 8, border: "1px solid #e2e5ea", fontSize: 15, color: "#14181f", whiteSpace: "pre-wrap" }}>
            <strong>From your dispatcher:</strong> {link.message}
          </div>
        )}
      </div>

      {(link.lane || link.pickup_text) && (
        <div style={card}>
          {link.lane && (<><div style={{ fontSize: 13, color: "#4b5568" }}>Load</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#14181f", marginBottom: link.pickup_text ? 10 : 0 }}>{link.lane}</div></>)}
          {link.pickup_text && (<><div style={{ fontSize: 13, color: "#4b5568" }}>Pickup</div>
            <div style={{ fontSize: 16, color: "#14181f" }}>{link.pickup_text}</div></>)}
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 13, color: "#4b5568", marginBottom: 10 }}>Steps</div>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {DRIVER_STEPS.map((s, i) => {
            const done = i < at || (i === at && s.key === "delivered");
            const here = i === at;
            return (
              <li key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span aria-hidden style={{
                  width: 22, height: 22, borderRadius: 11, flex: "0 0 22px", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                  background: done ? "#16a34a" : here ? "#1d4ed8" : "#e2e5ea",
                  color: done || here ? "#fff" : "#4b5568",
                }}>{done ? "✓" : i + 1}</span>
                <span style={{ fontSize: 15, color: here ? "#14181f" : "#4b5568", fontWeight: here ? 700 : 400 }}>
                  {s.label}{here ? " (now)" : ""}
                </span>
              </li>
            );
          })}
        </ol>
        <p style={{ fontSize: 12, color: "#4b5568", margin: "10px 0 0" }}>
          A load isn't yours until it says <strong>Booked</strong>. Bids can go to other trucks.
        </p>
      </div>

      {history.length > 1 && (
        <div style={card}>
          <div style={{ fontSize: 13, color: "#4b5568", marginBottom: 8 }}>Updates</div>
          {history.map((e, i) => (
            <div key={i} style={{ padding: "8px 0", borderTop: i ? "1px solid #eef0f3" : "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#14181f" }}>{statusInfo(e.status).label}</div>
              <div style={{ fontSize: 12, color: "#4b5568" }}>{when(e.at)}</div>
              {e.message && <div style={{ fontSize: 14, color: "#2b3340", marginTop: 2, whiteSpace: "pre-wrap" }}>{e.message}</div>}
            </div>
          ))}
        </div>
      )}

      <Contact />
      <p style={{ fontSize: 12, color: "#8a93a3", textAlign: "center" }}>Private link for {link.driver_name}. Please don't share it.</p>
    </div>
  );
}
