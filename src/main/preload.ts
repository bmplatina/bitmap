import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),

  // Show Directory or File selector
  showDialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('show-dialog', options),

  // Get platform name by process.platform
  getPlatform: () => ipcRenderer.invoke('get-platform'),

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
});
