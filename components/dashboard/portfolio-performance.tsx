'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@repo/ui/components/ui/chart';
import { GripVertical } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Mock data - replace with real API calls
const performanceData = [
  { date: '2024-01-01', value: 89234 },
  { date: '2024-01-08', value: 92145 },
  { date: '2024-01-15', value: 88932 },
  { date: '2024-01-22', value: 95421 },
  { date: '2024-01-29', value: 101234 },
  { date: '2024-02-05', value: 98765 },
  { date: '2024-02-12', value: 105432 },
  { date: '2024-02-19', value: 112876 },
  { date: '2024-02-26', value: 119234 },
  { date: '2024-03-04', value: 115678 },
  { date: '2024-03-11', value: 123456 },
  { date: '2024-03-18', value: 127453 },
];

const chartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'hsl(188, 94%, 43%)',
  },
};

export function PortfolioPerformance() {
  return (
    <Card className="h-full dashboard-card">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Portfolio Performance</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={performanceData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(188, 94%, 43%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(188, 94%, 43%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(String(value));
                    return date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    });
                  }}
                  formatter={(value) => (
                    <span className="font-mono font-bold">
                      ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(188, 94%, 43%)"
              fill="url(#colorValue)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
