'use client';

import { useRouter } from 'next/navigation';
import { DashboardGrid } from 'dashboard-pkg';
import { useSidebar } from '@repo/ui/components/ui/sidebar';

import { widgetRegistry, CATEGORIES } from './widgets/registry';
import { defaultLayouts, createWebAppInitialStore } from '@/hooks/use-dashboard-config';

export function DashboardGridWrapper() {
  const router = useRouter();
  const { state: sidebarState } = useSidebar();

  return (
    <DashboardGrid
      widgetRegistry={widgetRegistry}
      categories={CATEGORIES}
      defaultLayouts={defaultLayouts}
      symbolSearchUrl="/api/symbol-search"
      onNavigateToGallery={() => router.push('/dashboard/widgets')}
      externalLayoutTrigger={sidebarState}
      initialStore={createWebAppInitialStore}
    />
  );
}
