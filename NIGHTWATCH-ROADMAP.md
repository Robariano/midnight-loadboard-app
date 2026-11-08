# Nightwatch Roadmap

## Live (Nov 7, 2026): Nightwatch Lite
- Carrier FMCSA check by DOT/MC (snapshot frozen at check time; SAFER link when the feed is missing items)
- Driver coverage text to the number the broker enters
- Saved, timestamped report at /nightwatch/report/[token]

## Known gap
The driver text goes to whatever phone number the broker was given. A scammer posing as a
carrier can supply their own "driver" number and answer "covered." The driver check catches
honest drivers on bad setups, not a determined fraudster.

## Next: carrier-confirmed driver (closes the gap)
Send the confirmation to the carrier's **FMCSA-registered** contact (phone/email on file with
FMCSA), not the number the broker was handed:
1. Broker enters DOT + driver name/phone (as today).
2. Nightlane texts/emails the carrier's FMCSA contact: "Is [driver], phone ending [####], your
   driver on load [ref] for [broker]? Yes / No."
3. Report shows "Carrier confirmed driver" or "Carrier did NOT confirm" alongside the driver's
   own answer.
4. If the FMCSA contact has no mobile/email, report says so and recommends a call to the phone
   on file.
Open questions: FMCSA phone may be a landline (need voice/email fallback); consent and
opt-out wording for carrier contacts; rate limiting to avoid spamming carriers.

## Later
- Continuous re-checks (authority/insurance changes after the check)
- Chameleon cross-check against flagged carriers
- Status badges (Verified / Expiring / Flagged)
