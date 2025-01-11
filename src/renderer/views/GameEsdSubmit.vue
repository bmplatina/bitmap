<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { Game } from "../types/GameList";
import axios from "axios";
import { MdEditor, MdPreview, MdCatalog } from "md-editor-v3";
import GameEsdDetails from "../components/GameEsdDetails.vue";

/*
 * Modal State
 */
let bIsPreSumbitPreviewModalOpened = ref(false);
let bIsMarkdownModalOpened = ref(false);

let previewGameObject: Game;

function openPreSubmitPreviewModal() {
  previewGameObject = {
    gameId: responseGameId.value,
    gameTitle: responseGameTitle.value,
    gameLatestRevision: responseGameLatestRevision.value,
    gamePlatformWindows: responseGamePlatformWindows.value == true ? 1 : 0,
    gamePlatformMac: responseGamePlatformMac.value == true ? 1 : 0,
    gamePlatformMobile: responseGamePlatformMobile.value == true ? 1 : 0,
    gameEngine: responseGameEngine.value,
    gameGenre: responseGameGenre.value,
    gameDeveloper: responseGameDeveloper.value,
    gamePublisher: responseGamePublisher.value,
    isEarlyAccess: responseIsEarlyAccess.value == true ? 1 : 0,
    isReleased: responseIsReleased.value == true ? 1 : 0,
    gameReleasedDate: formatDateToMySQL(responseGameReleasedDate.value as Date),
    gameWebsite: responseGameWebsite.value,
    gameVideoURL: responseGameVideoURL.value,
    gameDownloadMacURL: responseGameDownloadMacURL.value,
    gameDownloadWinURL: responseGameDownloadWinURL.value,
    gameImageURL: responseGameImageURL.value,
    gameBinaryName: responseGameBinaryName.value,
    gameHeadline: responseGameHeadline.value,
    gameDescription: responseGameDescription.value,
  };

  bIsPreSumbitPreviewModalOpened.value = true;
}

function formatDateToMySQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function postGame(): Promise<boolean> {
  try {
    bIsPreSumbitPreviewModalOpened.value = true;

    const postGame: Game = {
      gameId: responseGameId.value,
      gameTitle: responseGameTitle.value,
      gameLatestRevision: responseGameLatestRevision.value,
      gamePlatformWindows: responseGamePlatformWindows.value == true ? 1 : 0,
      gamePlatformMac: responseGamePlatformMac.value == true ? 1 : 0,
      gamePlatformMobile: responseGamePlatformMobile.value == true ? 1 : 0,
      gameEngine: responseGameEngine.value,
      gameGenre: responseGameGenre.value,
      gameDeveloper: responseGameDeveloper.value,
      gamePublisher: responseGamePublisher.value,
      isEarlyAccess: responseIsEarlyAccess.value == true ? 1 : 0,
      isReleased: responseIsReleased.value == true ? 1 : 0,
      gameReleasedDate: formatDateToMySQL(responseGameReleasedDate.value as Date),
      gameWebsite: responseGameWebsite.value,
      gameVideoURL: responseGameVideoURL.value,
      gameDownloadMacURL: responseGameDownloadMacURL.value,
      gameDownloadWinURL: responseGameDownloadWinURL.value,
      gameImageURL: responseGameImageURL.value,
      gameBinaryName: responseGameBinaryName.value,
      gameHeadline: responseGameHeadline.value,
      gameDescription: responseGameDescription.value,
    };
    const response = await axios.post<Game>("https://api.prodbybitmap.com/api/games/push", postGame);
    console.log("Submit succeed: ", response.data);
    bIsPreSumbitPreviewModalOpened.value = false;
    return true;
  }
  catch (error) {
    console.error("Error submitting:", error);
    bIsPreSumbitPreviewModalOpened.value = false;
    return false;
  }
}

/*
 * Game Info for ESD
 */
let responseGameId = ref(0);
let responseGameTitle = ref('');
let responseGameLatestRevision = ref(0);
let responseGamePlatformWindows = ref(false);
let responseGamePlatformMac = ref(false);
let responseGamePlatformMobile = ref(false);
let responseGameEngine = ref('');
let responseGameGenre = ref('');
let responseGameDeveloper = ref('');
let responseGamePublisher = ref('');
let responseIsEarlyAccess = ref(false);
let responseIsReleased = ref(false);
let responseGameReleasedDate = ref<Date>();
let responseGameWebsite = ref('');
let responseGameVideoURL = ref('');
let responseGameDownloadMacURL = ref('');
let responseGameDownloadWinURL = ref('');
let responseGameImageURL = ref('');
let responseGameBinaryName = ref('');
let responseGameHeadline = ref('');
let responseGameDescription = ref('');


const state = reactive({
  loading: true,
  error: null as string | null,
});

async function fetchGames() {
  try {
    const responseGames = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games");
    const responseGamesPending = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending");
    const fetchedGames: Array<Game> = responseGames.data;
    const fetchedGamedPending: Array<Game> = responseGamesPending.data;

    state.loading = false;
    responseGameId.value = fetchedGames.length + fetchedGamedPending.length;
  }
  catch (error) {
    state.error = '게임 데이터를 가져오는 중 오류가 발생했습니다.';
    state.loading = false;
    console.error('Error fetching games:', error);
  }
}

onMounted(() => {
  fetchGames();
})
</script>

<template>
  <div>
    <!-- Game ID -->
    <v-card :title="$t('gameId')" :text="$t('gameIdDesc')">
      <v-text-field v-model="responseGameId" readonly disabled :label="$t('gameId')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameTitle')" :text="$t('gameTitleDesc')">
      <v-text-field v-model="responseGameTitle" :label="$t('gameTitle')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameLatestRevision')" :text="$t('gameLatestRevisionDesc')">
      <v-text-field v-model="responseGameLatestRevision" :label="$t('gameLatestRevision')" type="number"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gamePlatform')" :text="$t('gamePlatformDesc')">
      <v-checkbox v-model="responseGamePlatformWindows" :label="$t('gamePlatformWindows')" />
      <v-checkbox v-model="responseGamePlatformMac" :label="$t('gamePlatformMac')" />
      <v-checkbox v-model="responseGamePlatformMobile" :label="$t('gamePlatformMobile')" />
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameEngine')" :text="$t('gameEngineDesc')">
      <v-text-field v-model="responseGameEngine" :label="$t('gameEngine')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameGenre')" :text="$t('gameGenreDesc')">
      <v-text-field v-model="responseGameGenre" :label="$t('gameGenre')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameDeveloper')" :text="$t('gameDeveloperDesc')">
      <v-text-field v-model="responseGameDeveloper" :label="$t('gameDeveloper')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gamePublisher')" :text="$t('gamePublisherDesc')">
      <v-text-field v-model="responseGamePublisher" :label="$t('gamePublisher')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('early-access')" :text="$t('isEarlyAccessDesc')">
      <v-checkbox v-model="responseIsEarlyAccess" :label="$t('early-access')" />
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('isReleased')" :text="$t('isReleasedDesc')">
      <v-checkbox v-model="responseIsReleased" :label="$t('isReleased')" />
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameReleasedDate')" :text="$t('gameReleasedDateDesc')">
      <v-date-picker v-model="responseGameReleasedDate"/>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameWebsite')" :text="$t('gameWebsiteDesc')">
      <v-text-field v-model="responseGameWebsite" :label="$t('gameWebsite')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card style="white-space: pre-line" :title="$t('gameVideoURL')" :text="$t('gameVideoURLDesc')">
      <v-text-field v-model="responseGameVideoURL" :label="$t('gameVideoURL')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameDownloadURL')" :text="$t('gameDownloadURLDesc')">
      <v-text-field v-if="responseGamePlatformMac" v-model="responseGameDownloadMacURL" :label="$t('gameDownloadMacURL')"></v-text-field>
      <v-text-field v-if="responseGamePlatformWindows" v-model="responseGameDownloadWinURL" :label="$t('gameDownloadWinURL')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameImageURL')" :text="$t('gameImageURLDesc')">
      <v-text-field v-model="responseGameImageURL" :label="$t('gameImageURL')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameBinaryName')" :text="$t('gameBinaryNameDesc')">
      <v-text-field v-model="responseGameBinaryName" :label="$t('gameBinaryName')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameHeadline')" :text="$t('gameHeadlineDesc')">
      <v-text-field v-model="responseGameHeadline" :label="$t('gameHeadline')"></v-text-field>
    </v-card>
    <v-divider></v-divider>
    <v-card :title="$t('gameDescription')" :text="$t('gameDescriptionDesc')">
      <MdPreview id="preview-only" :modelValue="responseGameDescription" theme="dark" />
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="bIsMarkdownModalOpened = true" :text="$t('edit-md')" variant="tonal" />
      </v-card-actions>
    </v-card>
    <v-spacer />
    <v-btn tonal @click="openPreSubmitPreviewModal()" :text="$t('submit')" />

    <!-- 마크다운 편집 모달 -->
    <v-dialog v-model="bIsMarkdownModalOpened">
      <v-card>
        <MdEditor v-model="responseGameDescription" language="en-US" />
      </v-card>
    </v-dialog>

    <!-- 제출 모달 -->
    <v-dialog v-model="bIsPreSumbitPreviewModalOpened" width="40%" persistent>
      <v-card :title="$t('submitting') + responseGameTitle" :text="$t('submit-warning')">
        <v-divider />
        <GameEsdDetails :gameObject="previewGameObject" />
        <v-divider />
        <v-card-actions>
          <v-btn @click="postGame()" :text="$t('submit')" variant="tonal" color="primary" />
          <v-btn @click="bIsPreSumbitPreviewModalOpened = false" :text="$t('cancel')" variant="tonal" color="red" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="postcss">
@import 'md-editor-v3/lib/style.css';
</style>