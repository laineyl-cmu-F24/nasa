import { useState, useMemo } from "react"

export function useSearch(publications) {
  const [query, setQuery] = useState("")

  const filteredPublications = useMemo(() => {
    if (!query.trim()) return publications
    
    return publications.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.outcome.toLowerCase().includes(query.toLowerCase())
    )
  }, [publications, query])

  return {
    query,
    setQuery,
    filteredPublications
  }
}
