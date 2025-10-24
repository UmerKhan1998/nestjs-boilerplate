// utils/tokenBlacklist.ts
const blacklistedTokens = new Set<string>();

export const addToBlacklist = (jti: string): void => {
  blacklistedTokens.add(jti);
};

export const isBlacklisted = (jti: string): boolean => {
  return blacklistedTokens.has(jti);
};
