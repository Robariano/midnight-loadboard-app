# Nightlane for AI assistants (MCP)

Nightlane's broker/carrier checks and Cardano record verification are available to AI assistants as a remote MCP server (Model Context Protocol):

**Server URL:** `https://www.nightlaneloads.com/api/mcp` (Streamable HTTP, no login)

Add it as a custom connector in any MCP-capable assistant. An AI dispatcher can then check a broker before booking, and anyone's AI can independently verify Nightlane's on-chain records.

## Tools

| Tool | What it does |
|---|---|
| `check_carrier` | FMCSA lookup by DOT, MC or name (authority, out-of-service, insurance on file, trucks), and saves the check on Cardano under label 8420. |
| `list_records` | Nightlane's Cardano records for one USDOT number, newest first, each with its fingerprint check. |
| `verify_record` | Fetches a transaction from Koios (public, not run by Nightlane), recomputes every record's SHA-256 fingerprint, and checks it was sent from Nightlane's wallet. Handles batches. |

## Limits

Per network: 30 `check_carrier` calls and 120 other calls per hour.

## Not yet

- Midnight coverage proofs (does a carrier meet a broker's insurance minimum) as a tool.
- Paid checks (a fee per check, in dollars or ADA).
