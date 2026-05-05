'use client';

import { useState, useEffect, useRef } from 'react';

export interface SymbolResult {
  symbol: string;
  exchange: string;
  description: string;
  type: string;
}

function stripHighlight(str: string): string {
  return str.replace(/<\/?em>/g, '');
}

export function useSymbolSearch(query: string, searchUrl: string) {
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${searchUrl}?text=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Search failed');

        const data = await res.json();
        const symbols: SymbolResult[] = (data.symbols || [])
          .slice(0, 20)
          .map(
            (s: {
              symbol: string;
              exchange: string;
              prefix?: string;
              source_id?: string;
              description: string;
              type: string;
            }) => ({
              symbol: stripHighlight(s.symbol),
              exchange: s.prefix || s.source_id || s.exchange,
              description: stripHighlight(s.description),
              type: s.type,
            }),
          );

        if (!controller.signal.aborted) {
          setResults(symbols);
          setLoading(false);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError('Search failed');
          setResults([]);
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, searchUrl]);

  return { results, loading, error };
}
