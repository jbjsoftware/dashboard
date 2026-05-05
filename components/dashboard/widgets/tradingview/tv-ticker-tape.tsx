'use client';

import { memo, useEffect, useRef } from 'react';

import { useTheme } from '@repo/ui/providers/theme-provider';

import type { WidgetComponentProps } from 'dashboard-pkg';

function TickerTape() {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load the script only once
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
      script.async = true;
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }
  }, []);

  const symbols = 'COINBASE:BTCUSDC,COINBASE:ETHUSDC,COINBASE:ADAUSDC,COINBASE:SUIUSDC,COINBASE:ONDOUSDC,COINBASE:COTIUSDC,COINBASE:GRTUSDC';

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} key={`ticker-tape-${theme}`}>
      <tv-ticker-tape symbols={symbols} theme={theme} display-mode="adaptive" hover-type="performance-grid" show-hover show-symbol-logo="true" />
    </div>
  );
}

const MemoizedTickerTape = memo(TickerTape);

export function TvTickerTapeContent(_props: WidgetComponentProps) {
  return <MemoizedTickerTape />;
}
