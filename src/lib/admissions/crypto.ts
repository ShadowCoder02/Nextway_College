import crypto from "crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCKSIZE = 8;
const SCRYPT_PARALLELISM = 1;

/**
 * Generates a secure random salt and hashes the password using scrypt
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEYLEN,
      { N: SCRYPT_COST, r: SCRYPT_BLOCKSIZE, p: SCRYPT_PARALLELISM },
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString("hex"));
      },
    );
  });
  return { hash, salt };
}

/**
 * Verifies a password against the stored hash and salt in constant time
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEYLEN,
      { N: SCRYPT_COST, r: SCRYPT_BLOCKSIZE, p: SCRYPT_PARALLELISM },
      (err, derivedKey) => {
        if (err) {
          resolve(false);
          return;
        }
        try {
          const derivedHex = derivedKey.toString("hex");
          const storedBuf = Buffer.from(storedHash, "hex");
          const derivedBuf = Buffer.from(derivedHex, "hex");
          if (storedBuf.length !== derivedBuf.length) {
            resolve(false);
            return;
          }
          resolve(crypto.timingSafeEqual(storedBuf, derivedBuf));
        } catch {
          resolve(false);
        }
      },
    );
  });
}

/**
 * Generates a cryptographically strong random token
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Generates a formatted Application Number e.g. APP-2026-000125
 */
export function generateApplicationNumber(sequenceNumber?: number): string {
  const year = new Date().getFullYear();
  if (sequenceNumber !== undefined) {
    const padded = String(sequenceNumber).padStart(6, "0");
    return `APP-${year}-${padded}`;
  }
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${randomSuffix}`;
}

/**
 * Signs a payload with HMAC-SHA256 for tamper-proof cookies
 */
function getSigningSecret(): string {
  return process.env.APPLICANT_SESSION_SECRET || process.env.ADMIN_PASSWORD || "nwc-secure-salt-key-2026";
}

export function signToken(payload: string): string {
  const secret = getSigningSecret();
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySignedToken(signedToken: string): string | null {
  const parts = signedToken.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const secret = getSigningSecret();
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
