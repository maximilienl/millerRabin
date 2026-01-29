# Test de Primalité de Miller-Rabin

## Qu'est-ce que c'est ?

Miller-Rabin est un algorithme pour déterminer si un nombre est **probablement premier** ou **certainement composé**.

```javascript
millerRabin(104729n, 20)  // true  → probablement premier
millerRabin(100n, 20)     // false → certainement composé
```

C'est le test de primalité standard en cryptographie, utilisé notamment pour générer les clés RSA.

---

## Pourquoi c'est utile ?

### 1. Génération de clés RSA

RSA nécessite deux grands nombres premiers `p` et `q` :

```javascript
function generatePrime(bits) {
    while (true) {
        let candidate = randomOddBigInt(bits);
        if (millerRabin(candidate, 40)) {
            return candidate;
        }
    }
}

const p = generatePrime(1024);
const q = generatePrime(1024);
const n = p * q;  // Modulus RSA 2048 bits
```

### 2. Cryptographie en général

- Paramètres Diffie-Hellman
- Vérification de l'ordre des courbes elliptiques
- Protocoles zero-knowledge

### 3. Théorie des nombres

- Recherche de grands premiers
- Vérification de conjectures

---

## Précision du test

Miller-Rabin est probabiliste :

| Résultat | Signification |
|----------|---------------|
| `false` | **100% composé** (certain) |
| `true` | **Probablement premier** |

La probabilité d'erreur après `k` itérations est au maximum `(1/4)^k` :

| k | Probabilité d'erreur |
|---|---------------------|
| 10 | < 0.0001% |
| 20 | < 10⁻¹² |
| 40 | < 10⁻²⁴ |

Pour les petits nombres (n < 3.4×10¹⁴), l'implémentation utilise des témoins déterministes qui garantissent un résultat **100% certain**.

---

## Comment ça marche ?

### Principe

Si `p` est premier, alors pour tout témoin `a`, la séquence :

```
a^d, a^(2d), a^(4d), ..., a^(2^s × d) = a^(n-1)
```

doit soit commencer par `1`, soit contenir `-1` (c'est-à-dire `n-1`).

Si ce n'est pas le cas → `n` est **composé**.

### Étapes

1. Décomposer `n - 1 = 2^s × d` (d impair)
2. Choisir des témoins `a`
3. Pour chaque témoin, vérifier la condition ci-dessus
4. Si tous les témoins passent → probablement premier

---

## Utilisation

```javascript
// Test simple
millerRabin(97n, 20);  // true

// Avec plus d'itérations pour la crypto
millerRabin(largeNumber, 40);

// Générer un premier de 512 bits
function randomPrime(bits) {
    while (true) {
        let n = randomOddBigInt(bits);
        if (millerRabin(n, 40)) return n;
    }
}
```

### Paramètres

| Paramètre | Type | Description |
|-----------|------|-------------|
| `n` | `bigint` | Le nombre à tester |
| `k` | `number` | Nombre d'itérations (défaut: 20) |

### Retour

| Valeur | Signification |
|--------|---------------|
| `true` | Probablement premier |
| `false` | Certainement composé |

---

## Complexité

| Aspect | Valeur |
|--------|--------|
| Temps | O(k × log³ n) |
| Espace | O(log n) |

---

## Exemple : Génération de clé RSA

```javascript
function generateRSAKeyPair(bits = 2048) {
    const p = generatePrime(bits / 2);
    const q = generatePrime(bits / 2);
    
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    const e = 65537n;
    const d = modInverse(e, phi);
    
    return {
        publicKey: { n, e },
        privateKey: { n, d }
    };
}

function generatePrime(bits) {
    while (true) {
        let candidate = randomOddBigInt(bits);
        if (candidate % 3n === 0n) continue;
        if (millerRabin(candidate, 40)) return candidate;
    }
}
```

---

## Dépendances

Cette implémentation nécessite :
- `modPow(base, exp, mod)` - Exponentiation modulaire

---

## Références

- [Wikipedia - Miller-Rabin](https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test)
- Miller, G. (1976). "Riemann's Hypothesis and Tests for Primality"
- Rabin, M. (1980). "Probabilistic algorithm for testing primality"
