import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

export default function OrganismChart({ data }) {
  const COLORS = useMemo(() => {
    const baseColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8a2be2", "#5f9ea0", "#7fff00", "#d2691e"]
    return data.map((_, index) => baseColors[index % baseColors.length])
  }, [data])

  // 获取前三最多的类别
  const topThree = useMemo(() => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item, index) => ({
        ...item,
        color: COLORS[data.findIndex(d => d.name === item.name)],
        rank: index + 1
      }))
  }, [data, COLORS])

  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow" style={{ height: 500 }}>
      <h2 className="text-xl font-semibold mb-4">Organism Distribution</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
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
      
      {/* Top 3 categories */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Top Categories</h3>
        {topThree.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-200">
                #{item.rank} {item.name}
              </span>
            </div>
            <span className="text-slate-400 font-medium">
              {item.value} studies
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
