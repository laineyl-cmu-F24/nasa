export default function PublicationCard({ publication }) {
  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{publication.title}</h3>
      
      {/* Author and Year */}
      <div className="mb-3 text-sm text-slate-300">
        {publication.author && publication.author !== "Unknown Author" && (
          <span className="font-medium text-slate-200">{publication.author}</span>
        )}
        {publication.year && (
          <span className="ml-2 text-slate-400">• {publication.year}</span>
        )}
      </div>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-2">
        {publication.organism && (
          <span className="inline-flex items-center rounded-full bg-slate-600/60 text-slate-200 px-2 py-0.5 text-xs">
            {publication.organism}
          </span>
        )}
        {publication.outcome && (
          <span className="inline-flex items-center rounded-full bg-slate-600/60 text-slate-200 px-2 py-0.5 text-xs">
            {publication.outcome}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="mt-3 flex gap-3">
        <a
          href={publication.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 underline text-sm hover:text-yellow-300 transition-colors"
        >
          View Full Text
        </a>
        {publication.pmcid && (
          <span className="text-slate-400 text-xs">
            PMC{publication.pmcid}
          </span>
        )}
      </div>
    </div>
  )
}
