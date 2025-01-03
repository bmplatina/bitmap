<script setup lang="ts">
import { ref } from 'vue'
import { Game } from "../types/GameList";

const props = defineProps<{
  gameObject: Game,
  platform: string,
}>();

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
let bIsDetailModalOpened = ref(false);
let bIsInstallModalOpened = ref(false);
let bIsUninstallModalOpened = ref(false);

/*
 * Download & Installation
 */
let InstallState: number = 0; // Get Install state from electron-store
const enum EInstallState {
  NotInstalled,
  Downloading,
  Extracting,
  Installed
}

let downloadProgress = ref(0);
let extractProgress = ref(0);
let InstallationPath = ref(`/Users/Shared/Bitmap Production/${props.gameObject.gameBinaryName}`);

const downloadAndInstall = async (url: string | null, savePath: string) => {
  console.log(`URL: ${url}, SavePath: ${savePath}`);
  const urlLocal: string | null = `${url}/${props.gameObject.gameBinaryName}`;

  try {
    // 다운로드 진행률 수신
    window.electronAPI.onDownloadProgress((progress) => {
      InstallState = EInstallState.Downloading;
      downloadProgress.value = progress;
    });

    // 다운로드 요청
    const filePath = await window.electronAPI.downloadFile(urlLocal, savePath);
    console.log('다운로드 완료:', filePath);

    // 압축 해제 진행률 수신
    window.electronAPI.onExtractProgress((progress) => {
      InstallState = EInstallState.Extracting;
      extractProgress.value = progress;
    });

    // 압축 해제 요청
    const extractedPath = await window.electronAPI.extractZip(filePath);
    console.log('압축 해제 완료:', extractedPath);

    InstallState = EInstallState.Installed; // 작업 완료
  }
  catch (error) {
    console.error('오류 발생:', error);
  }
};

/*
 * Select installation directory
 */
async function selectDirectory() {
  const options = {
    title: '파일 경로 선택',
    properties: ['openDirectory'], // 파일 또는 폴더 선택 가능
  };

  try {
    const path = await (window as any).electronAPI.showDialog(options);
    if (path) {
      InstallationPath.value = `${path}/${props.gameObject.gameBinaryName}`; // 선택한 경로 저장
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
</script>

<template>
  <!-- Button -->
  <v-card max-width="400">
    <v-img
      :src="gameObject.gameImageURL"
      lazy-src="../assets/unknownImage.png"
      :alt="gameObject.gameTitle"
      cover
      @click="bIsDetailModalOpened = true"
    ></v-img>
    <v-card-text>
      <div style="text-align: left;">
        <h2 class="title primary--text mb-2" @click="bIsDetailModalOpened = true">{{ gameObject.gameTitle }}</h2>
        <div class="d-flex align-center mb-2">
          <v-img
              src="../assets/platformWindows11.png"
              v-if="props.gameObject.gamePlatformWindows == 1"
              :max-width="20"
              :max-height="20"
              style="margin-right: 8px"
          ></v-img>
          <v-img
              src="../assets/platformMac.png"
              v-if="props.gameObject.gamePlatformMac == 1"
              :max-width="20"
              :max-height="20"
              style="margin-right: 8px"
          ></v-img>
        </div>
        <p class="mb-0">Dev: {{ gameObject.gameDeveloper }}</p>
        <p class="mb-0">Genre: {{ gameObject.gameGenre }}</p>
        <p class="mb-0">Released: {{ $filters.formatDate(gameObject.gameReleasedDate, 'ko') }}</p>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="plain" @click="bIsDetailModalOpened = true">자세히</v-btn>
      <v-btn
        variant="tonal"
        outlined color="primary"
        @click="bIsInstallModalOpened = true"
        v-if="InstallState === EInstallState.NotInstalled"
        :disabled="!bIsPlatformCompatible"
      >설치</v-btn>
      <v-btn
        variant="tonal"
        outlined color="primary"
        @click="bIsInstallModalOpened = true"
        v-if="InstallState === EInstallState.Installed"
      >실행</v-btn>
      <v-btn
        color="red"
        @click="bIsUninstallModalOpened = true"
        v-if="InstallState === EInstallState.Installed"
      >제거</v-btn>
    </v-card-actions>
  </v-card>

  <!-- Detail View -->
  <v-dialog v-model="bIsDetailModalOpened" width="90%" height="80%">
    <v-card style="height: 100%;">
      <v-card-title class="headline grey lighten-2" primary-title>
        Bitmap Store: {{ gameObject.gameTitle }}
      </v-card-title>
      <v-divider />

      <v-row style="height: 80%;" class="d-flex">
        <v-col cols="3" class="d-flex flex-column align-items-center">
          <div>
            <v-img
                class="rounded-xl mx-auto"
                :src="gameObject.gameImageURL"
                lazy-src="../assets/unknownImage.png"
                :alt="gameObject.gameTitle"
                :max-width="240"
                style="margin-top: calc(4% + 16px)"
            ></v-img>
            <div class="d-flex justify-center align-center mt-5 w-100">
              <h2 class="text-h5 mr-2">{{ gameObject.gameTitle }}</h2>
              <p v-if="gameObject.isEarlyAccess" class="mb-0">얼리 액세스</p>
            </div>
          </div>
        </v-col>

        <v-divider vertical style="margin-top: 1%; margin-bottom: 1%"></v-divider>

        <v-col cols="9" style="display: flex; flex-direction: column; height: 100%;" class="align-center">
          <div style="flex: 1; overflow-y: auto; margin-top: 4%; margin-bottom: 1%; margin-left: 4%; margin-right: 4%;">
            <v-card
                class="mt-4 pa-3 rounded-xl"
                title="Preview"
                variant="tonal"
                style="white-space: pre-line;"
            >
              <webview
                  :src="'https://www.youtube.com/embed/' + gameObject.gameVideoURL"
                  style="width: 512px; height: 288px; margin-top: 4%"
              ></webview>
            </v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="`${gameObject.gameTitle} 정보`"
                variant="tonal"
                style="white-space: pre-line;"
            >
              <v-card-text>
                <p>발매일: {{ $filters.formatDate(gameObject.gameReleasedDate, 'ko') }}</p>
                <p>장르: {{ gameObject.gameGenre }}</p>
                <p>개발: {{ gameObject.gameDeveloper }}</p>
                <p>배급: {{ gameObject.gamePublisher }}</p>
                <a :href="gameObject.gameWebsite" @click="openExternal">게임 웹사이트 보기</a>
              </v-card-text>
            </v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                :title="gameObject.gameHeadline"
                :text="gameObject.gameDescription"
                variant="tonal"
                style="white-space: pre-line;"
            ></v-card>
            <v-card
                class="mt-4 pa-3 rounded-xl"
                title="시스템 요구 사양"
                :text="gameObject.gameDescription"
                variant="tonal"
                style="white-space: pre-line;"
            ></v-card>
          </div>
        </v-col>
      </v-row>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            flat
            @click="bIsInstallModalOpened = true"
            v-if="InstallState === EInstallState.NotInstalled"
            :disabled="!bIsPlatformCompatible"
        >{{ bIsPlatformCompatible ? "설치" : "지원하지 않는 플랫폼" }}</v-btn>
        <v-btn
            variant="tonal"
            color="primary"
            flat
            @click=""
            v-if="InstallState === EInstallState.Installed"
        >실행</v-btn>
        <v-btn
            color="red"
            flat
            @click="bIsDetailModalOpened = false; bIsUninstallModalOpened = true"
            v-if="InstallState === EInstallState.Installed"
        >제거</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Install View -->
  <v-dialog v-model="bIsInstallModalOpened" width="30%" height="75%">
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        Installing {{ gameObject.gameTitle }}
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
        <h2 class="display-1 my-5">설치 위치</h2>
        <v-text-field
            class="flex-grow-1 mr-2"
            label="Installation Path"
            v-model="InstallationPath"
            :rules="[v => !!v || 'Field is required']"
            @click="selectDirectory()"
            hint="Click to select directory"
            readonly
            dense
        ></v-text-field>
        <v-card-text
            v-if="InstallState === EInstallState.Downloading || InstallState === EInstallState.Extracting"
        >
          {{ InstallState === EInstallState.Downloading ? `다운로드 중` : `압축 해제 중`}}
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
          :disabled="!bIsPlatformCompatible"
        >설치</v-btn>
        <v-btn
          color="red"
          flat
          @click="bIsInstallModalOpened = false;"
        >취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
</style>