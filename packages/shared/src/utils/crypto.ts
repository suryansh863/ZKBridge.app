import { createHash, createHmac } from 'crypto';

/**
 * Generate a SHA-256 hash of the input
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a double SHA-256 hash (Bitcoin style)
 */
export function doubleSha256(input: string): string {
  return sha256(sha256(input));
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

  // Ensure even number of hashes by duplicating the last one if odd
  const evenHashes = hashes.length % 2 === 0 ? hashes : [...hashes, hashes[hashes.length - 1]];
  
  const nextLevel: string[] = [];
  
  for (let i = 0; i < evenHashes.length; i += 2) {
    const combined = evenHashes[i] + evenHashes[i + 1];
    nextLevel.push(doubleSha256(combined));
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
    const isEven = currentHashes.length % 2 === 0;
    const evenHashes = isEven ? currentHashes : [...currentHashes, currentHashes[currentHashes.length - 1]];
    
    const nextLevel: string[] = [];
    
    for (let i = 0; i < evenHashes.length; i += 2) {
      const combined = evenHashes[i] + evenHashes[i + 1];
      const hash = doubleSha256(combined);
      nextLevel.push(hash);
      
      // If our target is in this pair, add the sibling to the path
      if (i === targetIndex || i === targetIndex - 1) {
        const siblingIndex = i === targetIndex ? i + 1 : i;
        path.push(evenHashes[siblingIndex]);
        indices.push(i === targetIndex ? 1 : 0);
      }
    }
    
    // Update target index for next level
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
    const isRight = indices[i] === 1;
    
    const combined = isRight ? sibling + currentHash : currentHash + sibling;
    currentHash = doubleSha256(combined);
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

