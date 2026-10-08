import crypto from "crypto";

export function generateApiKey() {
  const randomPart = crypto.randomBytes(32).toString("hex");

  const key = `ah_live_${randomPart}`;

  const prefix = key.slice(0, 13);

  const keyHash = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");

  return {
    key,
    prefix,
    keyHash,
  };
}

export function hashApiKey(key: string) {
  return crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
}