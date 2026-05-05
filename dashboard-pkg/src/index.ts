// Re-export react-grid-layout types used by consumers
export type { ResponsiveLayouts, LayoutItem } from 'react-grid-layout';

// Types
export type {
  WidgetCategory,
  WidgetConfig,
  WidgetComponentProps,
  WidgetDefinition,
  WidgetInstance,
  DashboardConfig,
  Dashboard,
  DashboardStore,
} from './types';

// Registry
export type { CategoryEntry } from './registry';
export { widgetRegistry, getWidgetDefinition, CATEGORIES } from './registry';

// Hooks
export { useSymbolSearch } from './use-symbol-search';
export type { SymbolResult } from './use-symbol-search';
export { useDashboardStore } from './use-dashboard-store';
export type { UseDashboardStoreOptions } from './use-dashboard-store';

// Components
export { BaseWidget } from './components/base-widget';
export { DashboardTabs } from './components/dashboard-tabs';
export { CompactSymbolPicker } from './components/compact-symbol-picker';
export { WidgetSymbolPicker } from './components/widget-symbol-picker';
export { WidgetRenderer } from './components/widget-renderer';
export { QuickAddSheet } from './components/quick-add-sheet';
export { DashboardGrid } from './components/dashboard-grid';
export type { DashboardGridProps } from './components/dashboard-grid';
export { WidgetGallery } from './components/widget-gallery';
export type { WidgetGalleryProps } from './components/widget-gallery';
