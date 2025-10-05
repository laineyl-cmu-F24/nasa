import { Rocket } from "lucide-react"

export default function Header() {
  return (
    <header className="mb-10">
      <div className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-700/60 backdrop-blur px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
            <Rocket className="text-yellow-400 w-4 h-4" />
            <span>NASA Bioscience</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
            Explore Spaceflight Bioscience Insights
          </h1>
          <p className="mt-3 md:mt-4 text-slate-200/80 text-base md:text-lg max-w-3xl">
            Search publications, visualize organisms studied, and uncover research gaps
            powering future missions.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-yellow-400/90 text-slate-900 px-3 py-1 text-xs font-semibold shadow">
              Publications
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-700/70 text-slate-100 px-3 py-1 text-xs ring-1 ring-white/10">
              Organisms
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-700/70 text-slate-100 px-3 py-1 text-xs ring-1 ring-white/10">
              Spaceflight Effects
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
