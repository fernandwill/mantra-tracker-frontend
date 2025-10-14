"use client";

import { Dashboard } from "@/components/dashboard";
import { FullScreenLoader } from "@/components/home/full-screen-loader";
import { HomeHeader } from "@/components/home/home-header";
import { HomeTabs } from "@/components/home/home-tabs";
import { MobileControls } from "@/components/home/mobile-controls";
import { QuickAccessCard } from "@/components/home/quick-access-card";
import { MantraList } from "@/components/mantra-list";
import { useHomePage } from "@/lib/hooks/use-home-page";

export default function Home() {
  const {
    user,
    isLoading,
    mantras,
    isExporting,
    isImporting,
    activeTab,
    setActiveTab,
    handleCreateMantra,
    handleUpdateMantras,
    handleExportData,
    handleImportData,
  } = useHomePage();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-surface">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <MobileControls />
        <HomeHeader />
        <QuickAccessCard
          onCreate={handleCreateMantra}
          onExport={handleExportData}
          onImport={handleImportData}
          isExporting={isExporting}
          isImporting={isImporting}
        />
        <HomeTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
        {activeTab === "mantras" ? (
          <MantraList mantras={mantras} onUpdate={handleUpdateMantras} />
        ) : (
          <Dashboard />
        )}
        <footer className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Your data is stored locally. Continue your mindfulness practice.
          </p>
        </footer>
      </main>
    </div>
  );
}
