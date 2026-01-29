// /!\ WARNING /!\
// IMPORT modPow from https://github.com/maximilienl/modPow/blob/main/modPow.js

/**
 * Determines if a number is a probable prime using the Miller-Rabin primality test.
 * 
 * This is the standard primality test used in cryptographic applications.
 * It returns `false` if the number is definitely composite, and `true` if
 * the number is probably prime with very high confidence.
 * 
 * For small values of n (< 3.4×10^14), deterministic witnesses are used,
 * guaranteeing a 100% accurate result. For larger values, the probability
 * of a false positive is at most (1/4)^k.
 * 
 * @param {bigint} n - The number to test for primality. Must be a positive integer.
 * @param {number} [k=20] - Number of random witnesses to test (ignored for small n 
 *                          where deterministic witnesses are used). Higher values 
 *                          increase accuracy. Recommended: 20-40 for cryptographic use.
 * @returns {boolean} `true` if n is probably prime, `false` if n is definitely composite.
 * 
 * @example
 * // Test a known prime
 * millerRabin(104729n, 20);  // true (104729 is the 10,000th prime)
 * 
 * @example
 * // Test a composite number
 * millerRabin(561n, 20);  // false (561 = 3 × 11 × 17, a Carmichael number)
 * 
 * @example
 * // Generate a random prime
 * function findPrime(bits) {
 *     while (true) {
 *         const candidate = randomOddBigInt(bits);
 *         if (millerRabin(candidate, 40)) return candidate;
 *     }
 * }
 */
function millerRabin(n, k = 20) {
    // Edge cases
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if ((n & 1n) === 0n) return false;
    
    // Factor n-1 as 2^s * d where d is odd
    let s = 0n;
    let d = n - 1n;
    while ((d & 1n) === 0n) {
        d >>= 1n;
        s += 1n;
    }
    
    // Get witnesses (deterministic for small n, random for large n)
    const witnesses = getDeterministicWitnesses(n) || generateRandomWitnesses(n, k);
    
    // Test each witness
    for (const a of witnesses) {
        if (!checkWitness(a, d, n, s)) {
            return false;  // Definitely composite
        }
    }
    
    return true;  // Probably prime
}


/**
 * Tests whether a single witness confirms that n might be prime.
 * 
 * This implements the core Miller-Rabin test for a single witness value.
 * If this function returns `false`, then n is definitely composite.
 * If it returns `true`, n might be prime (or the witness is a "liar").
 * 
 * @param {bigint} a - The witness to test. Must satisfy 2 ≤ a ≤ n-2.
 * @param {bigint} d - The odd part of n-1, where n-1 = 2^s × d.
 * @param {bigint} n - The number being tested for primality.
 * @param {bigint} s - The power of 2 in the factorization of n-1.
 * @returns {boolean} `true` if the witness doesn't prove n composite, 
 *                    `false` if n is definitely composite.
 * 
 * @private
 */
function checkWitness(a, d, n, s) {
    let x = modPow(a, d, n);
    
    if (x === 1n || x === n - 1n) return true;
    
    for (let j = 0n; j < s - 1n; j++) {
        x = (x * x) % n;
        if (x === n - 1n) return true;
    }
    
    return false;
}


/**
 * Returns a set of deterministic witnesses that guarantee accurate results for small n.
 * 
 * For n below certain thresholds, specific sets of witnesses have been proven
 * to give 100% accurate primality results (no false positives).
 * 
 * @param {bigint} n - The number being tested.
 * @returns {bigint[]|null} An array of witnesses if n is small enough, 
 *                          or `null` if random witnesses should be used.
 * 
 * @private
 * @see {@link https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Deterministic_variants}
 */
function getDeterministicWitnesses(n) {
    if (n < 2047n) return [2n];
    if (n < 1373653n) return [2n, 3n];
    if (n < 9080191n) return [31n, 73n];
    if (n < 25326001n) return [2n, 3n, 5n];
    if (n < 3215031751n) return [2n, 3n, 5n, 7n];
    if (n < 4759123141n) return [2n, 7n, 61n];
    if (n < 1122004669633n) return [2n, 13n, 23n, 1662803n];
    if (n < 3474749660383n) return [2n, 3n, 5n, 7n, 11n, 13n];
    if (n < 341550071728321n) return [2n, 3n, 5n, 7n, 11n, 13n, 17n];
    return null;
}


/**
 * Generates an array of cryptographically secure random witnesses.
 * 
 * @param {bigint} n - The number being tested. Must be > 4.
 * @param {number} k - The number of witnesses to generate.
 * @returns {bigint[]} An array of k random witnesses in the range [2, n-2].
 * 
 * @private
 */
function generateRandomWitnesses(n, k) {
    const witnesses = [];
    for (let i = 0; i < k; i++) {
        witnesses.push(randomBigIntInRange(2n, n - 2n));
    }
    return witnesses;
}


/**
 * Generates a cryptographically secure random BigInt in the range [min, max].
 * 
 * Uses rejection sampling to ensure uniform distribution across the range.
 * The underlying randomness comes from `crypto.getRandomValues()`.
 * 
 * @param {bigint} min - The minimum value (inclusive).
 * @param {bigint} max - The maximum value (inclusive). Must be ≥ min.
 * @returns {bigint} A random BigInt uniformly distributed in [min, max].
 * 
 * @example
 * randomBigIntInRange(1n, 100n);  // e.g., 42n
 * 
 * @example
 * // Random 256-bit number
 * const max = (1n << 256n) - 1n;
 * randomBigIntInRange(0n, max);
 */
function randomBigIntInRange(min, max) {
    const range = max - min + 1n;
    const bitsNeeded = range.toString(2).length;
    const bytesNeeded = Math.ceil(bitsNeeded / 8);
    const mask = (1n << BigInt(bitsNeeded)) - 1n;
    
    let result;
    do {
        const randomBytes = new Uint8Array(bytesNeeded);
        crypto.getRandomValues(randomBytes);
        
        result = 0n;
        for (const byte of randomBytes) {
            result = (result << 8n) | BigInt(byte);
        }
        result &= mask;
    } while (result >= range);
    
    return min + result;
}
