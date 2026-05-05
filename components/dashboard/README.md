# Dashboard Widget System

Configurable drag-and-drop dashboard built on `react-grid-layout`. Users can add, remove, resize, and reorder widgets from a registry of portfolio components and TradingView embeds.

## Architecture

```
dashboard/
  dashboard-grid.tsx           # Main grid — reads config, renders widgets, handles layout
  quick-add-sheet.tsx           # Right-side Sheet for adding widgets
  widget-symbol-picker.tsx      # Symbol selector (BINANCE:BTCUSDT, etc.)
  widgets/
    types.ts                    # Core type definitions
    registry.ts                 # All widget definitions + lookup helpers
    base-widget.tsx             # Shared Card/header/drag-handle/fullscreen wrapper
    widget-renderer.tsx         # Maps definition + config → BaseWidget + component
    tradingview/
      use-tradingview-embed.ts  # Shared hook for TV script injection
      tv-advanced-chart.tsx     # Full chart with indicators
      tv-mini-chart.tsx         # Compact price chart
      tv-symbol-overview.tsx    # Price + area chart
      tv-ticker-tape.tsx        # Horizontal scrolling ticker
      tv-single-ticker.tsx      # Single symbol ticker
      tv-screener.tsx           # Market screener table
      tv-heatmap.tsx            # Market cap heatmap
      tv-technical-analysis.tsx # Buy/sell/neutral gauges
  portfolio-overview.tsx        # Portfolio value + 24h change
  quick-stats.tsx               # Active trades, exchanges, alerts
  asset-allocation.tsx          # Donut chart of holdings
  market-movers.tsx             # Top gainers/losers bar chart
  recent-transactions.tsx       # Transaction history list
  btc-cycles.tsx                # BTC bull/bear cycle timeline
  trading-view-chart.tsx        # Legacy wrapper (uses shared TV hook)
  top-stories.tsx               # Crypto news (uses shared TV hook)

hooks/
  use-dashboard-config.ts       # Widget state management (localStorage)

app/(authenticated)/dashboard/
  widgets/page.tsx              # Full widget gallery page
```

## Key Concepts

### Widget Definition vs Widget Instance

A **WidgetDefinition** (in `registry.ts`) describes a widget type — its name, icon, category, default size, and React component. There are 15 definitions total.

A **WidgetInstance** (in the user's saved config) represents a widget on the dashboard — a unique `id`, a `type` referencing a definition, and per-instance `config` (e.g. which symbol to display).

```
WidgetDefinition (registry)     WidgetInstance (user config)
┌─────────────────────────┐     ┌──────────────────────────────┐
│ type: "tv-mini-chart"   │     │ id: "tv-mini-chart-170..."   │
│ name: "Mini Chart"      │◄────│ type: "tv-mini-chart"        │
│ component: TvMiniChart  │     │ config: { symbol: "...ETH" } │
│ requiresSymbol: true    │     └──────────────────────────────┘
│ defaultSymbol: "...BTC" │
└─────────────────────────┘
```

### Content Component Pattern

Each widget exports two things:

1. **`FooContent`** — the inner content, accepts `WidgetComponentProps` (`{ config, isFullscreen }`). This is what the registry references.
2. **`Foo`** — standalone Card-wrapped version (legacy, not used by the grid but kept for potential standalone use).

### Data Flow

```
useDashboardConfig()          dashboard-grid.tsx              WidgetRenderer
┌───────────────────┐    ┌──────────────────────────┐    ┌──────────────────┐
│ localStorage      │───►│ mergeLayoutsWithWidgets() │───►│ BaseWidget       │
│ widget instances   │    │ ResponsiveGridLayout      │    │   └ Component    │
│ add/remove/update │    │ layout positions          │    └──────────────────┘
└───────────────────┘    └──────────────────────────┘
```

Two localStorage keys:

| Key | Contents |
|-----|----------|
| `dashboard-widget-config` | Which widgets exist and their configs (`DashboardConfig`) |
| `dashboard-layout` | Grid positions/sizes per breakpoint (`ResponsiveLayouts`) |

## Adding a New Widget

### 1. Create the component

Create a file exporting a component that accepts `WidgetComponentProps`:

```tsx
// dashboard/my-widget.tsx
'use client';

import type { WidgetComponentProps } from './widgets/types';

export function MyWidgetContent({ config, isFullscreen }: WidgetComponentProps) {
  return <div>...</div>;
}
```

### 2. Register it

Add an entry to `widgetRegistry` in `widgets/registry.ts`:

```tsx
import { MyWidgetContent } from '../my-widget';

// Add to the array:
{
  type: 'my-widget',
  name: 'My Widget',
  description: 'What it does',
  icon: SomeLucideIcon,
  category: 'portfolio',           // or a tradingview-* category
  defaultSize: { w: 4, h: 3 },
  minSize: { minW: 3, minH: 2 },
  supportsFullscreen: false,
  requiresSymbol: false,
  component: MyWidgetContent,
}
```

That's it. The widget will appear in the Quick Add Sheet and Gallery page. No changes to `dashboard-grid.tsx` needed.

### 3. Adding a TradingView widget

Use the shared hook:

```tsx
// widgets/tradingview/tv-my-embed.tsx
'use client';

import { memo } from 'react';
import type { WidgetComponentProps } from '../types';
import { useTradingViewEmbed } from './use-tradingview-embed';

function TvMyEmbedInner({ config }: WidgetComponentProps) {
  const symbol = (config.symbol as string) || 'BINANCE:BTCUSDT';
  const containerRef = useTradingViewEmbed({
    scriptSrc: 'https://s3.tradingview.com/external-embedding/embed-widget-xxx.js',
    config: { symbol, width: '100%', height: '100%' },
    deps: [symbol],
  });

  return <div ref={containerRef} className="h-full w-full" />;
}

export const TvMyEmbedContent = memo(TvMyEmbedInner);
```

The hook handles script creation, cleanup, and always injects `theme: 'dark'` and `locale: 'en'`.

## Widget Categories

| Category | Description |
|----------|-------------|
| `portfolio` | User portfolio data widgets |
| `tradingview-chart` | Price charts (Advanced, Mini, Symbol Overview) |
| `tradingview-ticker` | Ticker displays (Tape, Single Ticker) |
| `tradingview-screener` | Market data tables (Screener, Heatmap) |
| `tradingview-news` | News feeds (Top Stories) |
| `tradingview-analysis` | Technical indicators (Technical Analysis) |

## Widget Registry (15 widgets)

| Type | Category | Symbol? | Fullscreen? | Default Size |
|------|----------|---------|-------------|-------------|
| `portfolio-overview` | portfolio | no | no | 3x3 |
| `quick-stats` | portfolio | no | no | 4x2 |
| `asset-allocation` | portfolio | no | no | 4x4 |
| `market-movers` | portfolio | no | no | 4x3 |
| `recent-transactions` | portfolio | no | no | 4x3 |
| `btc-cycles` | portfolio | no | yes | 4x4 |
| `tv-advanced-chart` | tradingview-chart | yes | yes | 8x4 |
| `tv-mini-chart` | tradingview-chart | yes | no | 4x3 |
| `tv-symbol-overview` | tradingview-chart | yes | no | 4x3 |
| `tv-ticker-tape` | tradingview-ticker | no | no | 12x1 |
| `tv-single-ticker` | tradingview-ticker | yes | no | 3x2 |
| `tv-screener` | tradingview-screener | no | yes | 6x4 |
| `tv-heatmap` | tradingview-screener | no | yes | 6x4 |
| `tv-technical-analysis` | tradingview-analysis | yes | no | 4x4 |
| `tv-top-stories` | tradingview-news | no | no | 4x3 |

## Layout System

The grid uses `react-grid-layout` with three breakpoints:

| Breakpoint | Min Width | Columns |
|------------|-----------|---------|
| `lg` | 1200px | 12 |
| `md` | 996px | 10 |
| `sm` | 768px | 6 |

Row height is 80px. Margins are 16px.

### Vertical Compaction

The grid uses `verticalCompactor` from react-grid-layout v2, which automatically moves widgets upward to fill gaps. When you drag or resize a widget, other widgets compact vertically to eliminate empty space.

### Auto Layout

The "Auto Layout" button (disabled when locked) resets widgets to their default positions and applies vertical compaction. This:
1. Restores the default 8 widgets to their optimized grid positions
2. Maintains positions of any custom widgets you've added
3. Applies vertical compaction to eliminate gaps
4. Works across all breakpoints simultaneously

Use this when your layout feels messy after dragging widgets around, or to quickly reset to a clean state.

### Layout Merging

`mergeLayoutsWithWidgets()` reconciles saved layout positions with the current widget list:

1. For each widget, check if a saved position exists — use it
2. If not, check `defaultLayoutMap` (predefined positions for the 8 default widgets) — use it
3. Otherwise, look up the widget's `defaultSize` from the registry and place it at the bottom

This means adding a widget via the Quick Add Sheet always works — it gets positioned at the bottom of the grid with appropriate sizing.

## BaseWidget Features

- **Drag handle**: `GripVertical` icon in the header, uses `.drag-handle` CSS class
- **Fullscreen**: Opens a Dialog at 95vw/90vh, re-renders content with `isFullscreen=true`
- **Remove button**: Only visible when layout is unlocked
- **Scrollable body**: Enabled by default, disabled for TradingView embeds (they manage their own viewport)

## Default Dashboard

First-time users see 8 widgets with IDs that match the legacy grid keys for backward compatibility:

| Instance ID | Widget Type |
|------------|-------------|
| `portfolio` | `portfolio-overview` |
| `quick-stats` | `quick-stats` |
| `chart` | `tv-advanced-chart` |
| `allocation` | `asset-allocation` |
| `movers` | `market-movers` |
| `transactions` | `recent-transactions` |
| `news` | `tv-top-stories` |
| `btc-cycles` | `btc-cycles` |

### Default Layout (lg breakpoint)

The 12-column grid is fully utilized:

```
Row 0-2:  [Portfolio 4w] [Quick Stats 4w] [Allocation 4w]
Row 3-6:  [Chart 8w                     ] [News 4w      ]
Row 7-9:  [Movers 4w    ] [Transactions ] [BTC Cycles  ]
Row 10-11:[                              ] [BTC Cycles  ]
```

All widgets fit within 12 columns with no wasted horizontal space.
