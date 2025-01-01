import { app, BrowserWindow, ipcMain, session, dialog } from 'electron';
import { join } from 'path';

// Platform
const platformName: string = process.platform;
const bIsDev: boolean = process.env.NODE_ENV === 'development' || !process.argv.includes("--noDevServer");

// Expose Window for Dialog Support
let MAIN_WINDOW: BrowserWindow;

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: "Bitmap",
    width: 1366,
    height: 768,
    minWidth: 1280,
    minHeight: 720,
    autoHideMenuBar: true,
    fullscreenable: true,
    titleBarStyle: "hiddenInset",
    frame: platformName === 'darwin',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      webviewTag: true,
      devTools: bIsDev
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  MAIN_WINDOW = createWindow();

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

// 파일 경로 지정
ipcMain.handle('show-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(MAIN_WINDOW, options);
  return result.filePaths[0]; // 사용자가 선택한 파일 경로
});

// 플랫폼 가져오기
ipcMain.handle('get-platform', (event) => {
  return process.platform;
});