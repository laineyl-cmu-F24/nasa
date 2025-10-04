import PublicationCard from "./PublicationCard"
import Pagination from "./Pagination"

export default function PublicationResults({ 
  publications, 
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange 
}) {
  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Search Results</h2>
        {totalItems > 0 && (
          <span className="text-sm text-slate-400">
            Found {totalItems} results
          </span>
        )}
      </div>
      
      {publications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No results found</p>
          <p className="text-slate-500 text-sm mt-2">
            Try using different keywords to search
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {publications.map((pub, i) => (
              <PublicationCard key={`${pub.link}-${i}`} publication={pub} />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  )
}
