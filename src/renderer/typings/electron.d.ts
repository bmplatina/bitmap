import {ipcRenderer} from "electron";

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void

  showDialog: (options: Electron.OpenDialogOptions) => string,

  getPlatform: () => string,

  openExternal: (url: string) => void,

  downloadFile: (url: string | null, savePath: string) => string,
  onDownloadProgress: (callback: (progress: number) => void) => number,
  extractZip: (filePath: string) => string,
  onExtractProgress: (callback: (progress: number) => void) => number,

  runCommand: (command: string) => Promise<string>,
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
    i18n: {
      t: (key: string) => Promise<string>;
      changeLanguage: (lng: string) => Promise<void>;
    };
  }
}
