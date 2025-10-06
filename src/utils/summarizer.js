import { tokenize } from './searchUtils'

export function extractiveSummary(text, maxSentences = 6) {
  const raw = (text ?? '').toString()
  const sentences = raw.split(/(?<=[.!?。！？])\s+/).filter(s => s.trim().length > 0)
  if (sentences.length <= maxSentences) return sentences.join(' ')

  const allTokens = tokenize(raw)
  const freq = new Map()
  for (const t of allTokens) freq.set(t, (freq.get(t) ?? 0) + 1)
  const scoreSentence = (s) => tokenize(s).reduce((acc, t) => acc + (freq.get(t) ?? 0), 0)
  const ranked = sentences
    .map((s, i) => ({ s, i, score: scoreSentence(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s)
  return ranked.join(' ')
}

export default { extractiveSummary }

// Lightweight concise summary: TL;DR + short bullets
const STOPWORDS = new Set([
  'the','and','of','to','in','a','for','on','with','by','at','as','is','are','was','were','be','this','that','from','or','an','it','we','our','their','its','have','has','had','into','over','under','between','during','using','use','used','can','may','also','these','those','such','results','methods','conclusion','introduction','study','studies'
])

function extractKeywords(text, topK = 6) {
  const freq = new Map()
  for (const t of tokenize(text)) {
    if (STOPWORDS.has(t) || /^\d+$/.test(t) || t.length < 3) continue
    freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0, topK).map(([w])=>w)
}

export function conciseSummary(text, maxBullets = 3) {
  const raw = (text ?? '').toString()
  const sentences = raw.split(/(?<=[.!?。！？])\s+/).filter(s => s.trim().length > 0)
  if (!sentences.length) return { tldr: '', bullets: [], keywords: [] }

  const allTokens = tokenize(raw)
  const freq = new Map()
  for (const t of allTokens) freq.set(t, (freq.get(t) ?? 0) + 1)
  const scoreSentence = (s) => tokenize(s).reduce((acc, t) => acc + (freq.get(t) ?? 0), 0)
  const ranked = sentences
    .map((s, i) => ({ s, i, score: scoreSentence(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(maxBullets, 5))
    .sort((a, b) => a.i - b.i)
    .map(x => x.s.trim())

  const truncate = (s, n=160) => (s.length > n ? s.slice(0, n-1) + '…' : s)
  const tldr = truncate(ranked[0] || sentences[0], 180)
  const bullets = ranked.map(s => truncate(s, 140))
  const keywords = extractKeywords(raw, 6)
  return { tldr, bullets, keywords }
}

export const Summarizer = { extractiveSummary, conciseSummary }


