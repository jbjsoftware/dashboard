'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { GripVertical } from 'lucide-react';
import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './widgets/tradingview/use-tradingview-embed';

function TradingViewWidget({ symbol = 'BINANCE:BTCUSDT' }: { symbol?: string }) {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
    config: {
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      style: '1',
      enable_publishing: false,
      backgroundColor: theme === 'dark' ? '#0F0F14' : '#FFFFFF',
      gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    },
    theme,
    deps: [symbol],
  });

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} key={`${symbol}-${theme}`}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

const MemoizedTradingViewWidget = memo(TradingViewWidget);

export function TradingViewChartContent({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  return <MemoizedTradingViewWidget symbol={symbol} />;
}

export function TradingViewChart() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">BTC/USDT Chart</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <TradingViewChartContent config={{ symbol: 'BINANCE:BTCUSDT' }} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
