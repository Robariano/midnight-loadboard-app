import { getServiceClient } from "../../../../lib/supabase";

// Turns off one Authority Watch subscription, found by its private stop link.
export async function POST(req) {
  const body = await req.json();
  const token = String(body.token || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return Response.json({ error: "That stop link isn't valid." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("authority_watches")
    .update({ active: false, stopped_at: new Date().toISOString() })
    .eq("stop_token", token)
    .select("dot_number")
    .maybeSingle();

  if (error) return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  if (!data) return Response.json({ error: "We couldn't find that Authority Watch." }, { status: 404 });
  return Response.json({ stopped: true, dotNumber: data.dot_number });
}
