import { app, BrowserWindow, ipcMain, session, dialog } from 'electron';
import { join, dirname } from 'path';
import * as fs from 'fs';
import axios from 'axios';
import unzipper from 'unzipper';
import { exec } from "node:child_process";

// Platform
const platformName: string = process.platform;
const bIsDev: boolean = process.env.NODE_ENV === 'development';

// Expose Window for Dialog Support
let MAIN_WINDOW: BrowserWindow;

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: "Bitmap",
    width: 1400,
    height: 900,
    minWidth: 1366,
    minHeight: 768,
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

  if (bIsDev) {
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

// download
ipcMain.handle('download-file', async (event, { url, savePath }) => {
  // 디렉터리 없을 시 생성
  const directory = dirname(savePath);
  if(!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const writer = fs.createWriteStream(savePath);

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total!) * 100;
        event.sender.send('download-progress', progress);
      },
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return savePath; // 다운로드한 파일 경로 반환
  } catch (error) {
    console.error('다운로드 실패:', error);
    throw error;
  }
});

ipcMain.handle('extract-zip', async (event, zipPath) => {
  const extractPath = dirname(zipPath);

  try {
    const zip = fs.createReadStream(zipPath);
    const directory = await unzipper.Open.file(zipPath);
    const totalFiles = directory.files.length;
    let extractedFiles = 0;

    // 파일을 하나씩 해제하며 진행률 계산
    await new Promise<void>((resolve, reject) => {
      zip
          .pipe(unzipper.Extract({ path: extractPath }))
          .on('entry', (entry) => {
            extractedFiles++;
            const progress = Math.round((extractedFiles / totalFiles) * 100);
            event.sender.send('extract-progress', progress); // 진행률 전송
            entry.autodrain(); // 필요하지 않은 경우 스트림 자동 소멸
          })
          .on('close', resolve) // 압축 해제 완료
          .on('error', reject); // 에러 발생
    });

    fs.rmSync(zipPath, { recursive: true });

    if(platformName === 'darwin') {
      new Promise<string>((resolve, reject) => {
        exec(`chmod -R 755 "${extractPath}"`, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          }
          resolve(stdout);
        });
      })
    }

    return extractPath;
  } catch (error) {
    console.error('압축 해제 실패:', error);
    throw error;
  }
});

// Open File
ipcMain.handle('run-command', (event, command) => {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
});