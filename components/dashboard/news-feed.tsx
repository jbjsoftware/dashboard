'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { GripVertical, ExternalLink } from 'lucide-react';

// Mock data - replace with real API calls
const news = [
  {
    id: 1,
    title: 'Bitcoin ETF Sees Record Inflows',
    source: 'CoinDesk',
    time: '15m ago',
    url: '#',
  },
  {
    id: 2,
    title: 'Ethereum Network Upgrade Successfully Deployed',
    source: 'Decrypt',
    time: '1h ago',
    url: '#',
  },
  {
    id: 3,
    title: 'SEC Approves New Crypto Regulations',
    source: 'Bloomberg Crypto',
    time: '2h ago',
    url: '#',
  },
  {
    id: 4,
    title: 'Major DeFi Protocol Announces V3 Launch',
    source: 'The Block',
    time: '4h ago',
    url: '#',
  },
];

export function NewsFeed() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Crypto News</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="group block border-b pb-3 last:border-0 last:pb-0 transition-all hover:translate-x-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
                <ExternalLink className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
