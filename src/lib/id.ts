import { randomBytes } from "crypto";

/**
 * Generates a short, URL-safe unique id (no external dependency required).
 * Not cryptographically sequential — fine for primary keys on a low-volume
 * internal tool like this one.
 */
export function createId(): string {
  return randomBytes(12).toString("base64url");
}
