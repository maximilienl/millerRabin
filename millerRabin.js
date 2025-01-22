/**
 * Determines if a number is a probable prime using the Miller-Rabin Primality Test.
 * 
 * @param {bigint} n - The number to test for primality.
 * @param {number} k - The number of iterations for accuracy (higher is more accurate).
 * @returns {boolean} `true` if the number is probably prime, `false` if composite.
 * 
 * @example
 * const isPrime = millerRabin(97n, 5);
 * console.log(isPrime); // true
 */
function millerRabin(n, k) {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;

    let s = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
        d /= 2n;
        s += 1n;
    }

    for (let i = 0; i < k; i++) {
        const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;

        let composite = true;
        for (let j = 0n; j < s - 1n; j++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
    }

    return true;
}
