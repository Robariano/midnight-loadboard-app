import { getCarrierIdFromRequest } from "../../../../lib/carrier-auth";

export async function GET(req) {
      const cookieHeader = req.headers.get("cookie") || null;
      const carrierId = getCarrierIdFromRequest(req);
      const secretSet = !!process.env.CARRIER_SESSION_SECRET;
      const secretLen = (process.env.CARRIER_SESSION_SECRET || "").length;
      return Response.json({ cookieHeader, carrierId, secretSet, secretLen });
}
