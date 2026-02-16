import Constants from "expo-constants";
import { getOverride } from "./runtimeConfig";

// Use Expo `extra` (from app.config.js) if present, otherwise default to localhost.
const DEFAULT_LOCALHOST = "http://localhost:3000";
const EXTRA =
  (Constants.expoConfig && (Constants.expoConfig.extra as any)) || {};
const ENV_BASE = EXTRA.API_BASE_URL || DEFAULT_LOCALHOST;

export const getApiBaseUrl = (): string => {
  const override = getOverride();
  if (override) return override;
  // For Android emulator you might want to use 10.0.2.2 — developer can set override at runtime
  return ENV_BASE;
};

// Helper to build full URLs
export const apiUrl = (path: string) => {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default getApiBaseUrl;
