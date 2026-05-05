'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { GripVertical, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

import type { WidgetComponentProps } from 'dashboard-pkg';

interface CycleEvent {
  date: string;
  fullDate: Date;
  price: number;
  type: 'bull' | 'bear' | 'predicted';
  label: string;
  cycle: string;
}

const btcCycles: CycleEvent[] = [
  { 
    cycle: 'Early 2011',
    date: 'Jun 2011', 
    fullDate: new Date('2011-06-08'), 
    price: 26.90, 
    type: 'bull', 
    label: 'Early 2011 Peak' 
  },
  { 
    cycle: '2011 Bear',
    date: 'Nov 2011', 
    fullDate: new Date('2011-11-18'), 
    price: 2.00, 
    type: 'bear', 
    label: '2011 Low' 
  },
  { 
    cycle: '2013 Bull',
    date: 'Dec 2013', 
    fullDate: new Date('2013-12-04'), 
    price: 1242, 
    type: 'bull', 
    label: '2013 Peak' 
  },
  { 
    cycle: '2014 Bear',
    date: 'Jan 2015', 
    fullDate: new Date('2015-01-14'), 
    price: 177, 
    type: 'bear', 
    label: '2015 Low' 
  },
  { 
    cycle: '2017 Bull',
    date: 'Dec 2017', 
    fullDate: new Date('2017-12-17'), 
    price: 19783, 
    type: 'bull', 
    label: '2017 Peak' 
  },
  { 
    cycle: '2018 Bear',
    date: 'Dec 2018', 
    fullDate: new Date('2018-12-07'), 
    price: 3300, 
    type: 'bear', 
    label: '2018 Low' 
  },
  { 
    cycle: '2021 Bull',
    date: 'Nov 2021', 
    fullDate: new Date('2021-11-09'), 
    price: 67949, 
    type: 'bull', 
    label: '2021 ATH' 
  },
  { 
    cycle: '2022 Bear',
    date: 'Jun 2022', 
    fullDate: new Date('2022-06-18'), 
    price: 17769, 
    type: 'bear', 
    label: '2022 Low' 
  },
  { 
    cycle: '2024–2025 Bull',
    date: 'Oct 2025', 
    fullDate: new Date('2025-10-05'), 
    price: 125725, 
    type: 'bull', 
    label: '2025 Peak' 
  },
];

function calculateDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate predicted cycles based on historical averages
function calculatePredictions(): CycleEvent[] {
  const predictions: CycleEvent[] = [];
  
  // Get all bull-to-bear transitions (peak to low)
  const bullToBearTransitions = [];
  for (let i = 0; i < btcCycles.length - 1; i++) {
    if (btcCycles[i].type === 'bull' && btcCycles[i + 1].type === 'bear') {
      bullToBearTransitions.push({
        days: calculateDaysBetween(btcCycles[i].fullDate, btcCycles[i + 1].fullDate),
        drawdown: ((btcCycles[i + 1].price / btcCycles[i].price - 1) * 100)
      });
    }
  }
  
  // Get all bear-to-bull transitions (low to peak)
  const bearToBullTransitions = [];
  for (let i = 0; i < btcCycles.length - 1; i++) {
    if (btcCycles[i].type === 'bear' && btcCycles[i + 1].type === 'bull') {
      bearToBullTransitions.push({
        days: calculateDaysBetween(btcCycles[i].fullDate, btcCycles[i + 1].fullDate),
        gain: ((btcCycles[i + 1].price / btcCycles[i].price - 1) * 100)
      });
    }
  }
  
  // Calculate averages for peak to low
  const avgDaysToBear = Math.round(
    bullToBearTransitions.reduce((sum, t) => sum + t.days, 0) / bullToBearTransitions.length
  );
  const avgDrawdown = 
    bullToBearTransitions.reduce((sum, t) => sum + t.drawdown, 0) / bullToBearTransitions.length;
  
  // Calculate averages for low to peak
  const avgDaysToBull = Math.round(
    bearToBullTransitions.reduce((sum, t) => sum + t.days, 0) / bearToBullTransitions.length
  );
  const avgGain = 
    bearToBullTransitions.reduce((sum, t) => sum + t.gain, 0) / bearToBullTransitions.length;
  
  // Last cycle is a bull peak (2025), so predict next low
  const lastCycle = btcCycles[btcCycles.length - 1];
  
  // Prediction 1: Next Low
  const predictedLowDate = new Date(lastCycle.fullDate);
  predictedLowDate.setDate(predictedLowDate.getDate() + avgDaysToBear);
  const predictedLowPrice = Math.round(lastCycle.price * (1 + avgDrawdown / 100));
  
  predictions.push({
    cycle: 'Predicted Bear',
    date: predictedLowDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fullDate: predictedLowDate,
    price: predictedLowPrice,
    type: 'predicted',
    label: 'Est. Next Low'
  });
  
  // Prediction 2: Following High
  const predictedHighDate = new Date(predictedLowDate);
  predictedHighDate.setDate(predictedHighDate.getDate() + avgDaysToBull);
  const predictedHighPrice = Math.round(predictedLowPrice * (1 + avgGain / 100));
  
  predictions.push({
    cycle: 'Predicted Bull',
    date: predictedHighDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fullDate: predictedHighDate,
    price: predictedHighPrice,
    type: 'predicted',
    label: 'Est. Next High'
  });
  
  return predictions;
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  return `$${price.toFixed(2)}`;
}

function formatDays(days: number): string {
  if (days < 60) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

function BtcCyclesInner() {
  const predictions = calculatePredictions();
  const allCycles = [...btcCycles, ...predictions];

  // Calculate average cycle metrics
  const bullToBearTransitions = btcCycles
    .map((c, i, arr) => {
      if (i > 0 && arr[i - 1].type === 'bull' && c.type === 'bear') {
        return {
          days: calculateDaysBetween(arr[i - 1].fullDate, c.fullDate),
          drawdown: ((c.price / arr[i - 1].price - 1) * 100)
        };
      }
      return null;
    })
    .filter(Boolean) as { days: number; drawdown: number }[];

  const avgDaysToBottom = Math.round(
    bullToBearTransitions.reduce((sum, t) => sum + t.days, 0) / bullToBearTransitions.length
  );

  const avgDrawdown = (
    bullToBearTransitions.reduce((sum, t) => sum + t.drawdown, 0) / bullToBearTransitions.length
  ).toFixed(1);

  return (
    <>
      <div className="relative overflow-hidden pb-2">
        <div className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="relative flex items-end gap-0 pb-20 pt-8" style={{ minWidth: 'max-content' }}>
            <div className="absolute bottom-20 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent" />

            {allCycles.map((cycle, index) => {
              const isBull = cycle.type === 'bull' || (cycle.type === 'predicted' && cycle.label.includes('High'));
              const isPredicted = cycle.type === 'predicted';
              const nextCycle = allCycles[index + 1];
              const daysBetween = nextCycle ? calculateDaysBetween(cycle.fullDate, nextCycle.fullDate) : null;
              const prevCycle = allCycles[index - 1];
              const changePercent = prevCycle
                ? ((cycle.price / prevCycle.price - 1) * 100)
                : 0;

              return (
                <div key={index} className="relative flex flex-col items-center" style={{ width: index < btcCycles.length - 1 ? '180px' : '200px' }}>
                  {nextCycle && (
                    <div className="absolute left-1/2 top-0 h-full" style={{ width: index < btcCycles.length - 1 ? '180px' : '200px', zIndex: 1 }}>
                      <svg className="h-full w-full" preserveAspectRatio="none">
                        <path
                          d={`M 0,${isBull ? '60' : '100'} Q 90,${isBull ? (nextCycle.type === 'bull' || (nextCycle.type === 'predicted' && nextCycle.label.includes('High')) ? '40' : '80') : '60'} 180,${(nextCycle.type === 'bull' || (nextCycle.type === 'predicted' && nextCycle.label.includes('High'))) ? '60' : '100'}`}
                          className={cn(
                            'fill-none stroke-2 transition-all',
                            isPredicted ? 'stroke-amber-500/40 stroke-dasharray-[5,5]' : 'stroke-border/60'
                          )}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}

                  <div
                    className={cn(
                      'timeline-event relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-lg transition-all',
                      'hover:scale-110 hover:shadow-xl',
                      isPredicted
                        ? 'border-amber-500 bg-amber-500/20 shadow-amber-500/30'
                        : isBull
                          ? 'border-emerald-500 bg-emerald-500/20 shadow-emerald-500/30'
                          : 'border-red-500 bg-red-500/20 shadow-red-500/30'
                    )}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      isPredicted
                        ? 'bg-amber-500'
                        : isBull
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                    )}>
                      {isPredicted ? (
                        <Clock className="h-5 w-5 text-white" />
                      ) : isBull ? (
                        <TrendingUp className="h-5 w-5 text-white" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-white" />
                      )}
                    </div>

                    {isPredicted && (
                      <div className="absolute inset-0 animate-ping rounded-full border-2 border-amber-500 opacity-20" />
                    )}
                  </div>

                  <div className="mt-3 w-44 rounded-lg border bg-card p-3 shadow-md">
                    <div className="mb-2 text-center">
                      <div className="font-mono text-sm font-bold">{cycle.date}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {cycle.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="mb-2 text-center">
                      <div className={cn(
                        'font-mono text-xl font-bold',
                        isPredicted ? 'text-amber-500' : isBull ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {formatPrice(cycle.price)}
                      </div>
                      {index > 0 && (
                        <div className={cn(
                          'mt-1 text-xs font-medium',
                          changePercent > 0 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(0)}%
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      'text-center text-[10px] font-semibold uppercase tracking-wide',
                      isPredicted ? 'text-amber-500' : isBull ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {cycle.label}
                    </div>

                    {daysBetween && (
                      <div className="mt-2 border-t pt-2 text-center">
                        <div className="text-muted-foreground flex items-center justify-center gap-1 text-[9px]">
                          <Clock className="h-3 w-3" />
                          <span className="font-bold">{daysBetween}d</span>
                          <span>({formatDays(daysBetween)})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 border-t pt-3">
          <div className="text-center">
            <div className="text-muted-foreground text-[9px] font-medium uppercase tracking-wide">Avg Peak→Low</div>
            <div className="font-mono text-sm font-bold">{avgDaysToBottom}d</div>
            <div className="text-muted-foreground text-[9px]">({Math.round(avgDaysToBottom / 30)}mo)</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-[9px] font-medium uppercase tracking-wide">Avg Drawdown</div>
            <div className="font-mono text-sm font-bold text-red-500">{avgDrawdown}%</div>
            <div className="text-muted-foreground text-[9px]">peak to low</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-[9px] font-medium uppercase tracking-wide">Total Cycles</div>
            <div className="font-mono text-sm font-bold">{btcCycles.filter(c => c.type === 'bull').length}</div>
            <div className="text-muted-foreground text-[9px]">bull markets</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes timeline-pop {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .timeline-event {
          animation: timeline-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--border) / 0.8);
        }
      `}</style>
    </>
  );
}

export function BtcCyclesContent(_props: WidgetComponentProps) {
  return <BtcCyclesInner />;
}

export function BtcCycles() {
  return (
    <Card className="h-full dashboard-card btc-cycles-timeline">
      <CardHeader className="drag-handle cursor-move pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="text-muted-foreground h-4 w-4" />
            <CardTitle className="text-sm font-semibold">BTC Market Cycles</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Bull</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Bear</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full border-2 border-amber-500 bg-amber-500/20" />
              <span className="text-muted-foreground">Forecast</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative overflow-hidden pb-2">
        <BtcCyclesInner />
      </CardContent>
    </Card>
  );
}
