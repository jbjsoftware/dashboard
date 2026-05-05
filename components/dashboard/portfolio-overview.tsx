'use client';

import { TrendingUp, TrendingDown, GripVertical, AlertCircle, RefreshCw, LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { cn } from '@repo/ui/lib/utils';

import type { WidgetComponentProps } from 'dashboard-pkg';

import { portfolioApi, type PortfolioOverview as PortfolioOverviewData } from '@/lib/api/portfolio';
import { usePrivacyStore } from '@/store/privacy-store';

export function PortfolioOverviewContent(_props: WidgetComponentProps) {
  const [data, setData] = useState<PortfolioOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { masked } = usePrivacyStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await portfolioApi.getOverview();
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await portfolioApi.triggerSync();
      // Wait a moment for sync to complete, then refresh
      setTimeout(() => {
        fetchData();
        setSyncing(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync portfolio');
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error || 'Failed to load data'}</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} size="sm" variant="outline">
          <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
          {syncing ? 'Syncing...' : 'Sync Portfolio'}
        </Button>
      </div>
    );
  }

  const isPositive = data.totalChange24hPercent >= 0;
  const hasNoData = data.totalPortfolioValueUsd === 0 && data.connectedExchangesCount > 0;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';

  return (
    <div className="space-y-4 px-3">
      {data.connectionStatus === 'expired' && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500 mb-1">
                Connection expired
              </p>
              <p className="text-xs text-red-500/80 mb-2">
                Your {data.expiredExchanges.join(', ')} connection has expired. Reconnect to resume syncing.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/20"
                onClick={() => { window.location.href = `${apiUrl}/auth/coinbase`; }}
              >
                <LinkIcon className="mr-2 h-3 w-3" />
                Reconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      {hasNoData && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-500 mb-1">No portfolio data yet</p>
              <p className="text-xs text-amber-500/80 mb-2">Your exchange is connected, but we haven&apos;t synced your portfolio data yet. Click below to sync now.</p>
              <Button onClick={handleSync} disabled={syncing} size="sm" variant="outline" className="border-amber-500/20">
                <RefreshCw className={cn('mr-2 h-3 w-3', syncing && 'animate-spin')} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold tabular-nums">
            {masked
              ? '$••••••••'
              : `$${data.totalPortfolioValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 font-mono text-xs font-medium tabular-nums',
              isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500',
            )}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? '+' : ''}
            {data.totalChange24hPercent.toFixed(2)}%
          </div>
          <span className={cn('font-mono text-xs tabular-nums', isPositive ? 'text-emerald-500' : 'text-red-500')}>
            {masked
              ? '••••'
              : `${isPositive ? '+' : ''}$${Math.abs(data.totalChange24hUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
          <span className="text-muted-foreground text-xs">24h</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Exchanges</p>
          <p className="font-mono text-xs font-semibold tabular-nums">{data.connectedExchangesCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Last Updated</p>
          <p className="text-muted-foreground font-mono text-xs tabular-nums">{new Date(data.lastUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
}

export function PortfolioOverview() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Portfolio Value</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PortfolioOverviewContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
