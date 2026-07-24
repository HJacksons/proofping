import "server-only";

const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
] as const;

/** Synthetic / unknown codes some CDNs emit — do not store. */
const IGNORED_COUNTRY_CODES = new Set([
  "XX",
  "T1",
  "A1",
  "A2",
  "O1",
]);

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;

export function normalizeCountryCode(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const code = value.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code) || IGNORED_COUNTRY_CODES.has(code)) {
    return null;
  }

  return code;
}

export function countryCodeFromHeaders(headers: Headers) {
  for (const key of COUNTRY_HEADER_KEYS) {
    const normalized = normalizeCountryCode(headers.get(key));
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function extractClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    for (const part of forwarded.split(",")) {
      const candidate = part.trim();
      if (candidate && isPublicIp(candidate)) {
        return candidate;
      }
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isPublicIp(realIp)) {
    return realIp;
  }

  return null;
}

export function isPublicIp(value: string) {
  if (value.includes(":")) {
    // Skip IPv6 lookup for now (many free geo endpoints are IPv4-first).
    return false;
  }

  if (!IPV4_PATTERN.test(value)) {
    return false;
  }

  const parts = value.split(".").map((part) => Number(part));
  const [a, b] = parts;

  if (a === 10 || a === 127 || a === 0) {
    return false;
  }
  if (a === 169 && b === 254) {
    return false;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return false;
  }
  if (a === 192 && b === 168) {
    return false;
  }
  if (a >= 224) {
    return false;
  }

  return true;
}

type IpWhoResponse = {
  success?: boolean;
  country_code?: string;
};

async function lookupCountryCode(ip: string | null) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const path = ip
      ? `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`
      : "https://ipwho.is/?fields=success,country_code";
    const response = await fetch(path, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as IpWhoResponse;
    if (payload.success === false) {
      return null;
    }

    return normalizeCountryCode(payload.country_code);
  } catch {
    return null;
  }
}

function allowLocalEgressCountryFallback() {
  // Local `next dev` has no CDN country header and client IP is 127.0.0.1.
  // Looking up the server egress IP then matches the developer machine's public net.
  // Never do this in production — egress would be the host (e.g. Vercel), not the user.
  return process.env.NODE_ENV !== "production";
}

/**
 * Resolve ISO country from the connection. Prefer CDN/edge headers.
 * Fallback: short public-IP lookup. The IP is never returned or stored.
 */
export async function resolveRequestCountryCode(headers: Headers) {
  const fromHeaders = countryCodeFromHeaders(headers);
  if (fromHeaders) {
    return fromHeaders;
  }

  const ip = extractClientIp(headers);
  if (ip) {
    return lookupCountryCode(ip);
  }

  if (allowLocalEgressCountryFallback()) {
    return lookupCountryCode(null);
  }

  return null;
}

export function countryDisplayName(countryCode: string) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}
