'use client';

import type { WidgetInstance, DashboardStore, Dashboard, ResponsiveLayouts } from 'dashboard-pkg';
export { useDashboardStore } from 'dashboard-pkg';

// Default widgets for new dashboards
export const defaultWidgets: WidgetInstance[] = [
  { id: 'portfolio', type: 'portfolio-overview', config: {} },
  { id: 'quick-stats', type: 'quick-stats', config: {} },
  { id: 'chart', type: 'tv-advanced-chart', config: { symbol: 'BINANCE:BTCUSDT' } },
  { id: 'allocation', type: 'asset-allocation', config: {} },
  { id: 'movers', type: 'market-movers', config: {} },
  { id: 'transactions', type: 'recent-transactions', config: {} },
  { id: 'news', type: 'tv-top-stories', config: {} },
  { id: 'btc-cycles', type: 'btc-cycles', config: {} },
];

// Default layouts for new dashboards
export const defaultLayouts: ResponsiveLayouts = {
  '3xl': [
    { i: 'portfolio', x: 0, y: 0, w: 8, h: 3, minW: 2, minH: 2 },
    { i: 'quick-stats', x: 8, y: 0, w: 8, h: 2, minW: 4, minH: 2 },
    { i: 'allocation', x: 16, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'btc-cycles', x: 24, y: 0, w: 8, h: 4, minW: 3, minH: 3 },
    { i: 'chart', x: 0, y: 3, w: 16, h: 5, minW: 6, minH: 3 },
    { i: 'movers', x: 0, y: 8, w: 8, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 8, y: 8, w: 8, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 16, y: 4, w: 16, h: 7, minW: 3, minH: 2 },
  ],
  '2xl': [
    { i: 'portfolio', x: 0, y: 0, w: 7, h: 3, minW: 2, minH: 2 },
    { i: 'quick-stats', x: 7, y: 0, w: 7, h: 2, minW: 4, minH: 2 },
    { i: 'allocation', x: 14, y: 0, w: 10, h: 4, minW: 4, minH: 3 },
    { i: 'chart', x: 0, y: 3, w: 14, h: 5, minW: 6, minH: 3 },
    { i: 'movers', x: 0, y: 8, w: 7, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 7, y: 8, w: 7, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 14, y: 4, w: 10, h: 4, minW: 3, minH: 2 },
    { i: 'btc-cycles', x: 14, y: 8, w: 10, h: 4, minW: 3, minH: 3 },
  ],
  xl: [
    { i: 'portfolio', x: 0, y: 0, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'quick-stats', x: 6, y: 0, w: 5, h: 2, minW: 4, minH: 2 },
    { i: 'allocation', x: 11, y: 0, w: 7, h: 4, minW: 4, minH: 3 },
    { i: 'chart', x: 0, y: 3, w: 11, h: 4, minW: 6, minH: 3 },
    { i: 'movers', x: 0, y: 7, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 6, y: 7, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 11, y: 4, w: 7, h: 3, minW: 3, minH: 2 },
    { i: 'btc-cycles', x: 11, y: 7, w: 7, h: 4, minW: 3, minH: 3 },
  ],
  lg: [
    { i: 'portfolio', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'quick-stats', x: 4, y: 0, w: 4, h: 2, minW: 4, minH: 2 },
    { i: 'allocation', x: 8, y: 0, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'chart', x: 0, y: 3, w: 8, h: 4, minW: 6, minH: 3 },
    { i: 'movers', x: 0, y: 7, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 4, y: 7, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 8, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'btc-cycles', x: 8, y: 7, w: 4, h: 4, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'portfolio', x: 0, y: 0, w: 10, h: 2, minW: 4, minH: 2 },
    { i: 'quick-stats', x: 0, y: 2, w: 10, h: 2, minW: 4, minH: 2 },
    { i: 'chart', x: 0, y: 4, w: 10, h: 4, minW: 6, minH: 3 },
    { i: 'allocation', x: 0, y: 8, w: 10, h: 4, minW: 4, minH: 3 },
    { i: 'movers', x: 0, y: 12, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 5, y: 12, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 0, y: 15, w: 10, h: 3, minW: 3, minH: 2 },
    { i: 'btc-cycles', x: 0, y: 18, w: 10, h: 4, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'portfolio', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
    { i: 'quick-stats', x: 0, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
    { i: 'chart', x: 0, y: 4, w: 6, h: 4, minW: 6, minH: 3 },
    { i: 'allocation', x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'movers', x: 0, y: 12, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'transactions', x: 0, y: 15, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'news', x: 0, y: 18, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'btc-cycles', x: 0, y: 21, w: 6, h: 4, minW: 3, minH: 3 },
  ],
  xs: [
    { i: 'portfolio', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'quick-stats', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    { i: 'chart', x: 0, y: 4, w: 4, h: 4, minW: 4, minH: 3 },
    { i: 'allocation', x: 0, y: 8, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'movers', x: 0, y: 11, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'transactions', x: 0, y: 14, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'news', x: 0, y: 17, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'btc-cycles', x: 0, y: 20, w: 4, h: 3, minW: 2, minH: 2 },
  ],
};

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function createWebAppInitialStore(): DashboardStore {
  const dashboard: Dashboard = {
    id: generateId('dash'),
    name: 'Dashboard 1',
    widgets: defaultWidgets.map((w) => ({ ...w, config: { ...w.config } })),
    layouts: structuredClone(defaultLayouts),
    createdAt: Date.now(),
  };
  return {
    version: 2,
    activeDashboardId: dashboard.id,
    dashboards: [dashboard],
  };
}
