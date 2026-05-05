'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardStore, Dashboard, WidgetInstance, WidgetConfig } from './types';
import type { ResponsiveLayouts, LayoutItem } from 'react-grid-layout';

const STORAGE_KEY = 'dashboard-store';
const OLD_WIDGET_KEY = 'dashboard-widget-config';
const OLD_LAYOUT_KEY = 'dashboard-layout';

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function createEmptyDefaultStore(): DashboardStore {
  const dashboard: Dashboard = {
    id: generateId('dash'),
    name: 'Dashboard 1',
    widgets: [],
    layouts: { '3xl': [], '2xl': [], xl: [], lg: [], md: [], sm: [], xs: [] },
    createdAt: Date.now(),
  };
  return {
    version: 2,
    activeDashboardId: dashboard.id,
    dashboards: [dashboard],
  };
}

function migrateFromOldKeys(): DashboardStore | null {
  try {
    const rawWidgets = localStorage.getItem(OLD_WIDGET_KEY);
    if (!rawWidgets) return null;

    const oldConfig = JSON.parse(rawWidgets) as { version: number; widgets: WidgetInstance[] };
    if (!oldConfig.widgets?.length) return null;

    let layouts: ResponsiveLayouts = { '3xl': [], '2xl': [], xl: [], lg: [], md: [], sm: [], xs: [] };
    const rawLayouts = localStorage.getItem(OLD_LAYOUT_KEY);
    if (rawLayouts) {
      try {
        layouts = JSON.parse(rawLayouts) as ResponsiveLayouts;
      } catch {
        // use empty layouts
      }
    }

    const dashboard: Dashboard = {
      id: generateId('dash'),
      name: 'Dashboard 1',
      widgets: oldConfig.widgets.map((w) => ({ ...w, config: { ...w.config } })),
      layouts: structuredClone(layouts),
      createdAt: Date.now(),
    };

    const store: DashboardStore = {
      version: 2,
      activeDashboardId: dashboard.id,
      dashboards: [dashboard],
    };

    localStorage.removeItem(OLD_WIDGET_KEY);
    localStorage.removeItem(OLD_LAYOUT_KEY);

    return store;
  } catch {
    return null;
  }
}

function loadStore(createFallback: () => DashboardStore): DashboardStore {
  if (typeof window === 'undefined') return createFallback();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardStore;
      if (parsed.version === 2 && parsed.dashboards?.length > 0) {
        return parsed;
      }
    }

    const migrated = migrateFromOldKeys();
    if (migrated) return migrated;

    return createFallback();
  } catch {
    return createFallback();
  }
}

function saveStore(store: DashboardStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or unavailable
  }
}

export interface UseDashboardStoreOptions {
  createInitialStore?: () => DashboardStore;
}

export function useDashboardStore(options?: UseDashboardStoreOptions) {
  const createInitialStoreRef = useRef(options?.createInitialStore ?? createEmptyDefaultStore);

  const [store, setStore] = useState<DashboardStore>(() => createInitialStoreRef.current());
  const [loaded, setLoaded] = useState(false);
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    setStore(loadStore(createInitialStoreRef.current));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveStore(store);
    }
  }, [store, loaded]);

  const activeDashboard =
    store.dashboards.find((d) => d.id === store.activeDashboardId) || store.dashboards[0]!;

  const createDashboard = useCallback((name: string): string => {
    const dashboard: Dashboard = {
      id: generateId('dash'),
      name,
      widgets: [],
      layouts: { '3xl': [], '2xl': [], xl: [], lg: [], md: [], sm: [], xs: [] },
      createdAt: Date.now(),
    };
    setStore((prev) => ({
      ...prev,
      activeDashboardId: dashboard.id,
      dashboards: [...prev.dashboards, dashboard],
    }));
    return dashboard.id;
  }, []);

  const deleteDashboard = useCallback((id: string) => {
    setStore((prev) => {
      if (prev.dashboards.length <= 1) return prev;
      const remaining = prev.dashboards.filter((d) => d.id !== id);
      const newActive =
        prev.activeDashboardId === id ? remaining[0]!.id : prev.activeDashboardId;
      return { ...prev, activeDashboardId: newActive, dashboards: remaining };
    });
  }, []);

  const renameDashboard = useCallback((id: string, name: string) => {
    setStore((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => (d.id === id ? { ...d, name } : d)),
    }));
  }, []);

  const setActiveDashboard = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, activeDashboardId: id }));
  }, []);

  const duplicateDashboard = useCallback((id: string): string => {
    const newId = generateId('dash');
    setStore((prev) => {
      const source = prev.dashboards.find((d) => d.id === id);
      if (!source) return prev;

      const idMap = new Map<string, string>();
      const newWidgets = source.widgets.map((w) => {
        const newWidgetId = generateId(w.type);
        idMap.set(w.id, newWidgetId);
        return { ...w, id: newWidgetId, config: { ...w.config } };
      });

      const newLayouts: Record<string, LayoutItem[]> = {};
      for (const [bp, items] of Object.entries(source.layouts)) {
        newLayouts[bp] = (items as LayoutItem[]).map((l) => ({
          ...l,
          i: idMap.get(l.i) || l.i,
        }));
      }

      const duplicate: Dashboard = {
        id: newId,
        name: `${source.name} (copy)`,
        widgets: newWidgets,
        layouts: newLayouts as ResponsiveLayouts,
        createdAt: Date.now(),
      };

      return {
        ...prev,
        activeDashboardId: newId,
        dashboards: [...prev.dashboards, duplicate],
      };
    });
    return newId;
  }, []);

  const addWidget = useCallback((type: string, config: WidgetConfig = {}): string => {
    const id = generateId(type);
    setStore((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) =>
        d.id === prev.activeDashboardId
          ? { ...d, widgets: [...d.widgets, { id, type, config }] }
          : d,
      ),
    }));
    return id;
  }, []);

  const removeWidget = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) =>
        d.id === prev.activeDashboardId
          ? {
              ...d,
              widgets: d.widgets.filter((w) => w.id !== id),
              layouts: removeWidgetFromLayouts(d.layouts, id),
            }
          : d,
      ),
    }));
  }, []);

  const updateWidgetConfig = useCallback((id: string, config: Partial<WidgetConfig>) => {
    setStore((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) =>
        d.id === prev.activeDashboardId
          ? {
              ...d,
              widgets: d.widgets.map((w) =>
                w.id === id ? { ...w, config: { ...w.config, ...config } } : w,
              ),
            }
          : d,
      ),
    }));
  }, []);

  const updateLayouts = useCallback((layouts: ResponsiveLayouts, dashboardId?: string) => {
    setStore((prev) => {
      const targetId = dashboardId ?? prev.activeDashboardId;
      return {
        ...prev,
        dashboards: prev.dashboards.map((d) =>
          d.id === targetId ? { ...d, layouts } : d,
        ),
      };
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const fresh = createInitialStoreRef.current();
    setStore(fresh);
  }, []);

  return {
    activeDashboard,
    dashboards: store.dashboards,
    loaded,

    createDashboard,
    deleteDashboard,
    renameDashboard,
    setActiveDashboard,
    duplicateDashboard,

    addWidget,
    removeWidget,
    updateWidgetConfig,

    layouts: activeDashboard.layouts,
    updateLayouts,

    resetToDefaults,
  };
}

function removeWidgetFromLayouts(layouts: ResponsiveLayouts, widgetId: string): ResponsiveLayouts {
  const result: Record<string, LayoutItem[]> = {};
  for (const [bp, items] of Object.entries(layouts)) {
    result[bp] = (items as LayoutItem[]).filter((l) => l.i !== widgetId);
  }
  return result as ResponsiveLayouts;
}
