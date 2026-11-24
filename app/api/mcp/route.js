// Nightlane for AI assistants: a remote MCP server (Model Context Protocol,
// "Streamable HTTP" transport, plain JSON responses). Add
// https://www.nightlaneloads.com/api/mcp as a connector in an AI assistant
// and it can check brokers/carriers and verify Nightlane's Cardano records.
// Tools live in lib/mcpTools.js. Public, no login, rate-limited per network.
import { TOOLS, callTool } from "../../../lib/mcpTools";
import { checkRateLimit } from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER = { name: "nightlane", title: "Nightlane", version: "0.1.0" };
const INSTRUCTIONS =
  "Nightlane checks US trucking brokers and carriers against the FMCSA public registry and saves each check on the Cardano blockchain (label 8420), so the result can be proven later. Use check_carrier before booking with or paying an unfamiliar broker (match the DOT to the phone and city the broker gave you). Use list_records for a company's check history, and verify_record to independently confirm a record on Cardano.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
};

const json = (body, status = 200) => Response.json(body, { status, headers: CORS });
const rpcError = (id, code, message) => json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// No server-to-client stream: everything is request/response.
export async function GET() {
  return new Response("Nightlane MCP server. POST JSON-RPC here.", { status: 405, headers: { ...CORS, Allow: "POST" } });
}

async function handle(msg, req) {
  const { id, method, params } = msg || {};
  if (!msg || msg.jsonrpc !== "2.0" || typeof method !== "string") return { jsonrpc: "2.0", id: id ?? null, error: { code: -32600, message: "Invalid request" } };
  const isNotification = id === undefined || id === null;
  if (isNotification) return null; // e.g. notifications/initialized

  if (method === "initialize") {
    const asked = params?.protocolVersion;
    return {
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: INSTRUCTIONS,
      },
    };
  }
  if (method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
  if (method === "tools/call") {
    const name = params?.name;
    if (!TOOLS.some((t) => t.name === name)) return { jsonrpc: "2.0", id, error: { code: -32602, message: `Unknown tool: ${name}` } };
    // check_carrier hits FMCSA and can write to Cardano, so it shares the
    // website's limit; the read-only tools get a looser one.
    const limit = name === "check_carrier"
      ? await checkRateLimit(req, "mcp_check_carrier", { maxPerWindow: 30, windowMinutes: 60 })
      : await checkRateLimit(req, "mcp_read", { maxPerWindow: 120, windowMinutes: 60 });
    if (!limit.allowed) {
      return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: `Too many checks from this network. Try again in ${limit.retryAfterMinutes} minutes.` }] } };
    }
    try {
      const { text, data } = await callTool(name, params?.arguments || {});
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], structuredContent: data } };
    } catch (e) {
      return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: String(e.message || e).slice(0, 300) }] } };
    }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m, req)))).filter(Boolean);
    return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
  }
  const out = await handle(body, req);
  return out ? json(out) : new Response(null, { status: 202, headers: CORS });
}
