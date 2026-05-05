'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@repo/ui/components/ui/chart';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { GripVertical, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { portfolioApi, type AssetAllocation } from '@/lib/api/portfolio';
import { usePrivacyStore } from '@/store/privacy-store';

import type { WidgetComponentProps } from 'dashboard-pkg';

// Color palette for assets
const ASSET_COLORS = [
  'hsl(48, 96%, 53%)',   // amber
  'hsl(188, 94%, 43%)',  // cyan
  'hsl(258, 90%, 66%)',  // purple
  'hsl(142, 71%, 45%)',  // green
  'hsl(350, 89%, 60%)',  // red
  'hsl(271, 91%, 65%)',  // violet
  'hsl(24, 95%, 53%)',   // orange
  'hsl(215, 16%, 47%)',  // slate
];

export function AssetAllocationContent(_props: WidgetComponentProps) {
  const [data, setData] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { masked } = usePrivacyStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allocations = await portfolioApi.getAllocations();
        setData(allocations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load allocations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return data.map((allocation, index) => ({
      ...allocation,
      symbol: allocation.currencyCode,
      name: allocation.currencyName || allocation.currencyCode,
      value: allocation.totalValueUsd,
      fill: ASSET_COLORS[index % ASSET_COLORS.length] || ASSET_COLORS[0]!,
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {
      value: { label: 'Value', color: 'hsl(var(--primary))' },
    };
    chartData.forEach((item) => {
      config[item.symbol] = {
        label: item.name,
        color: item.fill || ASSET_COLORS[0]!,
      };
    });
    return config;
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{error || 'No assets found'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[200px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => {
                    const nameStr = String(name);
                    const config = chartConfig[nameStr];
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{config?.label || nameStr}</span>
                        <span className="font-mono font-bold">
                          {masked ? '••••••' : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="symbol"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{
                    filter: 'drop-shadow(0 0 8px currentColor)',
                    opacity: 0.9,
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="space-y-2">
        {chartData.map((allocation) => (
          <div key={allocation.symbol} className="flex items-center justify-between text-sm transition-all hover:translate-x-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: allocation.fill }} />
              <span className="font-mono font-medium">{allocation.symbol}</span>
              <span className="text-muted-foreground text-xs">{allocation.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tabular-nums">{allocation.percentage.toFixed(1)}%</span>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {masked ? '••••••' : `$${allocation.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetAllocation() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Asset Allocation</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AssetAllocationContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
