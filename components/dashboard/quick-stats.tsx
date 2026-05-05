'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { Zap, Wallet, Activity, GripVertical, AlertCircle, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { portfolioApi, type PortfolioStats } from '@/lib/api/portfolio';

import type { WidgetComponentProps } from 'dashboard-pkg';

export function QuickStatsContent(_props: WidgetComponentProps) {
  const [data, setData] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await portfolioApi.getStats();
        setData(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{error || 'Failed to load data'}</p>
      </div>
    );
  }

  const stats = [
    { label: 'Active Trades', value: data.activeTrades.toString(), icon: Activity },
    { label: 'Exchanges', value: data.connectedExchanges.toString(), icon: Wallet },
    { label: 'Total Assets', value: data.totalAssets.toString(), icon: Coins },
  ];

  return (
    <div className="grid gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">{stat.label}</p>
                <p className="font-mono text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function QuickStats() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Quick Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <QuickStatsContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
