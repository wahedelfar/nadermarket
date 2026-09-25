export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://wvtmaqintxtnxorxwupl.supabase.co",
  adminLoginEmail: process.env.ADMIN_LOGIN_EMAIL ?? "akardomiat@gmail.com",
  adminLoginUsername: process.env.ADMIN_LOGIN_USERNAME ?? "nader",
  adminLoginPassword: process.env.ADMIN_LOGIN_PASSWORD ?? "nadermarket",
};
