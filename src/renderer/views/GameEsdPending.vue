<script setup lang="ts">
import { onMounted, reactive } from "vue";
import axios from "axios";
import { Game } from "../types/GameList";

import GameEsdDetails from "../components/GameEsdDetails.vue";

const state = reactive({
  gamesFetched: [] as Game[],
  loading: true,
  error: null as string | null,
});

async function fetchGames() {
  try {
    const response = await axios.get<Game[]>("https://api.prodbybitmap.com/api/games-pending");
    state.gamesFetched = response.data;
    state.loading = false;
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
  <div id="app">
    <v-container fluid>
      <v-row>
        <!-- 게임 아이템을 넣을 공간 -->
        <v-col v-for="game in state.gamesFetched" :key="game.gameId" :cols="3">
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
            <!--            {{ game.gameTitle }}-->
            <GameEsdDetails :gameObject="game" />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>

</style>