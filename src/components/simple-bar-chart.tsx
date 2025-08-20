'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SimpleBarChartProps {
  data: { name: string; value: number }[]
  color?: string
}

export function SimpleBarChart({ data, color = '#8884d8' }: SimpleBarChartProps) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1)
  
  return (
    <div className="w-full h-64">
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1="40"
            y1={20 + 160 * (1 - ratio)}
            x2="380"
            y2={20 + 160 * (1 - ratio)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <text
            key={index}
            x="35"
            y={25 + 160 * (1 - ratio)}
            textAnchor="end"
            fontSize="12"
            fill="#6b7280"
          >
            {Math.round(maxValue * ratio)}
          </text>
        ))}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barWidth = 300 / data.length * 0.8
          const barSpacing = 300 / data.length * 0.2
          const barHeight = (item.value / maxValue) * 160
          const x = 40 + index * (barWidth + barSpacing)
          const y = 20 + 160 - barHeight
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
              />
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y="195"
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {item.name}
              </text>
              {/* Value label */}
              {item.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {item.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}