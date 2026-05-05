import type { WidgetDefinition } from './types';

export interface CategoryEntry {
  value: string;
  label: string;
}

export const widgetRegistry: WidgetDefinition[] = [];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return widgetRegistry.find((w) => w.type === type);
}

export const CATEGORIES: readonly CategoryEntry[] = [];
