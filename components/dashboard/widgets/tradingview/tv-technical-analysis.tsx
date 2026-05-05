'use client';

import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function TechnicalAnalysis({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  // Explicitly check for 'light', default to 'dark' for undefined/system/dark
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js',
    config: {
      interval: '1D',
      width: '100%',
      height: '100%',
      isTransparent: false,
      symbol,
      showIntervalTabs: true,
      displayMode: 'single',
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

const MemoizedTechnicalAnalysis = memo(TechnicalAnalysis);

export function TvTechnicalAnalysisContent({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  return <MemoizedTechnicalAnalysis symbol={symbol} />;
}
