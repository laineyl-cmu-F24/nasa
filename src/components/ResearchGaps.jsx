import { useState, useEffect } from "react"
import { Microscope, Sparkles, TrendingUp, Target, AlertCircle, RefreshCw } from "lucide-react"

function detectGaps(publications, { lowCountThreshold = 10, recentYears = 10 } = {}) {
  const gaps = []
  const pubs = Array.isArray(publications) ? publications : []

  // 1) low count per organism
  const countByOrganism = {}
  for (const p of pubs) {
    const org = (p.organism || 'Unknown').trim()
    countByOrganism[org] = (countByOrganism[org] || 0) + 1
  }
  for (const [org, count] of Object.entries(countByOrganism)) {
    if (count < lowCountThreshold) {
      gaps.push(`📉 Few studies on ${org} → potential gap`)
    }
  }

  // Prepare year buckets
  const years = pubs.map(p => p.year).filter(y => typeof y === 'number' && y > 0)
  const maxYear = years.length ? Math.max(...years) : null
  const splitYear = maxYear ? maxYear - (recentYears - 1) : null

  // 2) topic decline in recent decade (use outcome as topic)
  if (splitYear) {
    const topicCountsOld = {}
    const topicCountsNew = {}
    for (const p of pubs) {
      const topic = (p.outcome || 'General spaceflight effects').trim()
      const y = p.year
      if (typeof y === 'number' && y > 0) {
        if (y < splitYear) topicCountsOld[topic] = (topicCountsOld[topic] || 0) + 1
        else topicCountsNew[topic] = (topicCountsNew[topic] || 0) + 1
      }
    }
    for (const topic of Object.keys({ ...topicCountsOld, ...topicCountsNew })) {
      const oldC = topicCountsOld[topic] || 0
      const newC = topicCountsNew[topic] || 0
      if (oldC >= 5 && newC < oldC * 0.4) {
        gaps.push(`⏳ Decline in ${topic} research in recent decade → possible knowledge gap`)
      }
    }
  }

  // 3) research hiatus (no studies for a continuous range of years for an organism)
  const yearsByOrganism = {}
  for (const p of pubs) {
    const org = (p.organism || 'Unknown').trim()
    const y = p.year
    if (typeof y === 'number' && y > 0) {
      if (!yearsByOrganism[org]) yearsByOrganism[org] = new Set()
      yearsByOrganism[org].add(y)
    }
  }
  for (const [org, yearSet] of Object.entries(yearsByOrganism)) {
    const sorted = Array.from(yearSet).sort((a, b) => a - b)
    if (sorted.length < 2) continue
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      if (curr - prev > 1) {
        const start = prev + 1
        const end = curr - 1
        gaps.push(`⚠️ No ${org} studies between ${start} and ${end}`)
      }
    }
  }

  return gaps
}

export default function ResearchGaps({ publications }) {
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAI, setShowAI] = useState(false)
  
  const dynamicGaps = detectGaps(publications)

  // Create a stable key for publications to detect content changes
  const pubKey = `${publications.length}-${publications.map(p => p.title).join(',').slice(0, 100)}`

  useEffect(() => {
    // Reset AI analysis when publications change
    setAiAnalysis(null)
    setShowAI(false)
    setError(null)
    
    // Auto-trigger AI analysis when publications change and there are gaps
    if (publications.length > 0 && dynamicGaps.length > 0) {
      analyzeWithAI()
    }
  }, [pubKey, dynamicGaps.length])

  const analyzeWithAI = async () => {
    if (publications.length === 0) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publications: publications,
          rule_based_gaps: dynamicGaps
        })
      })
      
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      const data = await response.json()
      setAiAnalysis(data)
      setShowAI(true)
    } catch (e) {
      console.warn('AI analysis unavailable:', e)
      setError('AI analysis unavailable. Showing rule-based detection only.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Microscope className="w-6 h-6 text-green-400" />
          <span>Research Gap Analysis</span>
        </h2>
        <div className="flex items-center gap-2">
          {aiAnalysis && !loading && (
            <button
              onClick={() => {
                setAiAnalysis(null)
                setShowAI(false)
                analyzeWithAI()
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition flex items-center gap-1.5"
              title="Refresh AI analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {aiAnalysis && (
            <button
              onClick={() => setShowAI(!showAI)}
              className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAI ? 'Show Rules' : 'Show AI Analysis'}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[730px] overflow-y-auto pr-2 space-y-4">
        {!showAI ? (
          // Rule-Based Detection View
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-600">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-300">Rule-Based Detection</h3>
            </div>
            {dynamicGaps.length === 0 ? (
              <p className="text-slate-400 text-sm">No obvious gaps detected by baseline rules.</p>
            ) : (
              <ul className="space-y-2">
                {dynamicGaps.map((g, i) => (
                  <li key={i} className="text-slate-200 text-sm flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {!aiAnalysis && !loading && !error && (
              <button
                onClick={analyzeWithAI}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Analyze with AI
              </button>
            )}
            
            {loading && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Running AI analysis...
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">{error}</p>
              </div>
            )}
          </div>
        ) : (
          // AI Analysis View
          <div className="space-y-4">
            {/* Semantic Analysis */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-purple-300">AI Interpretation</h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{aiAnalysis.semantic_analysis}</p>
            </div>

            {/* Key Insights */}
            {aiAnalysis.key_insights?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-yellow-300">Key Insights</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.key_insights.map((insight, i) => (
                    <li key={i} className="text-slate-200 text-sm flex items-start gap-2 p-2 bg-slate-800/50 rounded">
                      <span className="text-yellow-400 font-bold mt-0.5">{i + 1}.</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Future Directions */}
            {aiAnalysis.future_directions?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-green-300">Future Research Directions</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.future_directions.map((direction, i) => (
                    <li key={i} className="text-slate-200 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">→</span>
                      <span>{direction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Priority Areas */}
            {aiAnalysis.priority_areas?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-red-300">High-Priority Areas</h3>
                </div>
                <div className="space-y-2">
                  {aiAnalysis.priority_areas.map((area, i) => (
                    <div key={i} className="p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30">
                      <p className="text-slate-200 text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
