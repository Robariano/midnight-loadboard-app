import DispatchNudge from "../shared/DispatchNudge";

export const metadata = {
  title: "About | Nightlane",
  description: "How Nightlane started: a trucking idea born on the Cardano and Midnight networks, rebuilt into free tools for owner-operators and brokers.",
};

const h2 = { color: "#14181f", fontSize: 20, margin: "28px 0 10px" };
const p = { color: "#374151", fontSize: 16, lineHeight: 1.7, margin: "0 0 14px" };

export default function About() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ color: "#14181f", marginBottom: 8 }}>About Nightlane</h1>
      <p style={{ ...p, color: "#6b7280" }}>Built by Rob Ariano, a Navy veteran who has spent his life around freight.</p>

      <h2 style={h2}>Where it started</h2>
      <p style={p}>
        Nightlane began as Midnight Loadboard, built on the Cardano blockchain and the Midnight network. The idea
        came from a problem every owner-operator knows: you deliver the load, you did your job, and then you wait
        30, 60 or 90 days to get paid, or you hand a factoring company 3 to 5% to get your money sooner.
      </p>
      <p style={p}>
        I showed an early version of the load board to the team behind GameChanger, one of the biggest wallets in
        the Cardano ecosystem, and we talked through how smart contracts could release a carrier&apos;s pay
        automatically once a load is delivered. Those conversations shaped a lot of how I think about this
        industry.
      </p>

      <h2 style={h2}>Where it went</h2>
      <p style={p}>
        Over time I moved away from building on the blockchain and rebuilt Nightlane as a regular web app, focused
        on the problems carriers and brokers face every day: fraud, double brokering, authority glitches and
        compliance changes that can cost you loads overnight.
      </p>
      <p style={p}>
        Today Nightlane offers free tools anyone can use: a broker and carrier check, Authority Watch for daily
        FMCSA status alerts, an ELD revoked-device check, coverage confirmation and a load board for verified
        carriers.
      </p>

      <h2 style={h2}>Back on Cardano, where it helps</h2>
      <p style={p}>
        The blockchain came back in where it actually helps people: proof. When Nightlane checks a broker or carrier,
        the result can be saved on Cardano, so anyone can confirm what FMCSA showed on that date and that the record
        was never changed. Every Nightlane record uses metadata label 8420, which is officially registered to
        Nightlane in Cardano&apos;s{" "}
        <a href="https://github.com/cardano-foundation/CIPs/pull/1323" target="_blank" rel="noopener noreferrer">
          CIP-0010 label registry
        </a>
        . You can look up any record on the <a href="/verify">Verified on Cardano</a> page.
      </p>
      <p style={p}>
        I&apos;m also testing private coverage proofs on the Midnight network, so a carrier can prove their
        insurance meets a broker&apos;s minimum without handing over the whole policy.
      </p>

      <h2 style={h2}>What hasn&apos;t changed</h2>
      <p style={p}>
        The goal is the same as day one: make trucking fairer and more transparent for the people actually moving
        the freight.
      </p>

      <DispatchNudge
        title="Need a dispatcher?"
        body="I also run Steady Wake Dispatch for owner-operators."
      />
    </div>
  );
}
