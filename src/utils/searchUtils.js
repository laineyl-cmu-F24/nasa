export function normalize(text) {
  return (text ?? '').toString().toLowerCase().normalize('NFKC').trim()
}

export function tokenize(text) {
  return normalize(text).split(/[^a-z0-9\u4e00-\u9fa5]+/).filter(Boolean)
}

export function jaccardSimilarity(aTokens, bTokens) {
  const A = new Set(aTokens)
  const B = new Set(bTokens)
  const inter = [...A].filter(x => B.has(x)).length
  const union = new Set([...aTokens, ...bTokens]).size
  return union === 0 ? 0 : inter / union
}

export function scoreSimilarity(queryText, docText) {
  const q = tokenize(queryText)
  const d = tokenize(docText)
  return jaccardSimilarity(q, d)
}


