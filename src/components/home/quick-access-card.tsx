import { CloudUpload, Download, Upload } from "lucide-react";

import { CreateMantraDialog } from "@/components/create-mantra-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuickAccessCardProps {
  onCreate: (mantra: { title: string; text: string; goal: number }) => void;
  onExport: () => void;
  onImport: () => void;
  isExporting: boolean;
  isImporting: boolean;
  onSyncToDropbox: () => void;
  isSyncingDropbox: boolean;
}

export function QuickAccessCard({
  onCreate,
  onExport,
  onImport,
  isExporting,
  isImporting,
  onSyncToDropbox,
  isSyncingDropbox,
}: QuickAccessCardProps) {
  return (
    <Card className="border-0 shadow-xl mb-8 gradient-surface">
      <CardHeader>
        <CardTitle className="text-xl">Quick Access</CardTitle>
        <CardDescription>Begin your practice or manage your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <CreateMantraDialog onCreate={onCreate} id="create-mantra-button" />

          <Button
            size="lg"
            variant="outline"
            className="w-full flex-1 border-2 hover:bg-muted/50"
            onClick={onExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full flex-1 border-2 hover:bg-muted/50"
            onClick={onImport}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? "Importing..." : "Import Data"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full flex-1 border-2 hover:bg-muted/50"
            onClick={onSyncToDropbox}
            disabled={isSyncingDropbox}
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            {isSyncingDropbox ? "Syncing..." : "Sync to Dropbox"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
