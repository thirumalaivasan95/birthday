// Fisher-Yates shuffle (non-mutating).
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pick N random items.
export function pickRandom(arr, n) {
  if (n >= arr.length) return shuffle(arr)
  return shuffle(arr).slice(0, n)
}

// Stable string hash → use to pick a deterministic-but-arbitrary item.
export function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
