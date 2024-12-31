import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message)
})

contextBridge.exposeInMainWorld('i18n', {
  t: (key: string): Promise<string> => ipcRenderer.invoke('translate', key),
  changeLanguage: (lng: string): Promise<void> => ipcRenderer.invoke('change-language', lng),
});