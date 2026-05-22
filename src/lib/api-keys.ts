import { createHash, randomBytes } from "crypto";

export function generateApiKey() {
  const raw = `cf_${randomBytes(24).toString("base64url")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}
