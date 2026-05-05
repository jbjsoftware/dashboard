'use client';

import { GripVertical } from 'lucide-react';
import { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { useTheme } from '@repo/ui/providers/theme-provider';

import { useTradingViewEmbed } from './widgets/tradingview/use-tradingview-embed';
import type { WidgetComponentProps } from 'dashboard-pkg';

function TopStories() {
  const { resolvedTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'light' ? 'light' : 'dark';

  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js',
    config: {
      displayMode: 'adaptive',
      feedMode: 'market',
      market: 'crypto',
      width: '100%',
      height: '100%',
    },
    theme,
    deps: [],
  });

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} key={`top-stories-${theme}`}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

const MemoizedTopStories = memo(TopStories);

export function TopStoriesContent(_props: WidgetComponentProps) {
  return <MemoizedTopStories />;
}

export function TopStoriesWidget() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Top Stories</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <TopStoriesContent config={{}} isFullscreen={false} />
      </CardContent>
    </Card>
  );
}
