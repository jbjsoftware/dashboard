'use client';

import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function SingleTicker({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js',
    config: {
      symbol,
      width: '100%',
      isTransparent: false,
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

const MemoizedSingleTicker = memo(SingleTicker);

export function TvSingleTickerContent({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  return <MemoizedSingleTicker symbol={symbol} />;
}
