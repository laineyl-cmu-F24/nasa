import { Microscope, AlertCircle, Loader2 } from "lucide-react"
import { useResearchGaps } from "../hooks/useResearchGaps"

export default function ResearchGaps({ searchQuery = '' }) {
  const { gaps, loading, error } = useResearchGaps(searchQuery)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-slate-300'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  return (
    <div className="mt-10 bg-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center space-x-2">
        <Microscope className="w-6 h-6 text-green-400" />
        <span>Potential Research Gaps</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">Error loading research gaps: {error}</span>
        </div>
      )}

      {loading && gaps.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-400">Loading research gaps...</span>
        </div>
      ) : gaps.length === 0 ? (
        <p className="text-slate-400">No research gaps found.</p>
      ) : (
        <ul className="space-y-3">
          {gaps.map((gap) => (
            <li key={gap.id} className="flex items-start space-x-3 p-3 bg-slate-600/50 rounded-lg">
              <span className="text-lg">{gap.icon}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-slate-200">{gap.title}</span>
                  <span className="text-sm">{getSeverityIcon(gap.severity)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-slate-500/50 ${getSeverityColor(gap.severity)}`}>
                    {gap.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{gap.description}</p>
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                  {gap.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
