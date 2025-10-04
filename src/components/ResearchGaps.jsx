import { Microscope } from "lucide-react"

export default function ResearchGaps() {
  return (
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
  )
}
