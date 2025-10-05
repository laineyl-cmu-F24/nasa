import { FileSpreadsheet } from "lucide-react"

export default function About() {
  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <div>
        <div className="float-left mr-4 mb-2">
          <div className="w-14 h-14 rounded-xl bg-slate-600/60 ring-1 ring-white/10 flex items-center justify-center">
            <FileSpreadsheet className="w-7 h-7 text-yellow-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">About the CSV</h2>
        <p className="text-slate-200 text-sm leading-7">
          This CSV is a curated list of space bioscience publications. For each record, it
          includes the article title (Title), a link to the full text (Link), and an inferred
          organism (Inferred Organism) derived heuristically from the title. The dataset
          powers search and visualizations in this app, such as organism distribution and
          potential research gaps.
        </p>
        <ul className="text-slate-300/90 text-sm list-disc list-inside space-y-1 mt-3">
          <li>Fields: Title, Link, Inferred Organism</li>
          <li>Purpose: Enable search and high-level analytics</li>
          <li>Sources: Open-access links (e.g., PMC)</li>
        </ul>
        <div className="clear-both" />
      </div>
    </div>
  )
}


