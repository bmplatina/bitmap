<script setup lang="ts">
// Libraries
import { onMounted, ref, computed } from 'vue'
import { Game } from "../types/GameList";
import { EInstallState, GameInstallInfo } from '../types/GameInstallInfo';
import { useI18n } from 'vue-i18n';
import dayjs from "dayjs";

// Images
import UnknownImage from '../assets/unknownImage.png';
import PlatformWindows11Image from '../assets/platformWindows11.png';
import PlatformMacOSImage from '../assets/platformMac.png';

// Markdown
import { MdPreview } from "md-editor-v3";


const { t } = useI18n();

const props = defineProps<{
  gameObject: Game,
  platform: string,
}>();

const YouTubeURL = computed(() => {
  return `https://www.youtube.com/embed/${props.gameObject.gameVideoURL}`;
});

/*
 * Released Ago
 */
function releasedAgo(): number {
  const today = dayjs();
  const releasedDateFormat = dayjs(props.gameObject.gameReleasedDate);
  return today.diff(releasedDateFormat, "years");
}

/*
 * External links
 */
function openExternal(event: MouseEvent) {
  event.preventDefault(); // 기본 동작 방지

  const target = event.target as HTMLAnchorElement; // 클릭된 요소를 Anchor로 타입 단언
  const url = target.href;

  window.electronAPI.openExternal(url); // 외부 브라우저에서 열기
}

/*
 * Modal state
 */
// const enum EModalState {
//   NotOpened,
//   DetailModalOpened,
//   InstallModalOpened,
//   UninstallModalOpened,
// }

let bIsDetailModalOpened = ref(false);
let bIsInstallModalOpened = ref(false);
let bIsUninstallModalOpened = ref(false);

function openInstallModal() {
  bIsInstallModalOpened.value = true;
  InstallationPath.value = DefaultInstallationPath.value;
}

/*
 * Download & Installation
 */
let bIsUpdatable = ref(false);
let downloadProgress = ref(0);
let extractProgress = ref(0);
let InstallationPath = ref('');
let CurrentVersion = ref(1);
let InstallState = ref<EInstallState>(EInstallState.NotInstalled);
let DefaultInstallationPath = ref('');

// NeDB Installation Info saver
async function pullInstallState() {
  try {
    // Declare default installation path
    const getDefaultInstallPath = window.electronAPI.getElectronStoredPath();
    getDefaultInstallPath.then((appPath) => {
      console.log("getDefaultInstallPath: ", appPath);
      DefaultInstallationPath.value = props.platform === 'darwin'
          ? `/Users/Shared/Bitmap Production/${props.gameObject.gameBinaryName}`
          : `${appPath}\\BitmapApps\\${props.gameObject.gameBinaryName}`;
    });

    const getResultLocal = window.electronAPI.getGameInstallInfoByIndex(props.gameObject.gameId);
    getResultLocal.then((resolvedData: GameInstallInfo) => {
      console.log("pullInstallState::resolvedData", resolvedData);
      // If getting from store succeed, allocate it to property
      if(!!resolvedData) {
        console.log("pullInstallState: If getting from store succeed, allocate it to property", resolvedData);
        InstallState.value = resolvedData.gameInstallState;
        InstallationPath.value = resolvedData.gameInstallationPath;
        CurrentVersion.value = resolvedData.gameInstalledVersion;
        if(props.gameObject.gameLatestRevision > CurrentVersion.value) {
          bIsUpdatable.value = true;
        }
      }
      // Otherwise, initialize property
      else {
        console.log('pullInstallState: Otherwise, initialize property');
        InstallationPath.value = '';
        InstallState.value = EInstallState.NotInstalled;
        CurrentVersion.value = 0;
      }

      // Check is installation path valid
      if(InstallationPath.value) {
        const literalInstallationPath = props.platform === 'darwin'
            ? `${InstallationPath.value}/${props.gameObject.gameBinaryName}`
            : `${InstallationPath.value}\\${props.gameObject.gameBinaryName}`;

        window.electronAPI.checkPathValid(literalInstallationPath).then((bIsValid: boolean) => {
          console.log(`pullInstallState::checkPathValid: ${bIsValid} from game ${props.gameObject.gameTitle}`);
          InstallState.value = bIsValid ? EInstallState.Installed : EInstallState.NotInstalled;
        });
      }
      else InstallState.value = EInstallState.NotInstalled;

      // Sync installation state
      pushInstallState();
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * Insert or Update InstallState: GameInstallInfo to NeDB
 */
async function pushInstallState() {
  try {
    const getResultLocal: Promise<GameInstallInfo> = window.electronAPI.getGameInstallInfoByIndex(props.gameObject.gameId);
    getResultLocal.then((resolvedData: GameInstallInfo) => {
      console.log("pushInstallState::resolvedData", resolvedData);
      let InstallInfo: GameInstallInfo = {
        ...props.gameObject,
        gameInstallationPath: InstallationPath.value,
        gameInstallState: InstallState.value,
        gameInstalledVersion: CurrentVersion.value,
      };

      const bUpdateExising: boolean = !!resolvedData;
      console.log("pushInstallState::bUpdateExisting", bUpdateExising);
      // If resolvedData valid, Update from existing table, otherwise insert new table
      if(bUpdateExising) {
        window.electronAPI.updateGameInstallInfo(props.gameObject.gameId, InstallInfo);
      }
      else {
        window.electronAPI.setGameInstallInfo(InstallInfo);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function downloadAndInstall(url: string | null, savePath: string) {
  if(url == null) return;

  const savePathLocal: string | null = props.platform === 'darwin'
      ? `${savePath}/${url.split('/')[url.split('/').length - 1]}`
      : `${savePath}\\${url.split('/')[url.split('/').length - 1]}`;
  console.log(`URL: ${url}, SavePath: ${savePathLocal}`);

  try {
    // 다운로드 진행률 수신
    window.electronAPI.onDownloadProgress((progress) => {
      InstallState.value = EInstallState.Downloading;
      downloadProgress.value = progress;
      console.log(`다운로드 중: ${downloadProgress.value}, EInstallState.Downloading: ${InstallState.value === EInstallState.Downloading}`);
    });

    // 다운로드 요청
    const filePath = await window.electronAPI.downloadFile(url, savePathLocal);
    console.log(`다운로드 완료: ${filePath}, EInstallState.Downloading: ${InstallState.value === EInstallState.Downloading}`);

    // 압축 해제 진행률 수신
    window.electronAPI.onExtractProgress((progress) => {
      InstallState.value = EInstallState.Extracting;
      extractProgress.value = progress;
      console.log(`압축 해제 중: ${downloadProgress.value}, EInstallState.Extracting: ${InstallState.value === EInstallState.Extracting}`);
    });

    // 압축 해제 요청
    const extractedPath = await window.electronAPI.extractZip(filePath);
    console.log(`압축 해제 완료: ${extractedPath}, EInstallState.Extracting: ${InstallState.value === EInstallState.Extracting}`);

    InstallState.value = EInstallState.Installed; // 작업 완료
    CurrentVersion.value = props.gameObject.gameLatestRevision;
    bIsInstallModalOpened.value = false;
    bIsUpdatable.value = false;
    pushInstallState();
    console.log(`설치 완료: EInstallState.Installed: ${InstallState.value === EInstallState.Installed}`);
  }
  catch (error) {
    InstallState.value = EInstallState.InstallError;
    console.error('오류 발생:', error);
  }
};

/*
 * Select installation directory
 */
async function selectDirectory() {
  const options = {
    title: t(''),
    properties: ['openDirectory'], // 폴더 선택 가능
  };

  try {
    const path = await (window as any).electronAPI.showDialog(options);
    if (path) {
      InstallationPath.value = props.platform === 'darwin'
          ? `${path}/${props.gameObject.gameBinaryName}/`
          : `${path}\\${props.gameObject.gameBinaryName}\\`; // 선택한 경로 저장
    }
  } catch (error) {
    console.error('파일 선택 중 오류 발생:', error);
  }
}

/*
 * Platform Compatibility
 */
function GetIsPlatformCompatible(): boolean {
  switch (props.platform) {
    case 'win32':
      return props.gameObject.gamePlatformWindows == 1;
    case 'darwin':
      return props.gameObject.gamePlatformMac == 1;
  }
  return false;
}

const bIsPlatformCompatible: boolean = GetIsPlatformCompatible();

/*
 * Get Download URL
 */
const DownloadUrl: string | null = props.platform === 'win32' ? props.gameObject.gameDownloadWinURL : props.gameObject.gameDownloadMacURL;

/*
 * Manage Application
 */
async function openApp() {
  let openCommand: string = "";

  if (props.platform === "win32") {
    if (InstallationPath.value.charAt(0) === "C") {
      openCommand = `"${InstallationPath.value}\\${props.gameObject.gameBinaryName}.exe"`;
    } else {
      openCommand = `${InstallationPath.value.charAt(0)}: ; "${InstallationPath.value}\\${props.gameObject.gameBinaryName}.exe"`;
    }
  } else if (props.platform === "darwin") {
    openCommand = `open "${InstallationPath.value}/${props.gameObject.gameBinaryName}.app"`;
  } else {
    console.error("지원하지 않는 플랫폼입니다.");
    return;
  }

  try {
    const result: string = await window.electronAPI.runCommand(openCommand);
    console.log("명령 실행 성공:", result);
  } catch (error) {
    console.error("명령 실행 중 오류:", error as string);
  }
}

async function removeApp() {
  if(InstallationPath.value) {
    console.log(InstallationPath.value);
    if(await window.electronAPI.removeFile(InstallationPath.value)) {
      InstallState.value = EInstallState.NotInstalled;
      InstallationPath.value = DefaultInstallationPath.value;
      bIsUninstallModalOpened.value = false;
      await pushInstallState();
    }
  }
}

onMounted(() => {
  pullInstallState();
})
</script>

<template>
  <!-- Button -->
  <v-card max-width="400">
    <v-img
      :src="gameObject.gameImageURL"
      :lazy-src="UnknownImage"
      :alt="gameObject.gameTitle"
      cover
      @click="bIsDetailModalOpened = true"
    ></v-img>
    <v-card-text>
      <div style="text-align: left;">
        <h2 class="title primary--text mb-2" @click="bIsDetailModalOpened = true">{{ gameObject.gameTitle }}</h2>
        <div class="d-flex align-center mb-2">
          <v-img
              :src="PlatformWindows11Image"
              v-if="props.gameObject.gamePlatformWindows == 1"
              :max-width="20"
              :max-height="20"
              style="margin-right: 8px"
          ></v-img>
          <v-img
              :src="PlatformMacOSImage"
              v-if="props.gameObject.gamePlatformMac == 1"
              :max-width="20"
              :max-height="20"
              style="margin-right: 8px"
          ></v-img>
        </div>
        <p class="mb-0">{{ `${$t('dev')}: ${gameObject.gameDeveloper}` }}</p>
        <p class="mb-0">{{ `${$t('genre')}: ${gameObject.gameGenre}` }}</p>
        <p class="mb-0">{{ `${$t('released-date')}: ${$filters.formatDate(gameObject.gameReleasedDate, $filters.getLanguage())}` }}</p>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="plain" @click="bIsDetailModalOpened = true">{{ $t('details') }}</v-btn>
      <v-btn
        variant="tonal"
        outlined color="primary"
        @click="openInstallModal()"
        v-if="InstallState === EInstallState.NotInstalled && props.gameObject.isReleased"
        :disabled="!bIsPlatformCompatible"
      >{{ $t('install') }}</v-btn>
      <v-btn
        variant="tonal"
        outlined color="primary"
        @click="openApp"
        v-if="InstallState === EInstallState.Installed"
      >{{ $t('play') }}</v-btn>
      <v-btn
        color="red"
        @click="bIsUninstallModalOpened = true"
        v-if="InstallState === EInstallState.Installed"
      >{{ $t('uninstall') }}</v-btn>
    </v-card-actions>
  </v-card>

  <!-- Detail View -->
  <v-dialog v-model="bIsDetailModalOpened" width="90%" height="80%">
    <v-card style="height: 100%;">
      <v-card-title class="headline grey lighten-2" primary-title>
        {{ $t('bitmap-store') }}: {{ gameObject.gameTitle }}
      </v-card-title>
      <v-divider />

      <v-row style="height: 80%;" class="d-flex">
        <v-col cols="3" class="d-flex flex-column align-items-center">
          <div>
            <v-img
                class="rounded-xl mx-auto"
                :src="gameObject.gameImageURL"
                :lazy-src="UnknownImage"
                :alt="gameObject.gameTitle"
                :max-width="240"
                style="margin-top: calc(4% + 16px)"
            ></v-img>
            <div class="d-flex justify-center align-center mt-5 w-100">
              <h2 class="text-h5 mr-2">{{ gameObject.gameTitle }}</h2>
              <p v-if="gameObject.isEarlyAccess" class="mb-0">{{ $t('early-access') }}</p>
            </div>
          </div>
        </v-col>

        <v-divider vertical style="margin-top: 12px; margin-bottom: 12px"></v-divider>

        <v-col cols="9" style="display: flex; flex-direction: column; height: 100%;" class="align-center">
          <div style="flex: 1; overflow-y: auto; margin-left: 4%; margin-right: 4%;">
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="$t('preview')"
                variant="tonal"
                style="white-space: pre-line;"
            >
              <iframe
                  :src="YouTubeURL"
                  class="mx-auto"
                  frameborder="0" allowfullscreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  style="width: 512px; height: 288px; margin-top: 4%"
                  referrerpolicy="no-referrer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="$filters.getLanguage() === 'ko' ? `${gameObject.gameTitle + $t('information-of')}` : `${$t('information-of') + gameObject.gameTitle}`"
                variant="tonal"
                style="white-space: pre-line;"
            >
              <v-card-text>
                <p>{{ $t('released-date') }}: {{ $filters.formatDate(gameObject.gameReleasedDate, $filters.getLanguage()) }} ({{ `${releasedAgo()}${$t('years-ago')}` }})</p>
                <p>{{ $t('genre') }}: {{ gameObject.gameGenre }}</p>
                <p>{{ $t('developer') }}: {{ gameObject.gameDeveloper }}</p>
                <p>{{ $t('publisher') }}: {{ gameObject.gamePublisher }}</p>
                <div v-if="GetIsPlatformCompatible()">
                  <v-divider style="margin-top: 1%; margin-bottom: 1%"/>
                  <p>{{ $t('latest-version') + gameObject.gameLatestRevision }}</p>
                  <p v-if="bIsUpdatable && InstallState === EInstallState.Installed">{{ $t('current-version') + CurrentVersion }}</p>
                </div>
                <a :href="gameObject.gameWebsite" @click="openExternal">{{ $t('official-website') }}</a>
              </v-card-text>
            </v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="gameObject.gameHeadline"
                variant="tonal"
                style="white-space: pre-line;"
            >
              <v-card-text>
                <MdPreview :modelValue="gameObject.gameDescription" theme="dark" />
              </v-card-text>
            </v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="$t('system-requirements')"
                variant="tonal"
            >
              <!-- Mac 지원 게임 -->
              <v-card-text v-if="platform === 'darwin' && props.gameObject.gamePlatformMac" style="white-space: pre-line;">
                {{ $t('macos-system-requirements').replace(/\\n/g, '\n') }}
              </v-card-text>
              <!-- Windows 지원 게임 -->
              <v-card-text v-else style="white-space: pre-line;">
                {{ $t('windows-system-requirements').replace(/\\n/g, '\n') }}
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            flat
            @click="openInstallModal()"
            v-if="InstallState === EInstallState.NotInstalled && props.gameObject.isReleased"
            :disabled="!bIsPlatformCompatible"
        >{{ bIsPlatformCompatible ? $t('install') : $t('unsupported-platform') }}</v-btn>
        <v-btn
            variant="tonal"
            color="primary"
            flat
            @click="openApp"
            v-if="InstallState === EInstallState.Installed"
        >{{ $t('play') }}</v-btn>
        <v-btn
            color="red"
            flat
            @click="bIsDetailModalOpened = false; bIsUninstallModalOpened = true; "
            v-if="InstallState === EInstallState.Installed"
        >{{ $t('uninstall') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Install View -->
  <v-dialog v-model="bIsInstallModalOpened" width="30%" height="75%" :persistent="InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting">
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        {{ $filters.getLanguage() == 'ko' ? gameObject.gameTitle + $t('installing') : $t('installing') + gameObject.gameTitle  }}
      </v-card-title>
      <v-divider />
      <div style="margin-top: 4%; margin-bottom: 1%; margin-left: 16%; margin-right: 16%;">
        <div style="text-align: center;">
          <v-img
              class="rounded-xl mx-auto"
              :src="gameObject.gameImageURL"
              lazy-src="../assets/unknownImage.png"
              :alt="gameObject.gameTitle"
              :width="144"
              aspect-ratio="1/1.414"
              cover
          ></v-img>
          <v-card-title>{{ gameObject.gameTitle }}</v-card-title>
        </div>
        <h2 class="display-1 my-5">{{ $t('installation-path') }}</h2>
        <v-text-field
            class="flex-grow-1 mr-2"
            :label="$t('installation-path')"
            v-model="InstallationPath"
            :rules="[v => !!v || 'Field is required']"
            @click="selectDirectory()"
            :hint="$t('installation-path-hint')"
            :disabled="InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting"
            persistent-hint
            readonly
            dense
        ></v-text-field>
        <v-card-text
            v-if="InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting"
        >
          {{ InstallState === EInstallState.Downloading ? `${$t('downloading')}: ${Math.round(downloadProgress)}%` : `${$t('writing-to-disk')}: ${extractProgress}%` }}
        </v-card-text>
        <v-progress-linear
            color="light-blue"
            height="10"
            :model-value="InstallState === EInstallState.Downloading ? downloadProgress : extractProgress"
            v-if="InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting"
            striped
        ></v-progress-linear>
<!--        <h2 class="display-1 my-5">디스크 공간</h2>-->
      </div>

      <v-spacer/>
      <v-divider/>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          flat
          @click="downloadAndInstall(DownloadUrl, InstallationPath)"
          :disabled="!bIsPlatformCompatible || InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting || InstallationPath === ''"
        >{{ $t('install') }}</v-btn>
        <v-btn
          color="red"
          flat
          @click="bIsInstallModalOpened = false;"
          :disabled="!bIsPlatformCompatible || InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting"
        >{{ $t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Uninstall View -->
  <v-dialog v-model="bIsUninstallModalOpened" width="50%" height="50%" persistent>
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        {{ $t('uninstall') }}
      </v-card-title>
      <v-divider />
      <div style="margin-top: 4%; margin-bottom: 1%; margin-left: 16%; margin-right: 16%;">
        <h2 class="display-1 my-5">{{ $filters.getLanguage() == 'ko' ? gameObject.gameTitle + $t('uninstalling') : $t('uninstalling') + gameObject.gameTitle  }}</h2>
        <v-text-field
            class="flex-grow-1 mr-2"
            :label="$t('uninstall')"
            v-model="InstallationPath"
            readonly
            dense
        ></v-text-field>
        <v-card-text style="white-space: pre-line;">
          {{ gameObject.gameTitle + $t('will-be-removed') }}
        </v-card-text>
      </div>

      <v-spacer/>
      <v-divider/>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="red"
            flat
            @click="removeApp()"
            :disabled="!bIsPlatformCompatible || InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting || InstallationPath === ''"
        >{{ $t('uninstall') }}</v-btn>
        <v-btn
            color="primary"
            flat
            @click="bIsUninstallModalOpened = false;"
        >{{ $t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
*:focus {
  outline: none;
}

.md-editor {
  /* --md-color: #fff; */
  --md-bk-color: rgba(0, 0, 0, 0);
}
</style>