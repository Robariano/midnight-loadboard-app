export async function GET() {
        const check = (k) => ({ set: !!process.env[k], len: (process.env[k] || "").length });
        return Response.json({
                  CARRIER_SESSION_SECRET: check("CARRIER_SESSION_SECRET"),
                  ADMIN_PASSWORD: check("ADMIN_PASSWORD"),
                  RESEND_API_KEY: check("RESEND_API_KEY"),
                  SUPABASE_SERVICE_ROLE_KEY: check("SUPABASE_SERVICE_ROLE_KEY"),
                  NEXT_PUBLIC_SUPABASE_URL: check("NEXT_PUBLIC_SUPABASE_URL"),
                  VERCEL_ENV: process.env.VERCEL_ENV || null,
        });
}
