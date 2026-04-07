const requiredPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
};

export function getPublicEnv() {
  const missing = Object.entries(requiredPublicEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing public environment variables: ${missing.join(", ")}`
    );
  }

  return {
    supabaseUrl: requiredPublicEnv.NEXT_PUBLIC_SUPABASE_URL as string,
    supabaseAnonKey: requiredPublicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    apiBaseUrl: requiredPublicEnv.NEXT_PUBLIC_API_BASE_URL as string,
  };
}
