export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-slate-900/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} NASA Bioscience Dashboard</span>
        <div className="flex items-center gap-4">
          <a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">NASA</a>
          <a href="https://genelab.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">GeneLab</a>
          <a href="#" className="hover:text-yellow-400">Contact</a>
        </div>
      </div>
    </footer>
  )
}


