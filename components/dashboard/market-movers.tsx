'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@repo/ui/components/ui/chart';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { TrendingUp, TrendingDown, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { portfolioApi, type CurrencyPrice } from '@/lib/api/portfolio';

import type { WidgetComponentProps } from 'dashboard-pkg';

const chartConfig = {
  change: {
    label: '24h Change',
  },
};

export function MarketMoversContent(_props: WidgetComponentProps) {
  const [data, setData] = useState<CurrencyPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const prices = await portfolioApi.getPrices();
        setData(prices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prices');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort by absolute change percentage and take top 5
  const movers = useMemo(() => {
    return data
      .filter(p => p.change24hPercent !== null)
      .sort((a, b) => Math.abs(b.change24hPercent!) - Math.abs(a.change24hPercent!))
      .slice(0, 5)
      .map(p => ({
        symbol: p.currencyCode,
        change: p.change24hPercent!,
        price: p.priceUsd,
      }));
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[180px] w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || movers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{error || 'No price data available'}</p>
      </div>
    );
  }

  // Calculate dynamic domain based on data
  const maxChange = Math.max(...movers.map(m => Math.abs(m.change)));
  const domain = [-Math.ceil(maxChange), Math.ceil(maxChange)];

  return (
    <div className="space-y-4">
      <div className="h-[180px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            data={movers}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <XAxis
              dataKey="symbol"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="font-mono text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={domain}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value) => (
                    <span className={cn('font-mono font-bold', Number(value) >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                      {Number(value) >= 0 ? '+' : ''}{Number(value).toFixed(2)}%
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="change" radius={[4, 4, 0, 0]}>
              {movers.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.change >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="space-y-2">
        {movers.map((mover, index) => {
          const isPositive = mover.change >= 0;
          return (
            <div
              key={mover.symbol}
              className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 transition-all hover:translate-x-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-bold',
                  isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold">{mover.symbol}</p>
                  <p className={cn(
                    'font-mono text-xs tabular-nums',
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {isPositive ? '+' : ''}{mover.change.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-medium tabular-nums">
                  ${mover.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarketMovers() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Market Movers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MarketMoversContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
