'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { ArrowUpRight, ArrowDownLeft, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { useEffect, useState } from 'react';
import { portfolioApi, type Transaction } from '@/lib/api/portfolio';

import type { WidgetComponentProps } from 'dashboard-pkg';

// Helper function to format relative time
function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Helper to determine if transaction is a buy
function isBuyTransaction(type: string): boolean {
  const buyTypes = ['buy', 'deposit', 'receive', 'trade'];
  return buyTypes.some(t => type.toLowerCase().includes(t));
}

export function RecentTransactionsContent(_props: WidgetComponentProps) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await portfolioApi.getTransactions({ page: 1, limit: 5 });
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{error || 'No transactions found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((tx) => {
        const isBuy = isBuyTransaction(tx.transactionType);
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 transition-all hover:translate-x-1"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              )}>
                {isBuy ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold">{tx.currencyCode}</p>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium uppercase',
                    isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  )}>
                    {tx.transactionType}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {tx.exchangeName || 'Exchange'} • {formatRelativeTime(tx.transactionAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium tabular-nums">
                {Math.abs(tx.amount).toFixed(4)} {tx.currencyCode}
              </p>
              {tx.amountUsd && (
                <p className="text-muted-foreground font-mono text-xs tabular-nums">
                  ${Math.abs(tx.amountUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecentTransactions() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Recent Transactions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <RecentTransactionsContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
