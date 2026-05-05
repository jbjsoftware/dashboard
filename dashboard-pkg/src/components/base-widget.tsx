'use client';

import { GripVertical, Maximize2, Minimize2, X, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { cn } from '@repo/ui/lib/utils';

type HeaderMode = 'always' | 'hover' | 'hidden';

interface BaseWidgetProps {
  title: string;
  children: (isFullscreen: boolean) => React.ReactNode;
  supportsFullscreen?: boolean;
  scrollable?: boolean;
  noPadding?: boolean;
  isLocked?: boolean;
  headerMode?: HeaderMode;
  headerExtra?: React.ReactNode;
  onRemove?: () => void;
  onHeaderModeChange?: (mode: HeaderMode) => void;
}

export function BaseWidget({
  title,
  children,
  supportsFullscreen = false,
  scrollable = true,
  noPadding = false,
  isLocked = true,
  headerMode = 'always',
  headerExtra,
  onRemove,
  onHeaderModeChange,
}: BaseWidgetProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);
  const isMouseOverRef = useRef(false);
  const isParentScrollingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let scrollParent: HTMLElement | null = card.parentElement;
    while (scrollParent) {
      const { overflowY } = getComputedStyle(scrollParent);
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      scrollParent = scrollParent.parentElement;
    }
    if (!scrollParent) return;

    const handleScroll = () => {
      if (isActiveRef.current) return;

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      isParentScrollingRef.current = true;

      if (scrollCooldownRef.current) clearTimeout(scrollCooldownRef.current);
      scrollCooldownRef.current = setTimeout(() => {
        isParentScrollingRef.current = false;
        if (isMouseOverRef.current) {
          hoverTimeoutRef.current = setTimeout(() => setIsActive(true), 400);
        }
      }, 300);
    };

    scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollParent.removeEventListener('scroll', handleScroll);
      if (scrollCooldownRef.current) clearTimeout(scrollCooldownRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    isMouseOverRef.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (!isParentScrollingRef.current) {
      hoverTimeoutRef.current = setTimeout(() => setIsActive(true), 400);
    }
  };

  const handleMouseLeave = () => {
    isMouseOverRef.current = false;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
    setIsActive(false);
  };

  const showHeader = headerMode === 'always' || (headerMode === 'hover' && isActive);

  const headerContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GripVertical className="text-muted-foreground h-4 w-4" />
        <CardTitle className="text-sm font-medium uppercase tracking-wider">{title}</CardTitle>
        {headerExtra}
      </div>
      <div className="flex items-center gap-1">
        {onHeaderModeChange && (
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2" align="end">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 px-1">Header</p>
              {(['always', 'hover', 'hidden'] as const).map((mode) => (
                <button
                  key={mode}
                  className={cn(
                    'flex w-full items-center px-2 py-1.5 text-sm rounded-md hover:bg-accent',
                    headerMode === mode && 'bg-accent',
                  )}
                  onClick={() => {
                    onHeaderModeChange(mode);
                    setSettingsOpen(false);
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
        {supportsFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
        {!isLocked && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-red-500"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          'h-full dashboard-card',
          noPadding ? 'p-0! gap-0!' : 'py-2! gap-1!',
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isActive && <div className="absolute inset-0 z-50" />}
        {headerMode === 'always' && (
          <CardHeader className="drag-handle cursor-move shrink-0 pb-1">
            {headerContent}
          </CardHeader>
        )}
        {headerMode === 'hover' && (
          <div
            className={cn(
              'drag-handle cursor-move overflow-hidden transition-all duration-300',
              showHeader
                ? 'max-h-10 opacity-100 py-1.5 px-3'
                : 'max-h-0 opacity-0 py-0 px-3',
            )}
          >
            {headerContent}
          </div>
        )}
        <CardContent
          className={cn(
            'flex-1 min-h-0',
            noPadding ? 'px-0!' : 'px-2!',
            scrollable
              ? isActive
                ? 'overflow-y-auto'
                : 'overflow-hidden'
              : 'overflow-hidden',
          )}
        >
          {children(false)}
        </CardContent>
      </Card>

      {supportsFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="fullscreen-widget-dialog max-w-[95vw] h-[90vh] flex flex-col">
            <DialogHeader className="shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-medium uppercase tracking-wider">
                  {title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsFullscreen(false)}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto">{children(true)}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
