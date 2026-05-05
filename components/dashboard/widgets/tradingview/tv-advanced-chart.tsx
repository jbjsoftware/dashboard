'use client';

import { memo } from 'react';

import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function AdvancedChart({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  // Explicitly check for 'light', default to 'dark' for undefined/system/dark
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
    config: {
      allow_symbol_change: true,
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

const MemoizedAdvancedChart = memo(AdvancedChart);

export function TvAdvancedChartContent({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  return <MemoizedAdvancedChart symbol={symbol} />;
}
