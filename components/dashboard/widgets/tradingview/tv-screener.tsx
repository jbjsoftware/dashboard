'use client';

import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function Screener() {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
    config: {
      width: '100%',
      height: '100%',
      defaultColumn: 'overview',
      defaultScreen: 'general',
      market: 'crypto',
      showToolbar: true,
      isTransparent: false,
      colorTheme: theme,
    },
    theme,
    deps: [],
  });

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} key={`screener-${theme}`}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

const MemoizedScreener = memo(Screener);

export function TvScreenerContent(_props: WidgetComponentProps) {
  return <MemoizedScreener />;
}
