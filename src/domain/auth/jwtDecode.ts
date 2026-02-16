export type JwtPayload = Record<string, unknown>;

const normalizeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;

  if (padding === 0) {
    return base64;
  }

  return base64.padEnd(base64.length + (4 - padding), "=");
};

const decodeBase64 = (value: string) => {
  const normalized = normalizeBase64Url(value);
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

export const decodeJwtPayload = <T extends JwtPayload = JwtPayload>(
  token: string,
): T => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const payload = decodeBase64(parts[1]);

  return JSON.parse(payload) as T;
};
