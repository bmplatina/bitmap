import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join } from 'path';

// i18n
import i18n from 'i18next';
import i18n_backend from 'i18next-fs-backend';
// import Store from 'electron-store';
import path from 'path';

// const store = new Store<{ language: string }>();

i18n.use(i18n_backend).init({
  lng: /* store.get('language') || */ 'ko', // Saved language or default language
  fallbackLng: 'en',
  backend: {
    loadPath: path.join(__dirname, '../locales/{{lng}}.json'),  // Locate Localization script
  },
}).then(() => {
  console.log('i18n loaded');
});

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

// i18n IPC 핸들러 등록
ipcMain.handle('translate', (_, key: string) => {
  return i18n.t(key); // 번역 결과 반환
});

ipcMain.handle('change-language', (_, lng: string) => {
  i18n.changeLanguage(lng); // 언어 변경
  // store.set('language', lng); // 언어 설정 저장
});