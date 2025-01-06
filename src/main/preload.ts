import {contextBridge, ipcRenderer, shell} from 'electron';
import {GameInstallInfo} from "../renderer/types/GameInstallInfo";

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),

  // Show Directory or File selector
  showDialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('show-dialog', options),

  // Get platform name by process.platform
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Get OS default language
  getLocale: () => ipcRenderer.invoke('get-locale'),

  // Open external link in browser
  openExternal: (url: string) => shell.openExternal(url),

  // Download file
  downloadFile: (url: string, savePath: string) => ipcRenderer.invoke('download-file', { url, savePath }),

  // Get download progress
  onDownloadProgress: (callback: (progress: number) => void) => ipcRenderer.on('download-progress', (_, progress) => callback(progress)),

  // Extract *.zip file
  extractZip: (filePath: string) => ipcRenderer.invoke('extract-zip', filePath),

  // Get extraction progress
  onExtractProgress: (callback: (progress: number) => void) => ipcRenderer.on('extract-progress', (_, progress) => callback(progress)),

  // Open file
  runCommand: (command: string) => ipcRenderer.invoke('run-command', command),

  // Remove file
  removeFile: (targetPath: string) => ipcRenderer.invoke('remove-file', targetPath),

  // electron-store:insert
  setGameInstallInfo: (value: GameInstallInfo) => ipcRenderer.invoke('game-install-info-insert', value),

  // electron-store:get
  getGameInstallInfoByIndex: (gameIdIndex: number) => ipcRenderer.invoke('game-install-info-get-by-index', gameIdIndex),

  // electron-store:delete
  deleteGameInstallInfo: (gameIdIndex: number) => ipcRenderer.invoke('game-install-info-delete', gameIdIndex),

  // electron-store:update
  updateGameInstallInfo: (gameIdIndex: number, gameInstallInfo: GameInstallInfo) => ipcRenderer.invoke('game-install-info-update', gameIdIndex, gameInstallInfo),

  // Check is game path valid
  checkPathValid: (dirPath: string) => ipcRenderer.invoke('check-executable-or-app', dirPath),
});