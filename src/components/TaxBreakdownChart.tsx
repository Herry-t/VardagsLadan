interface TaxBreakdownChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  total: number;
}

export function TaxBreakdownChart({ data, total }: TaxBreakdownChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden bg-muted">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div
              key={index}
              className={`${item.color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
              title={`${item.label}: ${item.value.toLocaleString('sv-SE')} kr`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}