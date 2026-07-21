// const normalizeApiUrl = (url) => {
//   const fallback = "https://api.pilotbazar.com/";
//   const rawUrl = String(url || fallback).trim();
//   const withoutApiPrefix = rawUrl.replace(/\/api\/?$/i, "");

//   return withoutApiPrefix.endsWith("/") ? withoutApiPrefix : `${withoutApiPrefix}/`;
// };

// reads NEXT_PUBLIC_API_URL (set per-environment in .env/.env.docker/.env.local);
// falls back to production so a missing env var never silently breaks a deploy
export const API_URL = "https://api.pilotbazar.com/";
