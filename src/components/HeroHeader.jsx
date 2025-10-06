import { useState, useEffect } from 'react'
import { ChevronDown, Search, Database, TrendingUp } from 'lucide-react'

export default function HeroHeader({ onScrollToContent, currentPage = 'dashboard', onNavigate }) {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false)

  useEffect(() => {
    // Force scroll to top and prevent browser scroll restoration
    const forceScrollToTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    
    // Immediate scroll to top
    forceScrollToTop()
    
    // Multiple attempts to ensure scroll position is maintained
    const timers = [
      setTimeout(forceScrollToTop, 0),
      setTimeout(forceScrollToTop, 50),
      setTimeout(forceScrollToTop, 100),
      setTimeout(forceScrollToTop, 200)
    ]
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 5)
      
      // 第一次滚动时触发自动滚动效果
      if (currentScrollY > 0 && currentScrollY < window.innerHeight && !hasAutoScrolled) {
        setHasAutoScrolled(true)
        // Custom smooth scroll from current position
        const startPosition = currentScrollY
        const targetPosition = window.innerHeight
        const distance = targetPosition - startPosition
        const duration = 2500 // 1.5 seconds
        let startTime = null

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime
          const timeElapsed = currentTime - startTime
          const progress = Math.min(timeElapsed / duration, 1)
          
          // Easing function for smooth animation
          const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2
          
          window.scrollTo(0, startPosition + distance * easeInOutCubic)
          
          if (progress < 1) {
            requestAnimationFrame(animation)
          }
        }
        
        requestAnimationFrame(animation)
      }
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasAutoScrolled])

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* Fixed Header - appears when scrolled */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="bg-gradient-to-r from-[#02092b] via-[#06237a] to-[#02092b] backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
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
                  onClick={() => onNavigate?.('dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === 'dashboard' 
                      ? 'bg-white/20 text-white font-semibold' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => onNavigate?.('ailab')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                    currentPage === 'ailab' 
                      ? 'bg-white/20 text-white font-semibold' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
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
      </div>

      {/* Full Screen Hero */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#02092b] via-[#06237a] to-[#02092b]">
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        {/* Main Title */}
        <div className="mb-8" style={{
          transform: hasAutoScrolled 
            ? `translateY(${scrollY * 0.3}px) scale(${Math.max(0.8, 1 - scrollY * 0.0003)})`
            : `translateY(${scrollY * 0.5}px) scale(${1 - scrollY * 0.0001})`,
          opacity: hasAutoScrolled 
            ? Math.max(0.3, 1 - scrollY * 0.001)
            : 1
        }}>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            NASA
          </h1>
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6">
            Bioscience Dashboard
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Explore space biology research, discover research gaps, and analyze organism studies from NASA GeneLab
          </p>
        </div>

        {/* Feature Cards */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          style={{
            transform: hasAutoScrolled
              ? `translateY(${scrollY * 0.2}px) scale(${Math.max(0.9, 1 - scrollY * 0.0002)})`
              : `translateY(${scrollY * 0.3}px) scale(${1 - scrollY * 0.0002})`,
            opacity: hasAutoScrolled
              ? Math.max(0.2, 1 - scrollY * 0.0015)
              : Math.max(0, 1 - scrollY * 0.002)
          }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <Search className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Smart Search</h3>
            <p className="text-slate-300 text-sm">Find publications by title, organism, outcome, and year</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <Database className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Rich Data</h3>
            <p className="text-slate-300 text-sm">Access comprehensive NASA GeneLab research database</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Research Insights</h3>
            <p className="text-slate-300 text-sm">Discover patterns and gaps in space biology research</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{
            transform: hasAutoScrolled
              ? `translateX(-50%) translateY(${scrollY * 0.1}px)`
              : `translateX(-50%) translateY(${scrollY * 0.2}px)`,
            opacity: hasAutoScrolled
              ? Math.max(0, 1 - scrollY * 0.002)
              : Math.max(0, 1 - scrollY * 0.003)
          }}
        >
          <button
            onClick={handleScrollDown}
            className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-300 group"
          >
            <span className="text-sm mb-2 font-medium animate-pulse">Scroll to Explore</span>
            <ChevronDown className="w-6 h-6 animate-bounce group-hover:animate-none" />
          </button>
        </div>

      </div>

      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
          style={{ width: `${Math.min((scrollY / window.innerHeight) * 100, 100)}%` }}
        />
      </div>
      </div>
    </>
  )
}
