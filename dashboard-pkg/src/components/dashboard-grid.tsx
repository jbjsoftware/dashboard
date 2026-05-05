'use client';

import { Lock, Unlock, Plus, LayoutGrid, Wand2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, Layout, ResponsiveLayouts } from 'react-grid-layout';

import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';

import { DashboardTabs } from './dashboard-tabs';
import { QuickAddSheet } from './quick-add-sheet';
import { WidgetRenderer } from './widget-renderer';
import type { Dashboard, WidgetConfig, WidgetDefinition, DashboardStore } from '../types';
import type { CategoryEntry } from '../registry';
import { useDashboardStore } from '../use-dashboard-store';

const breakpoints = {
  '3xl': 2560,
  '2xl': 1600,
  xl: 1400,
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
};
const cols: Record<string, number> = {
  '3xl': 32,
  '2xl': 24,
  xl: 18,
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
};
const margins: Record<string, [number, number]> = {
  '3xl': [24, 24],
  '2xl': [20, 20],
  xl: [18, 18],
  lg: [16, 16],
  md: [14, 14],
  sm: [12, 12],
  xs: [8, 8],
};
const ALL_BREAKPOINTS = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
const breakpointLabels: Record<string, string> = {
  '3xl': '3XL layout',
  '2xl': '2XL layout',
  xl: 'XL layout',
  md: 'Medium layout',
  sm: 'Compact layout',
  xs: 'Mobile layout',
};
const ROW_HEIGHT = 80;
const EMPTY_LAYOUTS: ResponsiveLayouts = {
  '3xl': [],
  '2xl': [],
  xl: [],
  lg: [],
  md: [],
  sm: [],
  xs: [],
};

function getBreakpointFromWidth(w: number): string {
  const sorted = (Object.entries(breakpoints) as [string, number][]).sort((a, b) => b[1] - a[1]);
  return sorted.find(([, minW]) => w >= minW)?.[0] ?? 'xs';
}

function findNextPosition(
  existing: LayoutItem[],
  w: number,
  h: number,
  numCols: number,
): { x: number; y: number } {
  const occupied = new Set<string>();
  let maxY = 0;
  for (const item of existing) {
    for (let ix = item.x; ix < item.x + item.w; ix++) {
      for (let iy = item.y; iy < item.y + item.h; iy++) {
        occupied.add(`${ix},${iy}`);
      }
    }
    maxY = Math.max(maxY, item.y + item.h);
  }

  for (let y = 0; y <= maxY + h; y++) {
    for (let x = 0; x <= numCols - w; x++) {
      let fits = true;
      outer: for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
          if (occupied.has(`${ix},${iy}`)) {
            fits = false;
            break outer;
          }
        }
      }
      if (fits) return { x, y };
    }
  }

  return { x: 0, y: maxY };
}

function mergeLayoutsWithWidgets(
  savedLayouts: ResponsiveLayouts | null,
  widgets: { id: string; type: string }[],
  defaultLayoutMap: Record<string, Record<string, LayoutItem>>,
  getWidgetDef: (type: string) => WidgetDefinition | undefined,
): ResponsiveLayouts {
  const result: Record<string, LayoutItem[]> = {
    '3xl': [],
    '2xl': [],
    xl: [],
    lg: [],
    md: [],
    sm: [],
    xs: [],
  };

  for (const bp of ALL_BREAKPOINTS) {
    const savedBp: readonly LayoutItem[] = savedLayouts?.[bp] || [];
    const savedMap = new Map(savedBp.map((l) => [l.i, l]));

    for (const { id, type } of widgets) {
      if (savedMap.has(id)) {
        result[bp]!.push(savedMap.get(id)!);
      } else {
        const defaultLayout = defaultLayoutMap[bp]?.[id];
        if (defaultLayout) {
          result[bp]!.push(defaultLayout);
        } else {
          const def = getWidgetDef(type);
          const w = def ? Math.min(def.defaultSize.w, cols[bp]!) : Math.min(4, cols[bp]!);
          const h = def ? def.defaultSize.h : 3;
          const pos = findNextPosition(result[bp]!, w, h, cols[bp]!);
          result[bp]!.push({
            i: id,
            x: pos.x,
            y: pos.y,
            w,
            h,
            minW: def?.minSize.minW ?? 2,
            minH: def?.minSize.minH ?? 2,
          });
        }
      }
    }
  }

  return result as ResponsiveLayouts;
}

// ---------------------------------------------------------------------------
// DashboardPanel
// ---------------------------------------------------------------------------

interface DashboardPanelProps {
  dashboard: Dashboard;
  isActive: boolean;
  isLocked: boolean;
  width: number;
  mounted: boolean;
  snapGridStyle: React.CSSProperties;
  autoLayoutTrigger: number;
  defaultLayoutMap: Record<string, Record<string, LayoutItem>>;
  getWidgetDef: (type: string) => WidgetDefinition | undefined;
  symbolSearchUrl: string;
  updateLayouts: (layouts: ResponsiveLayouts, dashboardId: string) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void;
}

function DashboardPanel({
  dashboard,
  isActive,
  isLocked,
  width,
  mounted,
  snapGridStyle,
  autoLayoutTrigger,
  defaultLayoutMap,
  getWidgetDef,
  symbolSearchUrl,
  updateLayouts,
  removeWidget,
  updateWidgetConfig,
}: DashboardPanelProps) {
  const canSaveLayoutRef = useRef(false);
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    const widgets = dashboard.widgets.map((w) => ({ id: w.id, type: w.type }));
    return mergeLayoutsWithWidgets(dashboard.layouts, widgets, defaultLayoutMap, getWidgetDef);
  });
  const prevAutoLayoutRef = useRef(0);

  const [prevWidgets, setPrevWidgets] = useState(dashboard.widgets);
  const [prevStoredLayouts, setPrevStoredLayouts] = useState(dashboard.layouts);

  if (dashboard.widgets !== prevWidgets || dashboard.layouts !== prevStoredLayouts) {
    setPrevWidgets(dashboard.widgets);
    setPrevStoredLayouts(dashboard.layouts);
    const widgets = dashboard.widgets.map((w) => ({ id: w.id, type: w.type }));
    setLayouts(
      mergeLayoutsWithWidgets(dashboard.layouts, widgets, defaultLayoutMap, getWidgetDef),
    );
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      canSaveLayoutRef.current = true;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    canSaveLayoutRef.current = false;
    const timer = setTimeout(() => {
      canSaveLayoutRef.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (autoLayoutTrigger === prevAutoLayoutRef.current || !isActive) return;
    prevAutoLayoutRef.current = autoLayoutTrigger;

    setLayouts((prev) => {
      const next: Record<string, LayoutItem[]> = {};

      for (const bp of ALL_BREAKPOINTS) {
        const layoutItems: LayoutItem[] = [];
        const currentMap = new Map((prev[bp] || []).map((l) => [l.i, l]));

        for (const widget of dashboard.widgets) {
          const defaultItem = defaultLayoutMap[bp]?.[widget.id];
          if (defaultItem) {
            layoutItems.push({ ...defaultItem });
          }
        }

        for (const widget of dashboard.widgets) {
          if (!defaultLayoutMap[bp]?.[widget.id]) {
            const current = currentMap.get(widget.id);
            if (current) {
              const w = Math.min(current.w, cols[bp]!);
              const h = current.h;
              const pos = findNextPosition(layoutItems, w, h, cols[bp]!);
              layoutItems.push({ ...current, x: pos.x, y: pos.y, w, h });
            }
          }
        }

        const compacted = verticalCompactor.compact(layoutItems as Layout, cols[bp]!);
        next[bp] = compacted as LayoutItem[];
      }

      updateLayouts(next as ResponsiveLayouts, dashboard.id);
      return next as ResponsiveLayouts;
    });
  }, [autoLayoutTrigger, isActive, dashboard.widgets, dashboard.id, updateLayouts, defaultLayoutMap]);

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      if (!canSaveLayoutRef.current || !isActive) return;
      if (!isLocked) {
        setLayouts(allLayouts);
        updateLayouts(allLayouts, dashboard.id);
      }
    },
    [isLocked, isActive, updateLayouts, dashboard.id],
  );

  return (
    <div
      className={
        isActive
          ? 'overflow-auto h-full w-full transition-opacity duration-200 opacity-100'
          : 'absolute inset-0 overflow-hidden invisible pointer-events-none opacity-0'
      }
      style={isActive ? snapGridStyle : undefined}
    >
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={ROW_HEIGHT}
          compactor={verticalCompactor}
          dragConfig={isLocked ? { enabled: false } : { enabled: true, handle: '.drag-handle' }}
          resizeConfig={
            isLocked
              ? { enabled: false }
              : {
                  enabled: true,
                  handles: ['se', 'sw', 'ne', 'nw', 's', 'e', 'n', 'w'],
                }
          }
          onLayoutChange={handleLayoutChange}
          containerPadding={null}
          margin={margins}
        >
          {dashboard.widgets.map((widget) => {
            const definition = getWidgetDef(widget.type);
            if (!definition) return null;

            return (
              <div key={widget.id} className="dashboard-widget">
                <WidgetRenderer
                  definition={definition}
                  config={widget.config}
                  isLocked={isLocked}
                  onRemove={() => removeWidget(widget.id)}
                  onConfigChange={(config) => updateWidgetConfig(widget.id, config)}
                  symbolSearchUrl={symbolSearchUrl}
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardGrid — public component
// ---------------------------------------------------------------------------

export interface DashboardGridProps {
  widgetRegistry: WidgetDefinition[];
  categories?: readonly CategoryEntry[];
  defaultLayouts?: ResponsiveLayouts;
  symbolSearchUrl?: string;
  onNavigateToGallery?: () => void;
  externalLayoutTrigger?: unknown;
  initialStore?: () => DashboardStore;
}

export function DashboardGrid({
  widgetRegistry,
  categories = [],
  defaultLayouts,
  symbolSearchUrl = '/api/symbol-search',
  onNavigateToGallery,
  externalLayoutTrigger,
  initialStore,
}: DashboardGridProps) {
  const {
    activeDashboard,
    dashboards,
    loaded,
    createDashboard,
    deleteDashboard,
    renameDashboard,
    setActiveDashboard,
    duplicateDashboard,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    updateLayouts,
  } = useDashboardStore({ createInitialStore: initialStore });

  const [isLocked, setIsLocked] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [autoLayoutTrigger, setAutoLayoutTrigger] = useState(0);

  const { width, containerRef, mounted, measureWidth } = useContainerWidth({
    measureBeforeMount: true,
    initialWidth: 1200,
  });

  const currentBreakpoint = useMemo(() => getBreakpointFromWidth(width), [width]);

  // Re-measure width when externalLayoutTrigger changes (e.g. sidebar open/close)
  useEffect(() => {
    const timer = setTimeout(() => measureWidth(), 220);
    return () => clearTimeout(timer);
  }, [externalLayoutTrigger, measureWidth]);

  // Build defaultLayoutMap from defaultLayouts prop
  const defaultLayoutMap = useMemo(() => {
    if (!defaultLayouts) return {};
    const map: Record<string, Record<string, LayoutItem>> = {};
    for (const [bp, items] of Object.entries(defaultLayouts)) {
      map[bp] = {};
      for (const item of items as LayoutItem[]) {
        map[bp]![item.i] = item;
      }
    }
    return map;
  }, [defaultLayouts]);

  const getWidgetDef = useCallback(
    (type: string) => widgetRegistry.find((w) => w.type === type),
    [widgetRegistry],
  );

  const handleAddWidget = useCallback(
    (type: string, widgetConfig: Record<string, unknown> = {}) => {
      addWidget(type, widgetConfig);
    },
    [addWidget],
  );

  const snapGridStyle = useMemo((): React.CSSProperties => {
    if (isLocked || !mounted) return {};
    const [mx, my] = margins[currentBreakpoint] ?? [16, 16];
    const numCols = cols[currentBreakpoint] ?? 12;

    const cellWidth = (width - mx * (numCols + 1)) / numCols;
    const colUnit = cellWidth + mx;
    const rowUnit = ROW_HEIGHT + my;

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${colUnit}" height="${rowUnit}">`,
      `<rect x="0.5" y="0.5" width="${cellWidth - 1}" height="${ROW_HEIGHT - 1}" fill="rgba(6,182,212,0.015)" stroke="rgba(6,182,212,0.06)" stroke-width="1" rx="12"/>`,
      `</svg>`,
    ].join('');

    return {
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      backgroundSize: `${colUnit}px ${rowUnit}px`,
      backgroundPosition: `${mx}px ${my}px`,
    };
  }, [isLocked, mounted, width, currentBreakpoint]);

  if (!loaded) return null;

  return (
    <div ref={containerRef} className="flex flex-col flex-fill min-h-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <DashboardTabs
            dashboards={dashboards}
            activeDashboardId={activeDashboard.id}
            onSelect={setActiveDashboard}
            onCreate={createDashboard}
            onRename={renameDashboard}
            onDuplicate={duplicateDashboard}
            onDelete={deleteDashboard}
          />
          {currentBreakpoint !== 'lg' && breakpointLabels[currentBreakpoint] && (
            <Badge variant="outline" className="text-xs shrink-0">
              {breakpointLabels[currentBreakpoint]}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
          {onNavigateToGallery && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onNavigateToGallery}
            >
              <LayoutGrid className="h-4 w-4" />
              Gallery
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAutoLayoutTrigger((c) => c + 1)}
            disabled={isLocked}
          >
            <Wand2 className="h-4 w-4" />
            Auto Layout
          </Button>
          <Button
            variant={isLocked ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsLocked(!isLocked)}
            className="gap-2"
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Unlock Layout
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Lock Layout
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative flex-fill min-h-0">
        {dashboards.map((dashboard) => (
          <DashboardPanel
            key={dashboard.id}
            dashboard={dashboard}
            isActive={dashboard.id === activeDashboard.id}
            isLocked={isLocked}
            width={width}
            mounted={mounted}
            snapGridStyle={snapGridStyle}
            autoLayoutTrigger={autoLayoutTrigger}
            defaultLayoutMap={defaultLayoutMap}
            getWidgetDef={getWidgetDef}
            symbolSearchUrl={symbolSearchUrl}
            updateLayouts={updateLayouts}
            removeWidget={removeWidget}
            updateWidgetConfig={updateWidgetConfig}
          />
        ))}
      </div>

      <QuickAddSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAddWidget={handleAddWidget}
        activeWidgetTypes={activeDashboard.widgets.map((w) => w.type)}
        widgetRegistry={widgetRegistry}
        categories={categories}
        symbolSearchUrl={symbolSearchUrl}
      />
    </div>
  );
}

// Keep EMPTY_LAYOUTS export for consumers who need it
export { EMPTY_LAYOUTS };
