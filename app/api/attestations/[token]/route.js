import { getServiceClient } from "../../../../lib/supabase";

export async function GET(req, { params }) {
  const supabase = getServiceClient();
  const { data: attestation, error } = await supabase
    .from("coverage_attestations")
    .select("*, load:loads(*), carrier:carriers(*)")
    .eq("token", params.token)
    .single();

  if (error || !attestation) {
    return Response.json({ error: "This confirmation link is invalid or has expired." }, { status: 404 });
  }
  if (attestation.response !== "pending") {
    return Response.json({ error: "This confirmation has already been submitted." }, { status: 409 });
  }

  return Response.json({ load: attestation.load, carrier: attestation.carrier });
}

export async function POST(req, { params }) {
  const body = await req.json(); // { response: 'covered_under_policy' | 'own_authority' | 'neither' }
  const supabase = getServiceClient();

  const { data: attestation, error } = await supabase
    .from("coverage_attestations")
    .select("*")
    .eq("token", params.token)
    .single();

  if (error || !attestation) {
    return Response.json({ error: "Invalid token." }, { status: 404 });
  }
  if (attestation.response !== "pending") {
    return Response.json({ error: "Already submitted." }, { status: 409 });
  }

  // Record the response
  await supabase
    .from("coverage_attestations")
    .update({ response: body.response, submitted_at: new Date().toISOString() })
    .eq("id", attestation.id);

  if (body.response === "neither") {
    // Create a flag, put the load on hold, increment carrier flag counts
    await supabase.from("coverage_flags").insert({
      attestation_id: attestation.id,
      carrier_id: attestation.carrier_id,
      status: "open",
    });

    await supabase.from("loads").update({ status: "on_hold" }).eq("id", attestation.load_id);

    // Increment carrier flag counts (fetch then update — simple approach for MVP)
    const { data: carrier } = await supabase
      .from("carriers")
      .select("lifetime_flag_count, open_flag_count")
      .eq("id", attestation.carrier_id)
      .single();

    await supabase
      .from("carriers")
      .update({
        lifetime_flag_count: (carrier?.lifetime_flag_count || 0) + 1,
        open_flag_count: (carrier?.open_flag_count || 0) + 1,
      })
      .eq("id", attestation.carrier_id);
  } else {
    // Covered — load moves to confirmed
    await supabase.from("loads").update({ status: "confirmed" }).eq("id", attestation.load_id);
  }

  return Response.json({ ok: true });
}
