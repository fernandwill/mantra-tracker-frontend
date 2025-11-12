import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { DataExportService, type ImportResult } from "@/lib/data-export-service";
import { addMantra, getMantras } from "@/lib/mantra-service";
import { Mantra } from "@/lib/types";

export type HomeTab = "mantras" | "statistics";

interface CreateMantraData {
  title: string;
  text: string;
  goal: number;
}

const WELCOME_TOAST_DELAY = 500;
const AUTH_REDIRECT_DELAY = 50;

export function useHomePage() {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncingDropbox, setIsSyncingDropbox] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeTab>("mantras");

  const { user, token, isLoading, isNewUser } = useAuth();
  const router = useRouter();

  const refreshData = useCallback(() => {
    const updatedMantras = getMantras();
    setMantras(updatedMantras);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      const timeout = setTimeout(() => {
        if (!user) {
          router.push("/auth/signin");
        }
      }, AUTH_REDIRECT_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    refreshData();

    const sessionKey = `welcomed_${user.id}_${new Date().toDateString()}`;
    const hasShownWelcome = sessionStorage.getItem(sessionKey);

    if (!hasShownWelcome) {
      const timeout = setTimeout(() => {
        const message = isNewUser
          ? `Welcome, ${user.name}! 🙏`
          : `Welcome back, ${user.name}! 🙏`;
        const description = isNewUser
          ? "Begin your mindfulness journey"
          : "Continue your mindfulness journey";

        toast.success(message, {
          description,
          duration: 4000,
        });
        sessionStorage.setItem(sessionKey, "true");
      }, WELCOME_TOAST_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [user, isNewUser, refreshData]);

  const handleCreateMantra = useCallback(
    (mantraData: CreateMantraData) => {
      const newMantra = addMantra(mantraData);
      setMantras((prev) => [...prev, newMantra]);
      refreshData();
    },
    [refreshData]
  );

  const handleUpdateMantras = useCallback(
    (updatedMantras: Mantra[]) => {
      setMantras(updatedMantras);
      refreshData();
    },
    [refreshData]
  );

  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        toast.info(
          "Export file will open in a new tab. Please use your browser's save option to download it."
        );
      }

      DataExportService.downloadAsFile();
      toast.success("Data exported successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to export data: ${errorMessage}`);
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImportData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const result = (await DataExportService.importFromFile(file)) as ImportResult;

        if (result.success) {
          toast.success(
            `Import successful! Imported ${result.imported.mantras} mantras and ${result.imported.sessions} sessions`
          );
          refreshData();

          if (result.warnings.length > 0) {
            console.warn("Import warnings:", result.warnings);
          }
        } else {
          toast.error(`Import failed: ${result.errors.join(", ")}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to import data: ${errorMessage}`);
        console.error("Import error:", error);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  }, [refreshData]);

  const handleSyncToDropbox = useCallback(async () => {
    if (!token) {
      toast.error("Dropbox sync requires authentication. Please sign in again.");
      return;
    }

    setIsSyncingDropbox(true);

    try {
      const content = DataExportService.exportAsJSON();
      const response = await fetch("/api/dropbox/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: "mantra-tracker-backup",
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          (errorData && (errorData.error || errorData.details)) ||
          "Failed to sync with Dropbox.";
        throw new Error(errorMessage);
      }

      toast.success("Backup synced to Dropbox successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Dropbox sync failed: ${errorMessage}`);
      console.error("Dropbox sync error:", error);
    } finally {
      setIsSyncingDropbox(false);
    }
  }, [token]);

  return {
    user,
    isLoading,
    mantras,
    isExporting,
    isImporting,
    isSyncingDropbox,
    activeTab,
    setActiveTab,
    handleCreateMantra,
    handleUpdateMantras,
    handleExportData,
    handleImportData,
    handleSyncToDropbox,
  };
}
