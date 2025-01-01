import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  showDialog: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('show-dialog', options),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
});
