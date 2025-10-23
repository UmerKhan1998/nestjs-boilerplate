// utils/tokenBlacklist.ts
// import { createClient } from 'redis';

// ✅ In-memory blacklist (useful for development or single-server setups)
const blacklistedTokens = new Set<string>();

export const addToBlacklist = (jti: string): void => {
  blacklistedTokens.add(jti);
};

export const isBlacklisted = (jti: string): boolean => {
  return blacklistedTokens.has(jti);
};

// 🧠 In production, use Redis instead of a Set (so it persists across servers):
// Example Redis-based implementation below 👇

// const client = createClient();

// client.on("error", (err) => console.error("Redis Client Error:", err));

// (async () => {
//   await client.connect();
// })();

// export const addToBlacklist = async (jti: string, ttl = 900): Promise<void> => {
//   await client.setEx(jti, ttl, "blacklisted"); // ttl = 900 sec = 15 min
// };

// export const isBlacklisted = async (jti: string): Promise<boolean> => {
//   const result = await client.get(jti);
//   return result !== null;
// };
