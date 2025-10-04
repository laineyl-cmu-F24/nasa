import { useState, useMemo } from "react"

export function useSearch(publications) {
  const [query, setQuery] = useState("")

  const filteredPublications = useMemo(() => {
    if (!query.trim()) return publications
    
    const searchTerm = query.toLowerCase()
    return publications.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.outcome.toLowerCase().includes(searchTerm) ||
        p.organism.toLowerCase().includes(searchTerm) ||
        p.year.toString().includes(searchTerm)
    )
  }, [publications, query])

  return {
    query,
    setQuery,
    filteredPublications
  }
}
