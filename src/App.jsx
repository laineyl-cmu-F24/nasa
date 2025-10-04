import { useEffect, useMemo } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import PublicationResults from "./components/PublicationResults"
import OrganismChart from "./components/OrganismChart"
import ResearchGaps from "./components/ResearchGaps"
import { useSearch } from "./hooks/useSearch"
import { mockPubs } from "./data/mockData"

export default function App() {
  const { query, setQuery, filteredPublications } = useSearch(mockPubs)

  useEffect(() => {
    console.log("Filtered Publications:", filteredPublications)
    console.log("Mock Publications:", mockPubs)
  }, [filteredPublications])

  const dynamicOrganismStats = useMemo(() => {
    const stats = {}
    filteredPublications.forEach((pub) => {
      stats[pub.organism] = (stats[pub.organism] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [filteredPublications])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <Header />
      
      <SearchBar query={query} onQueryChange={setQuery} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PublicationResults publications={filteredPublications} />
        <OrganismChart data={dynamicOrganismStats} />
      </div>

      <ResearchGaps />
    </div>
  )
}