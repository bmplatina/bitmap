import { GameInstallInfo } from "../types/GameInstallInfo";
import Electron = require("electron");
import {ipcRenderer} from "electron";
import {Settings} from "../types/Settings";

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void,

  onFullscreenChange: (callback: (fullscreenState: boolean) => void) => void,
  removeFullscreenListener: () => void,

  closeApp: () => void,
  minimizeApp: () => void,
  maximizeApp: () => void,
  isMaximized: () => Promise<boolean>,

  showDialog: (options: Electron.OpenDialogOptions) => string,

  getPlatform: () => string,
  getLocale: () => string,

  openExternal: (url: string) => void,

  downloadFile: (url: string | null, savePath: string) => string,
  onDownloadProgress: (callback: (progress: number) => void) => number,
  extractZip: (filePath: string) => string,
  onExtractProgress: (callback: (progress: number) => void) => number,

  runCommand: (command: string) => Promise<string>,

  removeFile: (targetPath: string) => Promise<boolean>,

  setGameInstallInfo: (value: GameInstallInfo) => Promise<any>,
  getGameInstallInfoByIndex: (gameIdIndex: number) => Promise<any>,
  deleteGameInstallInfo: (gameIdIndex: number) => Promise<any>,
  updateGameInstallInfo: (gameIdIndex: number, gameInstallInfo: GameInstallInfo) => Promise<any>,

  updateSettings: (newSettings: Settings) => Promise<any>,
  getSettings: () => Promise<any>,

  checkPathValid: (dirPath: string) => Promise<boolean>,

  getElectronStoredPath: () => Promise<string>,

  login: (username: string, password: string) => Promise<any>,
  register: (username: string, email: string, password: string) => Promise<boolean>,
  logout: () => Promise<any>,
  getCookies: (cookieName: string) => Promise<string>,
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
