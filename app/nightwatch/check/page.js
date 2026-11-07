import NightwatchCheck from "./_NightwatchCheck";

export const metadata = {
  title: "Nightwatch Lite: Carrier & Driver Check | Nightlane",
  description:
    "Free for brokers: check a carrier's FMCSA authority and insurance, confirm the driver is covered, and keep a timestamped report.",
};

export default function NightwatchCheckPage() {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 6px" }}>
        For Brokers · Free
      </p>
      <h1 style={{ color: "#14181f", margin: "0 0 6px" }}>Nightwatch Lite</h1>
      <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6, maxWidth: 600, marginBottom: 20 }}>
        Before you hand over a load: check the carrier with FMCSA, confirm the actual driver is covered
        under their policy, and keep a dated report of both checks for your records.
      </p>
      <NightwatchCheck />
      <p style={{ fontSize: 11, color: "#8a92a0", marginTop: 24, lineHeight: 1.6, maxWidth: 600 }}>
        Carrier data comes from FMCSA&apos;s public records at the moment you run the check. It&apos;s a
        snapshot, not a guarantee. Nightlane is not affiliated with or endorsed by FMCSA.
      </p>
    </div>
  );
}
