export interface PortfolioData {
  totalValue: number;
  change24h: number;
  changePercent: number;
  btcValue: number;
  high24h: number;
  low24h: number;
  allTimeChange: number;
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  percentage: number;
  value: number;
  color: string;
}

export interface Transaction {
  id: string | number;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  time: string;
  exchange: string;
  timestamp?: Date;
}

export interface MarketMover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  isPositive: boolean;
  volume?: number;
  marketCap?: number;
}

export interface NewsItem {
  id: string | number;
  title: string;
  source: string;
  time: string;
  url: string;
  thumbnail?: string;
  category?: string;
}

export interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ExchangeConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  accountCount?: number;
}

export interface DashboardLayoutConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}
