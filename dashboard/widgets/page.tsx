'use client';

import { useRouter } from 'next/navigation';
import { WidgetGallery, useDashboardStore } from 'dashboard-pkg';

import { widgetRegistry, CATEGORIES } from '@/components/dashboard/widgets/registry';

export default function WidgetGalleryPage() {
  const router = useRouter();
  const { activeDashboard, addWidget } = useDashboardStore();

  return (
    <div className="dashboard-container min-h-screen p-6">
      <WidgetGallery
        widgetRegistry={widgetRegistry}
        categories={CATEGORIES}
        activeWidgetTypes={activeDashboard.widgets.map((w) => w.type)}
        onAddWidget={addWidget}
        onBack={() => router.push('/dashboard')}
        symbolSearchUrl="/api/symbol-search"
      />
    </div>
  );
}
