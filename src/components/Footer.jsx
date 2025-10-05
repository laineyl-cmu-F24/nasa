export default function Footer() {
  const teamMembers = [
    "Lainey Liu",
    "Vicky Xie", 
    "Lara He",
    "Mona Fan"
  ]

  return (
    <footer className="relative mt-10">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-2 py-4">
        {/* Team Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h3 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Development Team
            </h3>
            <div className="flex flex-wrap gap-4">
              {teamMembers.map((member, index) => (
                <div key={index}>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <p className="text-white font-medium text-sm">{member}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright and Links */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="text-white font-semibold mb-2">
                © {new Date().getFullYear()} NASA Bioscience Dashboard
              </div>
              <p className="text-slate-400 text-sm">
                Powered by NASA GeneLab Data
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <a 
                href="https://www.nasa.gov/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 text-slate-300 hover:text-yellow-400 transition-all duration-300 transform hover:scale-110"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🚀</span>
                </div>
                <span className="font-medium">NASA</span>
              </a>
              <a 
                href="https://genelab.nasa.gov/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 text-slate-300 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🧬</span>
                </div>
                <span className="font-medium">GeneLab</span>
              </a>
              <a 
                href="https://github.com/laineyl-cmu-F24/nasa" 
                target="_blank" 
                rel="noopener noreferrer"  
                className="group flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-all duration-300 transform hover:scale-110"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💻</span>
                </div>
                <span className="font-medium">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


