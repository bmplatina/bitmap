import { app, BrowserWindow, ipcMain, session, dialog } from 'electron';
import Datastore from 'nedb';
import { join, dirname, extname } from 'path';
import * as fs from 'fs';
import axios from 'axios';
import unzipper from 'unzipper';
import { exec } from "node:child_process";
import { GameInstallInfo } from "../renderer/types/GameInstallInfo";

// Platform
const platformName: string = process.platform;
const bIsDev: boolean = process.env.NODE_ENV === 'development';

// Parameter saver
const dbPath: string = bIsDev ? './gameInstallInfo.db' : join(app.getPath('userData'), 'gameInstallInfo.db');
const gameInstallInfoDb = new Datastore({ filename: dbPath, autoload: true });

// Auto updater
import { autoUpdater } from "electron-updater";
import ProgressBar from "electron-progressbar";
import {tr} from "vuetify/locale";
let progressBar: ProgressBar;
let updaterIntervalId: NodeJS.Timeout;

// Expose Window for Dialog Support
let MAIN_WINDOW: BrowserWindow;
let SETTINGS_WINDOW: BrowserWindow;

function createMainWindow () {
  const mainWindow = new BrowserWindow({
    title: "Bitmap",
    width: 1440,
    height: 900,
    minWidth: 1366,
    minHeight: 768,
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: {x: 17, y: 16 },
    ...(platformName !== 'darwin' ? { titleBarOverlay: true} : {}),
    frame: false, // platformName === 'darwin',
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
  MAIN_WINDOW = createMainWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "frame-src https://www.youtube.com/"
        ]
      }
    })
  });

  autoUpdater.checkForUpdatesAndNotify();

  updaterIntervalId = setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60 * 60 * 1000); // 1시간마다 체크

  MAIN_WINDOW.webContents.addListener('before-input-event', (event, input) => {
    // Ctrl + R 또는 F5를 눌렀을 때
    if ((input.key === 'r' && input.control) || input.key === 'F5') {
      event.preventDefault(); // 기본 동작 막기
    }
  });

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
      createMainWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('will-quit', function () {
  clearInterval(updaterIntervalId);
})

// Updater events
autoUpdater.on('update-available', () => {
  console.log('업데이트가 가능합니다.');
});

autoUpdater.on("update-not-available", () => {
  console.log("업데이트 불가");
});

autoUpdater.once("download-progress", () => {
  console.log("설치 중");

  progressBar = new ProgressBar({
    text: "Download 합니다."
  });

  progressBar
      .on("completed", () => {
        console.log("설치 완료");
      })
      .on("aborted", () => {
        console.log("aborted");
      });
});

autoUpdater.on('update-downloaded', () => {
  console.log('업데이트가 다운로드되었습니다.');
  // 사용자에게 업데이트 설치 여부 확인
  progressBar.setCompleted();
  dialog.showMessageBox({
    type: 'info',
    title: '업데이트',
    message: '새 버전이 다운로드되었습니다. 지금 설치하시겠습니까?',
    buttons: ['예', '아니오']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

// 신호등 버튼
ipcMain.on('app-close', function (event) {
  MAIN_WINDOW.close();
});

ipcMain.on('app-minimize', function (event) {
  MAIN_WINDOW.minimize();
});

ipcMain.on('app-maximize', function (event) {
  if(MAIN_WINDOW.isMaximized()) {
    MAIN_WINDOW.restore();
  }
  else {
    MAIN_WINDOW.maximize();
  }

});

ipcMain.handle('is-maximized', (event) => {
  return MAIN_WINDOW.isMaximized();
});

// 파일 경로 지정
ipcMain.handle('show-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(MAIN_WINDOW, options);
  return result.filePaths[0]; // 사용자가 선택한 파일 경로
});

// 플랫폼 가져오기
ipcMain.handle('get-platform', (event) => {
  return platformName;
});

// 플랫폼 가져오기
ipcMain.handle('get-locale', (event): string => {
  return app.getLocale();
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
        console.log("'run-command' error", stderr, error);
        reject(stderr || error.message);
      } else {
        console.log("'run-command' completed", stdout);
        resolve(stdout);
      }
    });
  });
});

// Check Is Installed
ipcMain.handle('check-executable-or-app', (event, dirPath: string): boolean => {
  try {
    const extensionName = platformName === 'darwin'
        ? '.app/'
        : '.exe';
    const targetPath = dirPath + extensionName;
    console.log(`dirPath: ${dirPath}, targetPath: ${targetPath}`);
    return fs.existsSync(targetPath);
  } catch (error) {
    console.error(error);
    return false;
  }
});

// Delete file
ipcMain.handle('remove-file',  (event, targetPath: string): boolean => {
  // 파일 또는 디렉터리가 존재하는지 확인
  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      // targetPath가 디렉터리라면 삭제
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      // targetPath가 파일이라면 삭제
      fs.unlinkSync(targetPath);
    }
  }

  // targetPath 삭제 여부 반환
  return !fs.existsSync(targetPath);
});

// Save data
// 데이터 설정
ipcMain.handle('game-install-info-insert', (_, value: GameInstallInfo): Promise<any> => {
  return new Promise((resolve, reject) => {
    gameInstallInfoDb.insert(value, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        gameInstallInfoDb.loadDatabase();
        resolve(newDoc);
      }
    })
  })
});

// 데이터 가져오기
ipcMain.handle('game-install-info-get-by-index', (_, gameIdIndex: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    gameInstallInfoDb.findOne({ gameId: gameIdIndex }, (err, docs: GameInstallInfo) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log("GetByIndex Succeed: ", typeof docs, docs);
        resolve(docs);
      }
    })
  })
});

// 데이터 삭제
ipcMain.handle('game-install-info-delete', (_, gameIdIndex: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    gameInstallInfoDb.remove({ gameId: gameIdIndex }, function (err, numRemoved) {
      if (err) {
        reject(err);
      } else {
        gameInstallInfoDb.loadDatabase();
        resolve(numRemoved);
      }
    });
  })
});

// 데이터 업데이트
ipcMain.handle('game-install-info-update', (event, gameIdIndex: number, gameInstallInfo: GameInstallInfo) => {
  // 조건에 맞는 데이터 업데이트
  return new Promise((resolve, reject) => {
    gameInstallInfoDb.update({ gameId: gameIdIndex }, { $set: gameInstallInfo }, { upsert: false }, function (err, numReplaced) {
      if (err) {
        reject(err);
      } else {
        gameInstallInfoDb.loadDatabase();
        resolve(numReplaced);
      }
    });
  })
});

ipcMain.handle('get-electron-appdata-path', async (event): Promise<string> => {
  return app.getPath('userData');
})