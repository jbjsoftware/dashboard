'use client';

import { useEffect, useRef } from 'react';

interface UseTradingViewEmbedOptions {
  scriptSrc: string;
  config: Record<string, unknown>;
  theme?: 'light' | 'dark';
  deps?: unknown[];
}

export function useTradingViewEmbed({
  scriptSrc,
  config,
  theme = 'dark',
  deps = [],
}: UseTradingViewEmbedOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    // Create new script element
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;

    // Build config with theme
    // Note: Different TradingView widgets use different property names:
    // - Advanced Chart uses "theme"
    // - Other widgets use "colorTheme"
    // We set both to cover all cases
    const widgetConfig = {
      ...config,
      theme,
      colorTheme: theme,
      locale: 'en',
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptSrc, theme, ...deps]);

  return containerRef;
}
