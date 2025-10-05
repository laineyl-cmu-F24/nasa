export default function PublicationCard({ publication }) {
  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg">{publication.title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {publication.year && (
          <span className="inline-flex items-center rounded-full bg-slate-600/60 text-slate-200 px-2 py-0.5 text-xs">
            {publication.year}
          </span>
        )}
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
      <a
        href={publication.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-400 underline text-sm inline-block mt-3"
      >
        View Full Text
      </a>
    </div>
  )
}
