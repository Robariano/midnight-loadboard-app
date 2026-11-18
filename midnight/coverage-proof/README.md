# Nightlane coverage proof (Midnight)

A carrier proves **"my insurance meets your minimum and is good through your delivery date"** to a broker or dispatcher, **without handing over its certificate of insurance (COI)**.

This is Nightlane's Midnight Build Club goal 1. Public FMCSA facts stay on Cardano (label 8420); what has to stay private goes on Midnight.

## The problem

Brokers need proof of a carrier's liability and cargo coverage before booking. Today that means emailing a COI to strangers. COIs get stolen and used by cargo thieves to impersonate real carriers, so careful carriers hesitate to send them, and dispatchers hesitate to ask.

## How it works

1. **Nightlane confirms coverage once**, directly with the carrier's insurance agent, and signs the facts: DOT number, liability limit, cargo limit, expiry, a random nonce, and a hash of the carrier's own key. The carrier keeps that signed attestation privately. It is never published.
2. **A broker asks** "at least $1,000,000 liability and $100,000 cargo through Friday?" The carrier runs `proveCoverage` with those numbers. Inside the zero-knowledge proof, the contract checks Nightlane's signature, the minimums, the dates, and that the attestation wasn't revoked.
3. **Only the answer is recorded**: this DOT met these minimums through this date, attested by Nightlane, for this request. The real limits, insurer, policy number and exact expiry never appear on-chain.

**A stolen attestation is useless.** It is bound to the carrier's secret key, so a thief can't prove anything with it. A stolen paper COI, by contrast, is exactly what cargo thieves use today.

If a policy is cancelled, Nightlane **revokes** the attestation and it can no longer be used.

## What's here

| File | What it is |
|---|---|
| `contract/coverage-proof.compact` | The contract (Compact language 0.28, toolchain 0.36.1) |
| `contract/schnorr.compact` | Signature check, from Midnight's official zk-loan example (Apache-2.0, see `LICENSE-APACHE-2.0`), with one helper added |
| `test/coverage-proof.test.mjs` | 12 simulator tests: honest proofs pass; low limits, expired dates, stolen or edited attestations, unregistered attestors, revoked attestations and repeat requests all fail |

Circuits: `proveCoverage` (carrier), and `registerAttestor`, `removeAttestor`, `revokeAttestation`, `rotateAdmin` (Nightlane admin).

## Run it

Requires the Compact toolchain 0.36 (`compact update 0.36`; Midnight's guidance for Mainnet, Preview and Preprod as of November 2026) and Node 22+.

```
npm install
npm run compile:fast   # compile without proving keys
npm test               # run the simulator tests
npm run compile        # full compile, including proving keys
```

## Status

- Contract compiles and passes its simulator tests.
- Not yet deployed. Next: deploy to Preprod with a proof server and an indexer provider, then build the attestor service (Nightlane signs after confirming with the agent) and a simple page for carriers and brokers.
- Pilot with carriers and brokers from Steady Wake Dispatch.
