export default function PublicationCard({ publication }) {
  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg">{publication.title}</h3>
      <p className="text-sm text-slate-300">
        {publication.year} · {publication.organism} · {publication.outcome}
      </p>
      <a
        href={publication.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-400 underline text-sm"
      >
        View Full Text
      </a>
    </div>
  )
}
