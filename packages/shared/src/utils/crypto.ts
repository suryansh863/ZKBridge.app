import { createHash, createHmac } from 'crypto';

/**
 * Generate a SHA-256 hash of the input.
 * Supports string (hex) or Buffer.
 */
export function sha256(input: string | Buffer): Buffer {
  if (typeof input === 'string') {
    // If it's a hex string, convert to buffer
    const cleanHex = input.startsWith('0x') ? input.slice(2) : input;
    return createHash('sha256').update(Buffer.from(cleanHex, 'hex')).digest();
  }
  return createHash('sha256').update(input).digest();
}

/**
 * Generate a double SHA-256 hash (Bitcoin style)
 */
export function doubleSha256(input: string | Buffer): string {
  const firstHash = sha256(input);
  const secondHash = sha256(firstHash);
  return secondHash.toString('hex');
}

/**
 * Generate a Merkle root from an array of transaction hashes
 */
export function generateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) {
    throw new Error('Cannot generate Merkle root from empty array');
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  const nextLevel: string[] = [];

  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || left; // Bitcoin style: duplicate if odd

    // Concatenate raw bytes, not hex strings
    const combined = Buffer.concat([
      Buffer.from(left, 'hex').reverse(),
      Buffer.from(right, 'hex').reverse()
    ]);

    const hash = doubleSha256(combined);
    // Bitcoin hashes are displayed in little-endian hex in explorers, 
    // but internal calculations often require reversal.
    // Here we return the hex string (which we'll reverse back when needed).
    nextLevel.push(Buffer.from(hash, 'hex').reverse().toString('hex'));
  }

  return generateMerkleRoot(nextLevel);
}

/**
 * Generate a Merkle proof for a specific transaction
 */
export function generateMerkleProof(hashes: string[], targetHash: string): {
  path: string[];
  indices: number[];
  root: string;
} {
  const path: string[] = [];
  const indices: number[] = [];

  let currentHashes = [...hashes];
  let targetIndex = currentHashes.indexOf(targetHash);

  if (targetIndex === -1) {
    throw new Error('Target hash not found in the list');
  }

  while (currentHashes.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentHashes.length; i += 2) {
      const left = currentHashes[i];
      const right = currentHashes[i + 1] || left;

      const combined = Buffer.concat([
        Buffer.from(left, 'hex').reverse(),
        Buffer.from(right, 'hex').reverse()
      ]);

      const hash = Buffer.from(doubleSha256(combined), 'hex').reverse().toString('hex');
      nextLevel.push(hash);

      if (i === targetIndex || i === targetIndex - 1) {
        // If we are on the left, the sibling is on the right, and vice versa.
        // For Merkle proofs, the "index" or side matters.
        if (i === targetIndex) {
          path.push(right);
          indices.push(1); // 1 = sibling is on the right
        } else {
          path.push(left);
          indices.push(0); // 0 = sibling is on the left
        }
      }
    }

    targetIndex = Math.floor(targetIndex / 2);
    currentHashes = nextLevel;
  }

  return {
    path,
    indices,
    root: currentHashes[0]
  };
}

/**
 * Verify a Merkle proof
 */
export function verifyMerkleProof(
  leaf: string,
  path: string[],
  indices: number[],
  root: string
): boolean {
  let currentHash = leaf;

  for (let i = 0; i < path.length; i++) {
    const sibling = path[i];
    const isSiblingRight = indices[i] === 1;

    let combined: Buffer;
    if (isSiblingRight) {
      combined = Buffer.concat([
        Buffer.from(currentHash, 'hex').reverse(),
        Buffer.from(sibling, 'hex').reverse()
      ]);
    } else {
      combined = Buffer.concat([
        Buffer.from(sibling, 'hex').reverse(),
        Buffer.from(currentHash, 'hex').reverse()
      ]);
    }

    currentHash = Buffer.from(doubleSha256(combined), 'hex').reverse().toString('hex');
  }

  return currentHash === root;
}

/**
 * Generate a random nonce for ZK proofs
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

