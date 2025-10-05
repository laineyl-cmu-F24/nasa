import { Microscope } from "lucide-react"

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
    let gapStart = null
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

export default function ResearchGaps({ publications, role }) {
  const dynamicGaps = detectGaps(publications)

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center space-x-2">
        <Microscope className="w-6 h-6 text-green-400" />
        <span>Potential Research Gaps</span>
      </h2>
      {dynamicGaps.length === 0 ? (
        <p className="text-slate-300 text-sm">No obvious gaps detected by baseline rules.</p>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-slate-200">
          {dynamicGaps.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
