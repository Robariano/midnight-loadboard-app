# Cardano transaction metadata label 8420: Nightlane carrier checks

Nightlane (https://www.nightlaneloads.com) records US trucking carrier checks on Cardano under transaction metadata label **8420**.

When a carrier is checked against the US Federal Motor Carrier Safety Administration (FMCSA) public registry, Nightlane saves what FMCSA showed that day: operating authority, out-of-service status, insurance on file and truck count. Brokers and carriers can later prove what the public record said on a given date, and the record cannot be edited afterward.

- Public lookup: https://www.nightlaneloads.com/verify
- Network: Cardano mainnet since 20 Nov 2026 (earlier test records on preprod).
- Step-by-step verification with a worked mainnet example: https://www.nightlaneloads.com/verify/how
- Source: `lib/carrierFingerprint.js` and `lib/cardanoRecord.js` in this repository.

## How a record is written

Each record is a transaction that sends ADA from Nightlane's own wallet back to itself, carrying the metadata below. No token is minted, and carriers do not need a wallet. Nightlane writes a record the first time a carrier is checked on a given UTC day, and again that day only if the carrier's facts change.

## Metadata layout

```json
{
  "8420": {
    "app": "nightlane",
    "kind": "carrier-check",
    "dot": "3349902",
    "on": "2026-11-16",
    "sha256": "<64 hex characters>",
    "facts": {
      "v": 1,
      "name": ["MONARCH TRANSPORTATION LLC"],
      "allowed": 1,
      "oos": 0,
      "auth": ["Property"],
      "authUnknown": 0,
      "cargo": 0,
      "bipd": 1000000,
      "pu": 10
    }
  }
}
```

| Field | Meaning |
|---|---|
| `app` | Always `"nightlane"`. |
| `kind` | Always `"carrier-check"`. |
| `dot` | The carrier's USDOT number, digits only. |
| `on` | Date of the check (UTC), `YYYY-MM-DD`. |
| `sha256` | Fingerprint of the facts (see below). |
| `facts.v` | Layout version. Currently `1`. |
| `facts.name` | Legal name, upper case, split into chunks of up to 60 characters (Cardano metadata strings are limited to 64 bytes). |
| `facts.allowed` | `1` if FMCSA shows the carrier allowed to operate, else `0`. |
| `facts.oos` | `1` if out of service, else `0`. |
| `facts.auth` | Active operating authority types, sorted. |
| `facts.authUnknown` | `1` if FMCSA did not return authority data. |
| `facts.cargo` | `1` if cargo insurance is on file with FMCSA. |
| `facts.bipd` | Liability (BIPD) insurance on file: the amount in US dollars, or the text `"on file"` when FMCSA shows a filing without an amount. Omitted if none is known. |
| `facts.pu` | Power units (trucks). Omitted if unknown. |

Cardano metadata has no booleans or nulls, so flags are `1`/`0` and unknown values are left out.

## Verifying a record

1. **Signer.** The transaction must be sent from Nightlane's own wallet. Records under 8420 from any other wallet are not Nightlane records, and the verify page ignores them.
2. **Fingerprint.** Rebuild the version 1 record:
   `{ v, dot, name, allowedToOperate, outOfService, authorities, authorityUnknown, bipdInsurance, cargoInsurance, powerUnits, checkedOn }`
   from the metadata (joining the `name` chunks with no separator, converting flags to `true`/`false`, using `null` for omitted `bipd`/`pu`, keeping `auth` in stored order, and `checkedOn` = `on`). Serialize it as JSON with object keys sorted at every level (code-point order), arrays in their stored order, no whitespace, standard JSON for strings and numbers, encoded as UTF-8. Take SHA-256 as lowercase hex. It must equal `sha256`.

### Worked example (mainnet, tx `328001821078edb2eb233e188a33b2110889a129f1e198092c8e03432e001a28`)

Bytes hashed:

```
{"allowedToOperate":true,"authorities":["Broker","Property"],"authorityUnknown":false,"bipdInsurance":750000,"cargoInsurance":false,"checkedOn":"2026-11-23","dot":"3442654","name":"SWICK LOGISTICS LLC","outOfService":false,"powerUnits":1,"v":1}
```

SHA-256: `ddc937972ed5826e4e9208ce2deed49ffbff06574af788be4f66b46d3996d25d`

## Versioning

`facts.v` is the layout version. Any change to the fields or rules above gets a new version; records under older versions stay verifiable with that version's rules.

A record shows what FMCSA's public data said on that date. It is not a guarantee of a carrier's current status.
