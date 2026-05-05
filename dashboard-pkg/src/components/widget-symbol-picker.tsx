'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { cn } from '@repo/ui/lib/utils';
import { useSymbolSearch } from '../use-symbol-search';

const POPULAR_SYMBOLS = [
  { value: 'BINANCE:BTCUSDT', label: 'BTC/USDT (Binance)' },
  { value: 'BINANCE:ETHUSDT', label: 'ETH/USDT (Binance)' },
  { value: 'BINANCE:SOLUSDT', label: 'SOL/USDT (Binance)' },
  { value: 'BINANCE:ADAUSDT', label: 'ADA/USDT (Binance)' },
  { value: 'BINANCE:DOTUSDT', label: 'DOT/USDT (Binance)' },
  { value: 'BINANCE:AVAXUSDT', label: 'AVAX/USDT (Binance)' },
  { value: 'BINANCE:LINKUSDT', label: 'LINK/USDT (Binance)' },
  { value: 'BINANCE:MATICUSDT', label: 'MATIC/USDT (Binance)' },
  { value: 'BINANCE:XRPUSDT', label: 'XRP/USDT (Binance)' },
  { value: 'BINANCE:DOGEUSDT', label: 'DOGE/USDT (Binance)' },
  { value: 'COINBASE:BTCUSD', label: 'BTC/USD (Coinbase)' },
  { value: 'COINBASE:ETHUSD', label: 'ETH/USD (Coinbase)' },
  { value: 'COINBASE:SOLUSD', label: 'SOL/USD (Coinbase)' },
  { value: 'BITSTAMP:BTCUSD', label: 'BTC/USD (Bitstamp)' },
  { value: 'KRAKEN:BTCUSD', label: 'BTC/USD (Kraken)' },
];

interface WidgetSymbolPickerProps {
  value: string;
  onChange: (symbol: string) => void;
  searchUrl: string;
}

export function WidgetSymbolPicker({ value, onChange, searchUrl }: WidgetSymbolPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { results, loading } = useSymbolSearch(search, searchUrl);

  const showSearchResults = search.length >= 2 && results.length > 0;

  const filtered = POPULAR_SYMBOLS.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.value.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = POPULAR_SYMBOLS.find((s) => s.value === value)?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-mono text-sm"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or enter custom symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search) {
                onChange(search.toUpperCase());
                setOpen(false);
                setSearch('');
              }
            }}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
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
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent',
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
                      'h-4 w-4 shrink-0',
                      value === symbolValue ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="font-mono">
                    {r.exchange}:{r.symbol}
                  </span>
                  <span className="text-muted-foreground text-xs ml-auto truncate max-w-[120px]">
                    {r.description}
                  </span>
                </button>
              );
            })
          ) : !loading ? (
            filtered.map((symbol) => (
              <button
                key={symbol.value}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent',
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
                    'h-4 w-4',
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
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent text-muted-foreground"
                onClick={() => {
                  onChange(search.toUpperCase());
                  setOpen(false);
                  setSearch('');
                }}
              >
                <span className="font-mono">Use custom: {search.toUpperCase()}</span>
              </button>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
