// Google Drive API integration for browser-based authentication
// This service handles authentication and file operations with Google Drive

import { ExportData } from './data-export-service'

declare global {
  interface Window {
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        init: (config: GoogleApiConfig) => Promise<void>;
        drive: {
          files: {
            list: (params: ListFilesParams) => Promise<GoogleApiResponse<FileListResponse>>;
            get: (params: GetFileParams) => Promise<GoogleApiResponse<string>>;
          };
        };
        request: (params: RequestParams) => Promise<GoogleApiResponse<CreateFileResponse>>;
      };
      auth2: {
        getAuthInstance: () => GoogleAuthInstance;
      };
    };
    google: unknown;
  }
}

interface GoogleApiConfig {
  apiKey: string;
  clientId: string;
  discoveryDocs: string[];
  scope: string;
}

interface GoogleApiResponse<T> {
  result: T;
  body: string;
}

interface GoogleAuthInstance {
  isSignedIn: {
    get: () => boolean;
  };
  currentUser: {
    get: () => {
      getAuthResponse: () => { access_token: string };
    };
  };
  signIn: () => Promise<{
    getAuthResponse: () => { access_token: string };
  }>;
  signOut: () => Promise<void>;
}

interface ListFilesParams {
  q?: string;
  fields?: string;
  orderBy?: string;
}

interface FileListResponse {
  files: DriveFile[];
}

interface GetFileParams {
  fileId: string;
  alt?: string;
}

interface RequestParams {
  path: string;
  method: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: string;
}

interface CreateFileResponse {
  id: string;
}

interface FileMetadata {
  name: string;
  parents?: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private isAuthenticated = false;
  private accessToken: string | null = null;

  // Google API configuration
  private readonly CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  private readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file';

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  // Initialize Google API
  async initialize(): Promise<void> {
    if (!this.CLIENT_ID || !this.API_KEY) {
      throw new Error('Google API credentials not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY');
    }

    // Load Google API script if not already loaded
    if (!window.gapi) {
      await this.loadGoogleAPI();
    }

    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: this.API_KEY,
            clientId: this.CLIENT_ID,
            discoveryDocs: [this.DISCOVERY_DOC],
            scope: this.SCOPES
          });

          const authInstance = window.gapi.auth2.getAuthInstance();
          this.isAuthenticated = authInstance.isSignedIn.get();
          
          if (this.isAuthenticated) {
            this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
          }

          resolve();
        } catch (error: unknown) {
          console.error('Google API initialization failed:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          reject(new Error(`Google API initialization failed: ${errorMessage}`));
        }
      });
    });
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = (event) => {
        console.error('Failed to load Google API script:', event);
        reject(new Error('Failed to load Google API. Please check your network connection and try again.'));
      };
      document.head.appendChild(script);
    });
  }

  // Authenticate user with Google
  async authenticate(): Promise<boolean> {
    try {
      await this.initialize();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!this.isAuthenticated) {
        const user = await authInstance.signIn();
        this.accessToken = user.getAuthResponse().access_token;
        this.isAuthenticated = true;
      }

      return true;
    } catch (error: unknown) {
      console.error('Authentication failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to authenticate with Google Drive: ${errorMessage}`);
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isAuthenticated = false;
      this.accessToken = null;
    }
  }

  // Check if user is authenticated
  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  // Save mantra data to Google Drive
  async saveDataToDrive(data: ExportData, filename = 'mantra-tracker-backup.json'): Promise<string> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const fileContent = JSON.stringify(data, null, 2);
      const metadata = {
        name: filename,
        parents: [], // Save to root folder
      };

      // Check if file already exists
      const existingFiles = await this.findFilesByName(filename);
      
      if (existingFiles.length > 0) {
        // Update existing file
        return await this.updateFile(existingFiles[0].id, fileContent, metadata);
      } else {
        // Create new file
        return await this.createFile(fileContent, metadata);
      }
    } catch (error: unknown) {
      console.error('Failed to save to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save data to Google Drive: ${errorMessage}`);
    }
  }

  // Load mantra data from Google Drive
  async loadDataFromDrive(filename = 'mantra-tracker-backup.json'): Promise<ExportData> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const files = await this.findFilesByName(filename);
      
      if (files.length === 0) {
        throw new Error('Backup file not found in Google Drive');
      }

      // Get the most recent file if multiple exist
      const latestFile = files.sort((a, b) => 
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      )[0];

      const fileContent = await this.downloadFile(latestFile.id);
      return JSON.parse(fileContent);
    } catch (error: unknown) {
      console.error('Failed to load from Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load data from Google Drive: ${errorMessage}`);
    }
  }

  // List backup files in Google Drive
  async listBackupFiles(): Promise<DriveFile[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: "name contains 'mantra-tracker' and mimeType='application/json'",
        fields: 'files(id, name, modifiedTime, size)',
        orderBy: 'modifiedTime desc'
      });

      return response.result.files || [];
    } catch (error: unknown) {
      console.error('Failed to list backup files:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list backup files: ${errorMessage}`);
    }
  }

  // Private helper methods
  private async findFilesByName(filename: string): Promise<DriveFile[]> {
    const response = await window.gapi.client.drive.files.list({
      q: `name='${filename}'`,
      fields: 'files(id, name, modifiedTime)',
    });

    return response.result.files || [];
  }

  private async createFile(content: string, metadata: FileMetadata): Promise<string> {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const requestBody = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;

    const request = window.gapi.client.request({
      path: 'https://www.googleapis.com/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: requestBody
    });

    const response = await request;
    return response.result.id;
  }

  private async updateFile(fileId: string, content: string, metadata: FileMetadata): Promise<string> {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const requestBody = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;

    const request = window.gapi.client.request({
      path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: requestBody
    });

    const response = await request;
    return response.result.id;
  }

  private async downloadFile(fileId: string): Promise<string> {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return response.body;
  }
}

// Export singleton instance
export const googleDriveService = GoogleDriveService.getInstance();