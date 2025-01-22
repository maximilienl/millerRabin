
---

### 2. **Miller-Rabin Primality Test**

**Filename:** `millerRabin.js`

#### README

```markdown
# Miller-Rabin Primality Test

## Overview

The Miller-Rabin test is a probabilistic algorithm for determining if a number is prime. It works by testing whether a number satisfies certain properties of prime numbers using modular exponentiation and random bases.

Unlike deterministic algorithms, this test does not guarantee primality but provides a high probability of correctness.

---

## How It Works

1. Write \(n - 1\) as \(2^s \cdot d\), where \(d\) is odd.
2. Choose a random base \(a\).
3. Compute \(x = a^d \mod n\).
4. If \(x = 1 \, \text{or} \, n - 1\), the number passes the test for this base.
5. Otherwise, repeatedly square \(x\) and check if \(x \equiv n - 1 \, (\text{mod } n)\).
6. Repeat steps for \(k\) iterations to improve accuracy.

---

## Usage

### Function Signature
```javascript
function millerRabin(n, k) {
    // Implementation
}
