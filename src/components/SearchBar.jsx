import { Search } from "lucide-react"

export default function SearchBar({ query, onQueryChange }) {
  return (
    <div className="flex items-center bg-slate-700 rounded-xl p-2 mb-6 max-w-lg">
      <Search className="text-slate-300 ml-2" />
      <input
        type="text"
        className="bg-transparent outline-none px-3 w-full"
        placeholder="Search publications (title, organism, outcome, year)..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  )
}
