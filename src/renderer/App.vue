<script setup lang="ts">
import GameEsdView from "./components/GameEsdView.vue";

window.electronAPI.sendMessage('Hello from App.vue!');
</script>

<template>
  <div id="app">
    <v-app>
      <v-app-bar app color="primary" dark fixed>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title class="bitmap-title">bitmap production</v-toolbar-title>
        <!-- 우측에 추가메뉴 아이콘을 넣기 위해 v-spacer 엘리먼트 사용 -->
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <GameEsdView/>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>
@import url(https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css);
@import url(https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap);

.bitmap-title {
  font-family: Pretendard, "JetBrains Mono", sans-serif;
}
</style>

<!-- eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzM1NzMyNDUxLCJleHAiOjE4MzA0MDUyNTEsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.Gcb40HCT8mubVZgU8GCFM9k2fL-dO6cBNkCgcwdfhMQxS1HVL-_aRqZwSGtQz1hXNd_OmP7M7XjDSLTrucLuTj2TVjTsYbaPbLOOEm1_zG71itGctn5RM5caoujMDtNIqf9OReU0VdCpfMefoOtFnozZ-pDqN8dxKW7uovwpRfssmzsTl6uOfcjTJWitllY-L8prngkmOsquO2dr4ZCokWwyyzG4cl3pXVrHF1y-tL-JQSEXwuaUewu0vKWDUimT6IbDqfplOS9V3STBeWuQo05Zz-SLmW9C9kNgKaNKA18SeTeot3_xKwCHfnE01MwwLM0nslDkgoSFX59I3B9rig -->