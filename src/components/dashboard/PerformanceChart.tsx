import { TrendingUp } from "lucide-react";
import { PerformanceMetric } from "../../lib/supabase";

interface PerformanceChartProps {
  data: PerformanceMetric[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const maxValue =
    Math.max(...data.flatMap((d) => [d.calls, d.deals, d.conversations])) || 1;

  const getY = (value: number) => {
    return 150 - (value / maxValue) * 130;
  };

  const createPath = (values: number[]) => {
    if (!values.length) return "";
    let path = `M 40 ${getY(values[0])}`;
    values.forEach((value, index) => {
      if (index > 0) {
        path += ` L ${40 + index * 80} ${getY(value)}`;
      }
    });
    return path;
  };

  const callsPath = createPath(data.map((d) => d.calls));
  const dealsPath = createPath(data.map((d) => d.deals));
  const conversationsPath = createPath(data.map((d) => d.conversations));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl  font-Gordita-Bold text-slate-900">
          Weekly Performance
        </h2>
        <TrendingUp size={22} className="text-emerald-500" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Calls"
          value={data.reduce((s, d) => s + d.calls, 0)}
          color="blue"
        />
        <StatCard
          label="Deals"
          value={data.reduce((s, d) => s + d.deals, 0)}
          color="emerald"
        />
        <StatCard
          label="Conversations"
          value={data.reduce((s, d) => s + d.conversations, 0)}
          color="purple"
        />
      </div>

      {/* Chart */}
      <div className="relative h-48 rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <svg viewBox="0 0 600 180" className="w-full h-full">
          <path
            d={conversationsPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
          />
          <path
            d={callsPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <path
            d={dealsPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {data.map((_, index) => (
            <text
              key={index}
              x={40 + index * 80}
              y="170"
              fill="#64748b"
              fontSize="12"
              textAnchor="middle"
            >
              {days[index] ?? ""}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ------------------ */
/* Small Stat Card */
/* ------------------ */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "emerald" | "purple";
}) {
  const colors = {
    blue: "border-blue-200 text-blue-600",
    emerald: "border-emerald-200 text-emerald-600",
    purple: "border-purple-200 text-purple-600",
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`h-2.5 w-2.5 rounded-full bg-current ${colors[color]}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl  font-Gordita-Bold text-slate-900">{value}</p>
    </div>
  );
}
