import { useState, useMemo, useEffect } from "react"

const norm = (s) =>
  (s ?? "").toString().toLowerCase().normalize("NFKC").trim()

const tokenize = (s) =>
  norm(s).split(/[^a-z0-9\u4e00-\u9fa5]+/).filter(Boolean)

function diceBigram(a, b) {
  a = norm(a)
  b = norm(b)
  if (!a || !b) return 0
  if (a === b) return 1

  const grams = (t) =>
    Array.from({ length: Math.max(t.length - 1, 0) }, (_, i) =>
      t.slice(i, i + 2)
    )
  const A = grams(a)
  const B = grams(b)
  if (!A.length || !B.length) return 0

  const multiset = new Map()
  for (const g of A) multiset.set(g, (multiset.get(g) ?? 0) + 1)
  let inter = 0
  for (const g of B) {
    const c = multiset.get(g) ?? 0
    if (c > 0) {
      inter++
      multiset.set(g, c - 1)
    }
  }
  return (2 * inter) / (A.length + B.length)
}

export function useSearch(publications, itemsPerPage = 10) {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // 当搜索查询改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  const filteredPublications = useMemo(() => {
    if (!query.trim()) return publications

    const q = norm(query)
    const qTokens = tokenize(q)

    return publications
      .map((p) => {
        const title = norm(p.title)
        const outcome = norm(p.outcome)
        const organism = norm(p.organism)
        const year = String(p.year ?? "")

        const fullText = [title, outcome, organism, year].join(" ")

        let hits = 0
        for (const t of qTokens) {
          if (fullText.includes(t)) hits++
        }
        const hitScore = hits / qTokens.length

        const fuzzyScore = diceBigram(q, title)

        const score = 0.7 * hitScore + 0.3 * fuzzyScore

        return { ...p, _score: score }
      })
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score)
  }, [publications, query])

  // 计算分页数据
  const totalItems = filteredPublications.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = filteredPublications.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return {
    query,
    setQuery,
    filteredPublications: currentPageData,
    allFilteredPublications: filteredPublications,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange: handlePageChange,
  }
}
