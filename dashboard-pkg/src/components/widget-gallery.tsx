'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Check } from 'lucide-react';

import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/ui/components/ui/dialog';

import type { WidgetDefinition } from '../types';
import type { CategoryEntry } from '../registry';
import { WidgetSymbolPicker } from './widget-symbol-picker';

export interface WidgetGalleryProps {
  widgetRegistry: WidgetDefinition[];
  categories: readonly CategoryEntry[];
  activeWidgetTypes: string[];
  onAddWidget: (type: string, config?: Record<string, unknown>) => void;
  onBack?: () => void;
  symbolSearchUrl: string;
}

export function WidgetGallery({
  widgetRegistry,
  categories,
  activeWidgetTypes,
  onAddWidget,
  onBack,
  symbolSearchUrl,
}: WidgetGalleryProps) {
  const [symbolDialog, setSymbolDialog] = useState<{
    type: string;
    symbol: string;
  } | null>(null);

  const handleAdd = (type: string) => {
    const def = widgetRegistry.find((w) => w.type === type);
    if (def?.requiresSymbol) {
      setSymbolDialog({ type, symbol: def.defaultSymbol || 'BINANCE:BTCUSDT' });
    } else {
      onAddWidget(type);
    }
  };

  const confirmAdd = () => {
    if (symbolDialog) {
      onAddWidget(symbolDialog.type, { symbol: symbolDialog.symbol });
      setSymbolDialog(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        {onBack && (
          <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
        <h1 className="text-3xl font-bold tracking-tight">Widget Gallery</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse and add widgets to customize your dashboard
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const widgets =
            cat.value === 'all'
              ? widgetRegistry
              : widgetRegistry.filter((w) => w.category === cat.value);

          return (
            <TabsContent key={cat.value} value={cat.value}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {widgets.map((widget) => {
                  const Icon = widget.icon;
                  const isActive = activeWidgetTypes.includes(widget.type);
                  const categoryLabel = categories.find(
                    (c) => c.value === widget.category,
                  )?.label;

                  return (
                    <div
                      key={widget.type}
                      className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {isActive && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Check className="h-3 w-3" />
                            Added
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold mb-1">{widget.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {widget.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {categoryLabel}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 h-7 text-xs"
                          onClick={() => handleAdd(widget.type)}
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={!!symbolDialog} onOpenChange={(open) => !open && setSymbolDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Symbol</DialogTitle>
          </DialogHeader>
          {symbolDialog && (
            <WidgetSymbolPicker
              value={symbolDialog.symbol}
              onChange={(symbol) =>
                setSymbolDialog((prev) => (prev ? { ...prev, symbol } : null))
              }
              searchUrl={symbolSearchUrl}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSymbolDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAdd}>Add to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
