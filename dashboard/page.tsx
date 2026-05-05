import { DashboardGridWrapper } from '@/components/dashboard/dashboard-grid-wrapper';
import { PriceWebSocketProvider } from '@/components/portfolio/price-websocket-provider';

export default async function Dashboard() {
  return (
    <div className="dashboard-container flex flex-col h-full p-6">
      <PriceWebSocketProvider />
      <DashboardGridWrapper />
    </div>
  );
}
