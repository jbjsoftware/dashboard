import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ResponsiveLayouts } from 'react-grid-layout';

export type WidgetCategory = string;

export interface WidgetConfig {
  symbol?: string;
  headerMode?: 'always' | 'hover' | 'hidden';
  [key: string]: unknown;
}

export interface WidgetComponentProps {
  config: WidgetConfig;
  isFullscreen: boolean;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: WidgetCategory;
  defaultSize: { w: number; h: number };
  minSize: { minW: number; minH: number };
  supportsFullscreen: boolean;
  requiresSymbol: boolean;
  defaultSymbol?: string;
  noPadding?: boolean;
  component: ComponentType<WidgetComponentProps>;
}

export interface WidgetInstance {
  id: string;
  type: string;
  config: WidgetConfig;
}

export interface DashboardConfig {
  version: number;
  widgets: WidgetInstance[];
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: WidgetInstance[];
  layouts: ResponsiveLayouts;
  createdAt: number;
}

export interface DashboardStore {
  version: 2;
  activeDashboardId: string;
  dashboards: Dashboard[];
}
