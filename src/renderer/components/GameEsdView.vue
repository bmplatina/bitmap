<script setup lang="ts">
import { onMounted, reactive } from "vue";
import axios from "axios";
import { Game } from "../types/GameList"
import GameEsdDetails from "./GameEsdDetails.vue";

/*
 * Get API from server
 */
const state = reactive({
  games: [] as Game[],
  loading: true,
  error: null as string | null,
});

async function fetchGames() {
  try {
    const response = await axios.get<Game[]>('https://api.prodbybitmap.com/api/games')
    state.games = response.data;
    state.loading = false;
  } catch (error) {
    state.error = '게임 데이터를 가져오는 중 오류가 발생했습니다.';
    state.loading = false;
    console.error('Error fetching games:', error);
  }
}

/*
 * Check platform
 */
let CurrentPlatform: string;

async function GetPlatform() {
  try {
    CurrentPlatform = await window.electronAPI.getPlatform();
  }
  catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  fetchGames();
  GetPlatform();
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <!-- 게임 아이템을 넣을 공간 -->
      <v-col v-for="game in state.games" :key="game.gameId" :cols="3">
        <div v-if="state.loading">
          <v-skeleton-loader
              max-width="400"
              :height="'566px'"
              type="image, article"
          ></v-skeleton-loader>
        </div>
        <div v-else-if="state.error">
          {{ state.error }}
        </div>
        <div v-else>
          <!-- 정상 데이터를 표시 -->
          <GameEsdDetails :gameObject="game" :platform="CurrentPlatform" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
</style>