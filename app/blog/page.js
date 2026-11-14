export const metadata = {
  title: "Blog | Nightlane",
  description: "Articles for owner-operators and brokers: getting started with a new authority, carrier vetting and fraud.",
};

// Newest first. Add a row here when a post is added under app/blog/.
const posts = [
  {
    href: "/blog/new-authority-brokers-wont-work-with-me",
    tag: "For Owner-Operators",
    date: "Nov 14, 2026",
    title: "New Authority? Why Brokers Turn You Down, and How to Get Loads Anyway",
    blurb: "Why brokers set minimum authority ages, what they check in your packet, and six ways to start booking now.",
  },
  {
    href: "/blog/chameleon-carriers-tql-chrobinson-lawsuit",
    tag: "Broker Risk",
    date: "Oct 2, 2026",
    title: "The Vetting Blind Spot: What the TQL / C.H. Robinson Lawsuit Says About How Brokers Vet Carriers",
    blurb: "A federal racketeering complaint puts a number on the cost of one-time carrier vetting.",
  },
];

export default function BlogIndex() {
  return (
    <div>
      <h1 style={{ color: "#14181f", marginBottom: 20 }}>Blog</h1>
      {posts.map((post) => (
        <a key={post.href} href={post.href} style={{
          display: "block", textDecoration: "none", background: "#f7f8fa", border: "1px solid #e2e5ea",
          borderRadius: 12, padding: 18, marginBottom: 12,
        }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
            {post.tag} · {post.date}
          </span>
          <span style={{ display: "block", color: "#1d4ed8", fontWeight: 700, fontSize: 16, lineHeight: 1.4, marginBottom: 6 }}>
            {post.title}
          </span>
          <span style={{ display: "block", color: "#4b5568", fontSize: 14, lineHeight: 1.5 }}>{post.blurb}</span>
        </a>
      ))}
    </div>
  );
}
