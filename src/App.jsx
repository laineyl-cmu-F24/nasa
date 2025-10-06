import { useEffect, useMemo, useState } from "react"
import HeroHeader from "./components/HeroHeader"
import SearchBar from "./components/SearchBar"
import PublicationResults from "./components/PublicationResults"
import OrganismChart from "./components/OrganismChart"
import ResearchGaps from "./components/ResearchGaps"
import Footer from "./components/Footer"
import AILabPage from "./pages/AILabPage"
import { useSearch } from "./hooks/useSearch"
import { mockPubs } from "./data/data"
import UploadSummarize from "./components/UploadSummarize"

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  
  const handlePageChange = (page) => {
    setActivePage(page)
    // 立即滚动到顶部，不使用动画
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
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


  // AI Lab Page
  if (activePage === 'ailab') {
    return (
      <div className="relative min-h-screen text-white">
        {/* Fixed Navigation Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#02092b] via-[#06237a] to-[#02092b] backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  NASA
                </h1>
                <h2 className="text-lg font-semibold text-white">
                  Bioscience Dashboard
                </h2>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <button 
                  onClick={() => handlePageChange('dashboard')}
                  className="px-3 py-1.5 rounded-lg transition text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button 
                  className="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 bg-white/20 text-white font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  PDF Analyzer
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20">
          <AILabPage corpus={mockPubs} />
        </div>
        <Footer />
      </div>
    )
  }

  // Dashboard Page (default)
  return (
    <div className="relative min-h-screen text-white flex flex-col">
      {/* Hero Header - Full Screen */}
      <HeroHeader currentPage={activePage} onNavigate={handlePageChange} />
      
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
        
        <main className="max-w-6xl mx-auto px-4 mt-8 mb-6 relative z-10 pt-20">
          <div className="mb-8">
            <SearchBar query={query} onQueryChange={setQuery} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-6">
              <PublicationResults 
                publications={filteredPublications}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
              
              {/* Upload & Summarize moved below search results */}
              <UploadSummarize corpus={allFilteredPublications} />
            </div>
            
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