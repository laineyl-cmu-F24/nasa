import PublicationCard from "./PublicationCard"

export default function PublicationResults({ publications }) {
  return (
    <div className="md:col-span-2 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Search Results</h2>
      {publications.map((pub, i) => (
        <PublicationCard key={i} publication={pub} />
      ))}
      {publications.length === 0 && (
        <p className="text-slate-400">No results found.</p>
      )}
    </div>
  )
}
