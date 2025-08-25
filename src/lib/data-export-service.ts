import { Mantra, MantraSession } from '@/lib/types';
import { getMantras, getSessions, saveMantras, saveSessions } from '@/lib/mantra-service';

export interface ExportData {
  version: string;
  exportDate: string;
  mantras: Mantra[];
  sessions: MantraSession[];
  metadata: {
    totalMantras: number;
    totalSessions: number;
    dateRange: {
      earliest: string | null;
      latest: string | null;
    };
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    mantras: number;
    sessions: number;
  };
  errors: string[];
  warnings: string[];
}

export class DataExportService {
  private static readonly VERSION = '1.0.0';
  private static readonly FILENAME = 'mantra-tracker-backup.json';

  // Export all mantra data
  static exportData(): ExportData {
    const mantras = getMantras();
    const sessions = getSessions();

    // Calculate metadata
    const sessionDates = sessions.map(s => new Date(s.date).getTime());
    const earliest = sessionDates.length > 0 ? new Date(Math.min(...sessionDates)).toISOString() : null;
    const latest = sessionDates.length > 0 ? new Date(Math.max(...sessionDates)).toISOString() : null;

    return {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      mantras,
      sessions,
      metadata: {
        totalMantras: mantras.length,
        totalSessions: sessions.length,
        dateRange: {
          earliest,
          latest
        }
      }
    };
  }

  // Export data as JSON string
  static exportAsJSON(): string {
    const data = this.exportData();
    return JSON.stringify(data, null, 2);
  }

  // Export data as downloadable file
  static downloadAsFile(filename?: string): void {
    const data = this.exportAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    
    // Check if user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, create a data URL and open in new tab
      const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.target = '_blank';
      link.download = filename || this.FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For desktop, use the original approach
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || this.FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Import data from JSON string
  static importFromJSON(jsonString: string, mergeMode: 'replace' | 'merge' = 'merge'): ImportResult {
    const result: ImportResult = {
      success: false,
      imported: { mantras: 0, sessions: 0 },
      errors: [],
      warnings: []
    };

    try {
      const importData: ExportData = JSON.parse(jsonString);

      // Validate import data structure
      const validation = this.validateImportData(importData);
      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        return result;
      }

      // Import mantras
      const mantraResult = this.importMantras(importData.mantras, mergeMode);
      result.imported.mantras = mantraResult.imported;
      result.warnings.push(...mantraResult.warnings);

      // Import sessions
      const sessionResult = this.importSessions(importData.sessions, mergeMode);
      result.imported.sessions = sessionResult.imported;
      result.warnings.push(...sessionResult.warnings);

      result.success = true;
      return result;

    } catch (error) {
      result.errors.push(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Import data from file
  static importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = this.importFromJSON(content);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            imported: { mantras: 0, sessions: 0 },
            errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
          });
        }
      };
      reader.onerror = () => {
        resolve({
          success: false,
          imported: { mantras: 0, sessions: 0 },
          errors: ['Failed to read file'],
          warnings: []
        });
      };
      reader.readAsText(file);
    });
  }

  // Validate import data structure
  private static validateImportData(data: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { isValid: false, errors };
    }

    const importData = data as Record<string, unknown>;

    if (!importData.version) {
      errors.push('Missing version information');
    }

    if (!Array.isArray(importData.mantras)) {
      errors.push('Invalid mantras data');
    }

    if (!Array.isArray(importData.sessions)) {
      errors.push('Invalid sessions data');
    }

    // Validate mantra structure
    if (Array.isArray(importData.mantras)) {
      importData.mantras.forEach((mantra: unknown, index: number) => {
        const mantraObj = mantra as Record<string, unknown>;
        if (!mantraObj.id || !mantraObj.title || !mantraObj.text || typeof mantraObj.goal !== 'number') {
          errors.push(`Invalid mantra structure at index ${index}`);
        }
      });
    }

    // Validate session structure
    if (Array.isArray(importData.sessions)) {
      importData.sessions.forEach((session: unknown, index: number) => {
        const sessionObj = session as Record<string, unknown>;
        if (!sessionObj.id || !sessionObj.mantraId || typeof sessionObj.count !== 'number' || !sessionObj.date) {
          errors.push(`Invalid session structure at index ${index}`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  // Import mantras with conflict resolution
  private static importMantras(mantras: Mantra[], mergeMode: 'replace' | 'merge'): { imported: number; warnings: string[] } {
    const warnings: string[] = [];
    let imported = 0;

    if (mergeMode === 'replace') {
      // Replace all existing mantras
      saveMantras(mantras);
      imported = mantras.length;
    } else {
      // Merge mode: check for conflicts
      const existingMantras = getMantras();
      const existingIds = new Set(existingMantras.map(m => m.id));
      const newMantras = [...existingMantras];

      mantras.forEach(mantra => {
        if (existingIds.has(mantra.id)) {
          warnings.push(`Mantra "${mantra.title}" already exists, skipping`);
        } else {
          newMantras.push(mantra);
          imported++;
        }
      });

      saveMantras(newMantras);
    }

    return { imported, warnings };
  }

  // Import sessions with conflict resolution
  private static importSessions(sessions: MantraSession[], mergeMode: 'replace' | 'merge'): { imported: number; warnings: string[] } {
    const warnings: string[] = [];
    let imported = 0;

    if (mergeMode === 'replace') {
      // Replace all existing sessions
      saveSessions(sessions);
      imported = sessions.length;
    } else {
      // Merge mode: check for conflicts
      const existingSessions = getSessions();
      const existingIds = new Set(existingSessions.map(s => s.id));
      const newSessions = [...existingSessions];

      sessions.forEach(session => {
        if (existingIds.has(session.id)) {
          warnings.push(`Session ${session.id} already exists, skipping`);
        } else {
          newSessions.push(session);
          imported++;
        }
      });

      saveSessions(newSessions);
    }

    return { imported, warnings };
  }

  // Get export summary
  static getExportSummary(): { mantras: number; sessions: number; sizeEstimate: string } {
    const data = this.exportData();
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    
    let sizeEstimate: string;
    if (sizeInBytes < 1024) {
      sizeEstimate = `${sizeInBytes} bytes`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeEstimate = `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      sizeEstimate = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return {
      mantras: data.mantras.length,
      sessions: data.sessions.length,
      sizeEstimate
    };
  }
}