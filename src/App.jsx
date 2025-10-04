import { useState } from "react"
import { Search, Microscope, Rocket } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const mockPubs = [
  {
    title: "Effect of Microgravity on Bone Density in Mice",
    year: 2018,
    organism: "Mouse",
    outcome: "Bone loss",
    link: "https://pmc.ncbi.nlm.nih.gov/example1"
  },
  {
    title: "Immune Dysregulation in Astronauts after Long Duration Missions",
    year: 2020,
    organism: "Human",
    outcome: "Immune dysregulation",
    link: "https://pmc.ncbi.nlm.nih.gov/example2"
  },
  {
    title: "Root Growth in Arabidopsis Under Spaceflight Conditions",
    year: 2021,
    organism: "Plant",
    outcome: "Reduced root elongation",
    link: "https://pmc.ncbi.nlm.nih.gov/example3"
  },
]

const organismStats = [
  { name: "Human", value: 12 },
  { name: "Mouse", value: 20 },
  { name: "Plant", value: 8 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

export default function App() {
  const [query, setQuery] = useState("")

  const filtered = mockPubs.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.outcome.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <header className="mb-10 flex items-center space-x-3">
        <Rocket className="text-yellow-400 w-8 h-8" />
        <h1 className="text-3xl font-bold">NASA Bioscience Dashboard</h1>
      </header>

      {/* Search bar */}
      <div className="flex items-center bg-slate-700 rounded-xl p-2 mb-6 max-w-lg">
        <Search className="text-slate-300 ml-2" />
        <input
          type="text"
          className="bg-transparent outline-none px-3 w-full"
          placeholder="Search publications (e.g., bone, immune, plant)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Results */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Search Results</h2>
          {filtered.map((pub, i) => (
            <div
              key={i}
              className="bg-slate-700 rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{pub.title}</h3>
              <p className="text-sm text-slate-300">
                {pub.year} · {pub.organism} · {pub.outcome}
              </p >
              <a
                href= "_blank"
                className="text-yellow-400 underline text-sm"
              >
                View Full Text
              </a >
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-400">No results found.</p >
          )}
        </div>

        {/* Right: Visualization */}
        <div className="bg-slate-700 rounded-xl p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Organism Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={organismStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {organismStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gap Finder */}
      <div className="mt-10 bg-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center space-x-2">
          <Microscope className="w-6 h-6 text-green-400" />
          <span>Potential Research Gaps</span>
        </h2>
        <ul className="list-disc list-inside space-y-1 text-slate-200">
          <li>📉 Few studies on plants after 2021 (potential gap for Mars agriculture)</li>
          <li>⚠️ Limited combined radiation + microgravity studies</li>
          <li>🧬 Sparse long-duration (>180 days) immune system data</li>
        </ul>
      </div>
    </div>
  )
}