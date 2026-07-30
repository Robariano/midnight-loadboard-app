export async function GET() {
          const matches = Object.keys(process.env)
            .filter((k) => k.toUpperCase().includes("CARRIER") || k.toUpperCase().includes("SESSION"))
            .map((k) => JSON.stringify(k));
          return Response.json({ matchingKeys: matches, totalEnvKeys: Object.keys(process.env).length });
}
