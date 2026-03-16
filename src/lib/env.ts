const fallbackUrl = "";
const fallbackAnonKey = "";

function sanitizeEnvValue(value?: string) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
}

function normalizeSupabaseUrl(value?: string) {
  const sanitized = sanitizeEnvValue(value);
  if (!sanitized) {
    return fallbackUrl;
  }

  const candidate = /^https?:\/\//i.test(sanitized) ? sanitized : `https://${sanitized}`;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

export const env = {
  supabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || fallbackAnonKey,
  supabaseServiceRoleKey: sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
