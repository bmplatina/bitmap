<script defer lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";
import axios from "axios";
import { Game } from "../types/GameList"

export default defineComponent({
  name: "GameList",
  setup() {
    const games = ref<Game[]>([]);

    const fetchGames = async () => {
      try {
        const response = await axios.get<Game[]>(
            "https://api.prodbybitmap.com/api/games"
        );
        games.value = response.data;
      } catch (error) {
        console.error("게임 데이터를 가져오는데 실패했습니다:", error);
      }
    };

    onMounted(() => {
      fetchGames();
    });

    return { games };
  },
});
</script>

<template>
  <v-app>
<!--    <h1>게임 리스트</h1>-->
<!--    <ul>-->
<!--      <li v-for="game in games" :key="game.gameId">-->
<!--        <img :src="game.gameImageURL" :alt="game.gameTitle" width="100" />-->
<!--        <h3>{{ game.gameTitle }}</h3>-->
<!--        <p>{{ game.gameGenre }}</p>-->
<!--      </li>-->
<!--    </ul>-->
    <v-card max-width="400" v-for="game in games" :key="game.gameId">
      <v-img :src="game.gameImageURL" :alt="game.gameTitle"></v-img>
      <v-card-text>
        <div>
          <h2 class="title primary--text mb-2">{{game.gameTitle}}</h2>
          <p class="mb-0">Dev: {{game.gameDeveloper}}</p>
          <p class="mb-0">Genre: {{game.gameGenre}}</p>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn color="red white--text">확인</v-btn>
        <v-btn outlined color="red">취소</v-btn>
        <v-btn color="#9C27B0" dark>취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<style scoped>
</style>