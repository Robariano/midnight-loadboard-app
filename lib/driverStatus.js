// Shared by the admin page (browser) and API routes: no Node-only imports here.
// The steps a driver sees, in order. "fell_through" is not a step on the
// line: it means a bid didn't win and we're back to looking.
export const DRIVER_STEPS = [
  { key: "looking", label: "Looking for a load", detail: "Your dispatcher is searching the load boards for you." },
  { key: "bid_sent", label: "Bid sent", detail: "A bid is in with a broker. Waiting on their answer. Not booked yet." },
  { key: "accepted", label: "Broker said yes", detail: "The broker accepted. Your carrier is confirming before it's booked." },
  { key: "booked", label: "Booked", detail: "It's yours. Rate confirmation signed. Pickup details below." },
  { key: "picked_up", label: "Picked up", detail: "Loaded and on the way." },
  { key: "delivered", label: "Delivered", detail: "Delivered. Nice work." },
];

export const EXTRA_STATUSES = [
  { key: "fell_through", label: "Went to someone else", detail: "That load went to another truck. Your dispatcher is still looking." },
];

export const ALL_STATUSES = [...DRIVER_STEPS, ...EXTRA_STATUSES];
export const STATUS_KEYS = new Set(ALL_STATUSES.map((s) => s.key));

export function statusInfo(key) {
  return ALL_STATUSES.find((s) => s.key === key) || DRIVER_STEPS[0];
}

// Index on the step line. "fell_through" sits at the "looking" position.
export function stepIndex(key) {
  if (key === "fell_through") return 0;
  const i = DRIVER_STEPS.findIndex((s) => s.key === key);
  return i < 0 ? 0 : i;
}

export const LINK_DAYS = 14;

export function clean(value, max) {
  const s = String(value ?? "").trim();
  return s ? s.slice(0, max) : null;
}
