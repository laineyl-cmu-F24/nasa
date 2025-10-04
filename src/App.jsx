import { useEffect, useMemo } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import PublicationResults from "./components/PublicationResults"
import OrganismChart from "./components/OrganismChart"
import ResearchGaps from "./components/ResearchGaps"
import { useSearch } from "./hooks/useSearch"
import { mockPubs } from "./data/mockData"

export default function App() {
  const { 
    query, 
    setQuery, 
    filteredPublications,
    allFilteredPublications,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
  } = useSearch(mockPubs, 8) // 每页显示8条结果

  useEffect(() => {
    console.log("Filtered Publications:", filteredPublications)
    console.log("All Filtered Publications:", allFilteredPublications)
    console.log("Mock Publications:", mockPubs)
  }, [filteredPublications, allFilteredPublications])

  const dynamicOrganismStats = useMemo(() => {
    const stats = {}
    allFilteredPublications.forEach((pub) => {
      stats[pub.organism] = (stats[pub.organism] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [allFilteredPublications])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <Header />
      
      <SearchBar query={query} onQueryChange={setQuery} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PublicationResults 
          publications={filteredPublications}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
        <OrganismChart data={dynamicOrganismStats} />
      </div>

      <ResearchGaps />
    </div>
  )
}