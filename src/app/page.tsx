"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateMantraDialog } from "@/components/create-mantra-dialog";
import { MantraList } from "@/components/mantra-list";
import { Dashboard } from "@/components/dashboard";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { useAuth } from "@/lib/auth-context";
import {
  Download,
  Upload,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  BarChart,
} from "lucide-react";
import {
  getMantras,
  addMantra,
  getCurrentStreak,
  getTotalSessions,
} from "@/lib/mantra-service";
import { Mantra } from "@/lib/types";
import { DataExportService } from "@/lib/data-export-service";
import { toast } from "sonner";

export default function Home() {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalRepetitions, setTotalRepetitions] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"mantras" | "statistics">(
    "mantras"
  );
  const { user, isLoading, isNewUser } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Small delay to prevent race condition with auth context updates
      const timeout = setTimeout(() => {
        if (!user) {
          router.push("/auth/signin");
        }
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [user, isLoading, router]);

  const refreshData = () => {
    const updatedMantras = getMantras();
    setMantras(updatedMantras);
    setStreak(getCurrentStreak());

    // Calculate total repetitions across all mantras
    const total = updatedMantras.reduce((sum, mantra) => {
      return sum + getTotalSessions(mantra.id);
    }, 0);
    setTotalRepetitions(total);
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
      // Show welcome toast only once per session, different message for new vs returning users
      const sessionKey = `welcomed_${user.id}_${new Date().toDateString()}`; // Reset daily
      const hasShownWelcome = sessionStorage.getItem(sessionKey);
      
      if (!hasShownWelcome) {
        // Small delay to ensure the page has loaded
        setTimeout(() => {
          if (isNewUser) {
            toast.success(`Welcome, ${user.name}! 🙏`, {
              description: "Begin your mindfulness journey",
              duration: 4000,
            });
          } else {
            toast.success(`Welcome back, ${user.name}! 🙏`, {
              description: "Continue your mindfulness journey",
              duration: 4000,
            });
          }
          sessionStorage.setItem(sessionKey, "true");
        }, 500);
      }
    }
  }, [user, isNewUser]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleCreateMantra = (
    mantraData: Omit<Mantra, "id" | "createdAt" | "updatedAt">
  ) => {
    const newMantra = addMantra(mantraData);
    setMantras([...mantras, newMantra]);
    refreshData();
  };

  const handleUpdateMantras = (updatedMantras: Mantra[]) => {
    setMantras(updatedMantras);
    refreshData();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Check if user is on a mobile device
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        // Show instructions for mobile users
        toast.info(
          "Export file will open in a new tab. Please use your browser's save option to download it."
        );
      }

      DataExportService.downloadAsFile();
      toast.success("Data exported successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to export data: ${errorMessage}`);
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const result = await DataExportService.importFromFile(file);

        if (result.success) {
          toast.success(
            `Import successful! Imported ${result.imported.mantras} mantras and ${result.imported.sessions} sessions`
          );
          refreshData(); // Refresh the UI with new data

          if (result.warnings.length > 0) {
            console.warn("Import warnings:", result.warnings);
          }
        } else {
          toast.error(`Import failed: ${result.errors.join(", ")}`);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(`Failed to import data: ${errorMessage}`);
        console.error("Import error:", error);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // Cloud sync functionality removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Mobile Theme Toggle & User Profile - Top */}
        <div className="flex justify-end items-center gap-3 mb-4 md:hidden">
          <ThemeToggle />
          <UserProfileDropdown />
        </div>

        {/* Header Section */}
        <header className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mantra Tracker
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Cultivate mindfulness and track your spiritual journey with
              intention and grace
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Active Mantras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {mantras.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {mantras.length === 0
                  ? "Start your journey"
                  : mantras.length === 1
                  ? "1 active mantra"
                  : `${mantras.length} active mantras`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Total Repetitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalRepetitions}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalRepetitions === 0
                  ? "Begin today"
                  : totalRepetitions === 1
                  ? "1 repetition"
                  : `${totalRepetitions} repetitions`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {streak}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {streak === 0
                  ? "Days in a row"
                  : streak === 1
                  ? "1 day streak"
                  : `${streak} days streak`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Quick Access</CardTitle>
            <CardDescription>
              Begin your practice or manage your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CreateMantraDialog
                onCreate={handleCreateMantra}
                id="create-mantra-button"
              />

              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 hover:bg-muted/50"
                onClick={handleExportData}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 hover:bg-muted/50"
                onClick={handleImportData}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className={`rounded-none px-4 py-2 font-medium transition-colors mx-2 ${
                activeTab === "mantras"
                  ? "border-b-2 border-indigo-500 text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              onClick={() => setActiveTab("mantras")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Mantras
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none px-4 py-2 font-medium transition-colors mx-2 ${
                activeTab === "statistics"
                  ? "border-b-2 border-indigo-500 text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              onClick={() => setActiveTab("statistics")}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Statistics
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "mantras" ? (
          <MantraList
            mantras={mantras}
            onUpdate={handleUpdateMantras}
          />
        ) : (
          <Dashboard />
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Your data is stored locally. Continue your mindfulness practice.
          </p>
        </footer>
      </main>
    </div>
  );
}
