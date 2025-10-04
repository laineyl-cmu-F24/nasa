import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

export default function OrganismChart({ data }) {
  const COLORS = useMemo(() => {
    const baseColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8a2be2", "#5f9ea0", "#7fff00", "#d2691e"]
    return data.map((_, index) => baseColors[index % baseColors.length])
  }, [data])

  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow">
      <h2 className="text-xl font-semibold mb-4">Organism Distribution</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
