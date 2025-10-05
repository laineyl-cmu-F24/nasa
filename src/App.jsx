import { useEffect, useMemo } from "react"
import HeroHeader from "./components/HeroHeader"
import SearchBar from "./components/SearchBar"
import PublicationResults from "./components/PublicationResults"
import OrganismChart from "./components/OrganismChart"
import ResearchGaps from "./components/ResearchGaps"
import Footer from "./components/Footer"
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
  } = useSearch(mockPubs, 7)

  // Force scroll to top on page load/refresh and prevent browser from restoring scroll position
  useEffect(() => {
    // Immediately set scroll position to top
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    
    // Force scroll to top after a short delay to override browser behavior
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

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
    <div className="relative min-h-screen text-white flex flex-col">
      {/* Hero Header - Full Screen */}
      <HeroHeader />
      
      {/* Main Content with Original Background */}
      <div className="relative flex-1">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top -z-10">
          <source src="src/galaxy_space.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <main className="max-w-6xl mx-auto px-4 py-12 relative z-10 pt-20">
          <div className="mb-8">
            <SearchBar query={query} onQueryChange={setQuery} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <PublicationResults 
              publications={filteredPublications}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
            <div className="space-y-6">
              <OrganismChart data={dynamicOrganismStats} />
              <ResearchGaps publications={allFilteredPublications} />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}