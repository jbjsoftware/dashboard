'use client';

import type { WidgetConfig, WidgetDefinition } from '../types';
import { BaseWidget } from './base-widget';
import { CompactSymbolPicker } from './compact-symbol-picker';

interface WidgetRendererProps {
  definition: WidgetDefinition;
  config: WidgetConfig;
  isLocked: boolean;
  onRemove: () => void;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  symbolSearchUrl: string;
}

export function WidgetRenderer({
  definition,
  config,
  isLocked,
  onRemove,
  onConfigChange,
  symbolSearchUrl,
}: WidgetRendererProps) {
  const Component = definition.component;
  const noPadding = definition.noPadding ?? false;
  const headerMode = config.headerMode ?? 'hover';

  const headerExtra =
    definition.requiresSymbol && config.symbol && onConfigChange ? (
      <CompactSymbolPicker
        value={config.symbol}
        onChange={(symbol) => onConfigChange({ symbol })}
        searchUrl={symbolSearchUrl}
      />
    ) : null;

  return (
    <BaseWidget
      title={definition.name}
      supportsFullscreen={definition.supportsFullscreen}
      scrollable={!noPadding}
      noPadding={noPadding}
      isLocked={isLocked}
      headerMode={headerMode}
      headerExtra={headerExtra}
      onRemove={onRemove}
      onHeaderModeChange={
        onConfigChange ? (mode) => onConfigChange({ headerMode: mode }) : undefined
      }
    >
      {(isFullscreen) => (
        <Component config={config} isFullscreen={isFullscreen} onConfigChange={onConfigChange} />
      )}
    </BaseWidget>
  );
}
