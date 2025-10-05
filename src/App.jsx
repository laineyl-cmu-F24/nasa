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
    <div className="relative min-h-screen text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-top -z-10">

        <source src="src/galaxy_space.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
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