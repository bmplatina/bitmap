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

// Expose Window for Dialog Support
let MAIN_WINDOW: BrowserWindow;

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: "Bitmap",
    width: 1440,
    height: 900,
    minWidth: 1366,
    minHeight: 768,
    autoHideMenuBar: false,
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

  mainWindow.webContents.addListener('before-input-event', (event, input) => {
    // Ctrl + R 또는 F5를 눌렀을 때
    if ((input.key === 'r' && input.control) || input.key === 'F5') {
      event.preventDefault(); // 기본 동작 막기
    }
  });

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
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
});

// Delete file
ipcMain.handle('remove-file', async (event, targetPath: string): Promise<boolean> => {
  // 디렉터리 없을 시 생성
  const directory = dirname(targetPath);
  if(fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true });
  }
  return !fs.existsSync(directory);
});

// Save data
// 데이터 설정
ipcMain.handle('game-install-info-insert', (_, value: GameInstallInfo): Promise<any> => {
  return new Promise((resolve, reject) => {
    gameInstallInfoDb.insert(value, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
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
        resolve(numReplaced);
      }
    });
  })
});

// Store Init
ipcMain.handle('check-executable-or-app', async (_, dirPath: string): Promise<boolean> => {
  try {
    // 디렉터리 내용 읽기
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true });

    // .exe 파일 또는 .app 디렉터리가 있는지 검사
    return files.some((file) => {
      const ext = extname(file.name).toLowerCase();
      return (
          (file.isFile() && ext === '.exe') || // .exe 파일
          (file.isDirectory() && file.name.endsWith('.app')) // .app 디렉터리
      );
    });
  } catch (error) {
    console.error('오류 발생:', error);
    return false; // 오류 발생 시 false 반환
  }
});
