'use client';

import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function MiniChart({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js',
    config: {
      symbol,
      width: '100%',
      height: '100%',
      dateRange: '12M',
      isTransparent: false,
      autosize: true,
      largeChartUrl: '',
      colorTheme: theme,
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

const MemoizedMiniChart = memo(MiniChart);

export function TvMiniChartContent({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  return <MemoizedMiniChart symbol={symbol} />;
}
