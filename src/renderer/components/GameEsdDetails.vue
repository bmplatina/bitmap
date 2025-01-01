<script setup lang="ts" nonce="randomNonceValue">
import {ref} from 'vue'
import {Game} from "../types/GameList"

const props = defineProps<{
  gameObject: Game,
  platform: string,
}>();

// Modal State
let bIsDetailModalOpened = ref(false);
let bIsInstallModalOpened = ref(false);
let bIsUninstallModalOpened = ref(false);
let bIsInstalled = ref(false);

// Installation Properties
let InstallationPath = ref(`/Users/Shared/Bitmap Production/${props.gameObject.gameBinaryName}`);

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

// Platform Compatibility
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
        <v-img
            src="../assets/platformWindows11.png"
            v-if="props.gameObject.gamePlatformWindows == 1"
            :width="20"
        ></v-img>
        <v-img
            src="../assets/platformMac.png"
            v-if="props.gameObject.gamePlatformMac == 1"
            :width="20"
        ></v-img>
        <h2 class="title primary--text mb-2" @click="bIsDetailModalOpened = true">{{ gameObject.gameTitle }}</h2>
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
        v-if="!bIsInstalled"
        :disabled="!bIsPlatformCompatible"
      >설치</v-btn>
      <v-btn
        variant="tonal"
        outlined color="primary"
        @click="bIsInstallModalOpened = true"
        v-if="bIsInstalled"
      >실행</v-btn>
      <v-btn
        color="red"
        @click="bIsUninstallModalOpened = true"
        v-if="bIsInstalled"
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
        <v-col cols="3" class="align-items-center">
          <div style="text-align: center;">
            <v-img
                class="rounded-xl"
                :src="gameObject.gameImageURL"
                lazy-src="../assets/unknownImage.png"
                :alt="gameObject.gameTitle"
                :width="160"
                :height="226.2"
            ></v-img>
            <!-- h2와 p를 가로로 나란히 배치 -->
            <div class="d-flex align-items-center">
              <h2 class="display-1 my-5">{{ gameObject.gameTitle }}</h2>
              <p v-if="gameObject.isEarlyAccess" class="ml-3">얼리 액세스</p>
            </div>
            <p>발매일: {{ $filters.formatDate(gameObject.gameReleasedDate, 'ko') }}</p>
            <p>장르: {{ gameObject.gameGenre }}</p>
            <p>개발: {{ gameObject.gameDeveloper }}</p>
            <p>배금: {{ gameObject.gamePublisher }}</p>
            <a :href="gameObject.gameWebsite">게임 웹사이트 보기</a>
          </div>
        </v-col>

        <!-- v-divider 삽입 -->
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
                  style="width: 384px; height: 216px; margin-top: 4%"
              ></webview>
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
                :title="gameObject.gameHeadline"
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
            v-if="!bIsInstalled"
            :disabled="!bIsPlatformCompatible"
        >{{ bIsPlatformCompatible ? "설치" : "지원하지 않는 플랫폼" }}</v-btn>
        <v-btn
            variant="tonal"
            color="primary"
            flat
            @click=""
            v-if="bIsInstalled"
        >실행</v-btn>
        <v-btn
            color="red"
            flat
            @click="bIsDetailModalOpened = false; bIsUninstallModalOpened = true"
            v-if="bIsInstalled"
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
              class="rounded-xl"
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
<!--        <h2 class="display-1 my-5">디스크 공간</h2>-->
      </div>

      <v-spacer/>
      <v-divider/>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          flat
          @click=""
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