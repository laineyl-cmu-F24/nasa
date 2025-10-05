import { useEffect, useMemo } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import PublicationResults from "./components/PublicationResults"
import OrganismChart from "./components/OrganismChart"
import ResearchGaps from "./components/ResearchGaps"
import Footer from "./components/Footer"
import About from "./components/About"
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

  const globalSummary = useMemo(() => {
    const totalCount = mockPubs.length
    const organismCounts = {}
    const outcomeCounts = {}

    mockPubs.forEach((p) => {
      const org = p.organism || 'Unknown'
      organismCounts[org] = (organismCounts[org] || 0) + 1
      const out = p.outcome || 'General spaceflight effects'
      outcomeCounts[out] = (outcomeCounts[out] || 0) + 1
    })

    const uniqueOrganismsCount = Object.keys(organismCounts).length

    const topOrganisms = Object.entries(organismCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const topOutcomes = Object.entries(outcomeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return { totalCount, uniqueOrganismsCount, topOrganisms, topOutcomes }
  }, [])

  return (
    <div className="relative min-h-screen text-white flex flex-col">
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

      <main className="max-w-6xl mx-auto px-4 flex-1 w-full">
        <SearchBar query={query} onQueryChange={setQuery} />

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
            <ResearchGaps />
            <About summary={globalSummary} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}