import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

export default function OrganismChart({ data }) {
  const COLORS = useMemo(() => {
    const baseColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8a2be2", "#5f9ea0", "#7fff00", "#d2691e"]
    return data.map((_, index) => baseColors[index % baseColors.length])
  }, [data])

  // 获取前三最多的类别（用于概览展示）
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

  // 使用默认标签，避免复杂布局导致裁切

  return (
    <div className="bg-slate-700 rounded-xl p-6 shadow" style={{ height: 520 }}>
      <h2 className="text-xl font-semibold mb-4">Organism Distribution</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 12, right: 24, bottom: 8, left: 24 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            minAngle={6}
            paddingAngle={2}
            label
            labelLine
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
      <div className="mt-3 space-y-2">
        <h3 className="text-sm font-medium text-slate-300 mb-1">Top Categories</h3>
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
