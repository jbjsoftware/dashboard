'use client';

import { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { cn } from '@repo/ui/lib/utils';
import { useSymbolSearch } from '../use-symbol-search';

const POPULAR_SYMBOLS = [
  { value: 'BINANCE:BTCUSDT', label: 'BTC/USDT' },
  { value: 'BINANCE:ETHUSDT', label: 'ETH/USDT' },
  { value: 'BINANCE:SOLUSDT', label: 'SOL/USDT' },
  { value: 'BINANCE:ADAUSDT', label: 'ADA/USDT' },
  { value: 'BINANCE:XRPUSDT', label: 'XRP/USDT' },
  { value: 'COINBASE:BTCUSD', label: 'BTC/USD' },
  { value: 'COINBASE:ETHUSD', label: 'ETH/USD' },
];

interface CompactSymbolPickerProps {
  value: string;
  onChange: (symbol: string) => void;
  searchUrl: string;
}

export function CompactSymbolPicker({ value, onChange, searchUrl }: CompactSymbolPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { results, loading } = useSymbolSearch(search, searchUrl);

  const shortLabel = value.includes(':') ? value.split(':')[1] : value;
  const showSearchResults = search.length >= 2 && results.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-xs font-mono text-muted-foreground hover:text-foreground gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {shortLabel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[260px] p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <Input
            placeholder="Search symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search) {
                onChange(search.toUpperCase());
                setOpen(false);
                setSearch('');
              }
            }}
          />
        </div>
        <div className="max-h-[180px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {showSearchResults ? (
            results.map((r) => {
              const symbolValue = `${r.exchange}:${r.symbol}`;
              return (
                <button
                  key={symbolValue}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent',
                    value === symbolValue && 'bg-accent',
                  )}
                  onClick={() => {
                    onChange(symbolValue);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'h-3 w-3 shrink-0',
                      value === symbolValue ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="font-mono truncate">
                    {r.exchange}:{r.symbol}
                  </span>
                  <span className="text-muted-foreground truncate ml-auto">{r.description}</span>
                </button>
              );
            })
          ) : !loading ? (
            POPULAR_SYMBOLS.map((symbol) => (
              <button
                key={symbol.value}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent',
                  value === symbol.value && 'bg-accent',
                )}
                onClick={() => {
                  onChange(symbol.value);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Check
                  className={cn(
                    'h-3 w-3 shrink-0',
                    value === symbol.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="font-mono">{symbol.label}</span>
              </button>
            ))
          ) : null}
          {search &&
            !loading &&
            !results.some((r) => `${r.exchange}:${r.symbol}` === search.toUpperCase()) && (
              <button
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent text-muted-foreground"
                onClick={() => {
                  onChange(search.toUpperCase());
                  setOpen(false);
                  setSearch('');
                }}
              >
                <span className="font-mono">Use: {search.toUpperCase()}</span>
              </button>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
