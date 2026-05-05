'use client';

import { memo } from 'react';
import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';
import { useTradingViewEmbed } from './use-tradingview-embed';

function Heatmap() {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js',
    config: {
      dataSource: 'Crypto',
      blockSize: 'market_cap_calc',
      blockColor: 'change',
      hasTopBar: false,
      isDataSet498Enabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: '100%',
      height: '100%',
      isTransparent: true,
    },
    theme,
    deps: [],
  });

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} key={`heatmap-${theme}`}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

const MemoizedHeatmap = memo(Heatmap);

export function TvHeatmapContent(_props: WidgetComponentProps) {
  return <MemoizedHeatmap />;
}
