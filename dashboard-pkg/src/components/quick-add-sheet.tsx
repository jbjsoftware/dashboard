'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Badge } from '@repo/ui/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@repo/ui/components/ui/sheet';

import type { WidgetDefinition } from '../types';
import type { CategoryEntry } from '../registry';
import { WidgetSymbolPicker } from './widget-symbol-picker';

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (type: string, config?: Record<string, unknown>) => void;
  activeWidgetTypes: string[];
  widgetRegistry: WidgetDefinition[];
  categories: readonly CategoryEntry[];
  symbolSearchUrl: string;
}

export function QuickAddSheet({
  open,
  onOpenChange,
  onAddWidget,
  activeWidgetTypes,
  widgetRegistry,
  categories,
  symbolSearchUrl,
}: QuickAddSheetProps) {
  const [search, setSearch] = useState('');
  const [pendingSymbol, setPendingSymbol] = useState<{
    type: string;
    symbol: string;
  } | null>(null);

  const filtered = widgetRegistry.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = categories
    .filter((c) => c.value !== 'all')
    .map((cat) => ({
      ...cat,
      widgets: filtered.filter((w) => w.category === cat.value),
    }))
    .filter((g) => g.widgets.length > 0);

  const handleAdd = (type: string) => {
    const def = widgetRegistry.find((w) => w.type === type);
    if (def?.requiresSymbol) {
      setPendingSymbol({ type, symbol: def.defaultSymbol || 'BINANCE:BTCUSDT' });
    } else {
      onAddWidget(type);
    }
  };

  const confirmAdd = () => {
    if (pendingSymbol) {
      onAddWidget(pendingSymbol.type, { symbol: pendingSymbol.symbol });
      setPendingSymbol(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Widget</SheetTitle>
          <SheetDescription>Choose a widget to add to your dashboard</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {pendingSymbol && (
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">Select Symbol</p>
              <WidgetSymbolPicker
                value={pendingSymbol.symbol}
                onChange={(symbol) =>
                  setPendingSymbol((prev) => (prev ? { ...prev, symbol } : null))
                }
                searchUrl={symbolSearchUrl}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={confirmAdd} className="flex-1">
                  Add Widget
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPendingSymbol(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.value}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.widgets.map((widget) => {
                  const Icon = widget.icon;
                  const isActive = activeWidgetTypes.includes(widget.type);

                  return (
                    <div
                      key={widget.type}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{widget.name}</p>
                          {isActive && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {widget.description}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleAdd(widget.type)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No widgets found matching &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
