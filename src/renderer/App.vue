<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "./components/Sidebar.vue";

let CurrentPlatform = ref<string>('');

async function GetPlatform() {
  try {
    CurrentPlatform.value = await window.electronAPI.getPlatform();
  }
  catch (error) {
    console.error(error);
  }
}

const titleMargin = ref({
  transform: 'translateX(75px)',
  willChange: 'transform',
  transition: 'transform 0.5s ease 0.05s'
});

const handleFullscreenChange = (newFullscreenState: boolean) => {
  // macOS && !Fullscreen => 95
  if(CurrentPlatform.value === 'darwin' && !newFullscreenState) {
    titleMargin.value.transform = 'translateX(79px)'
  }
  else {
    titleMargin.value.transform = 'translateX(0px)'
  }
};

window.electronAPI.sendMessage('Hello from App.vue!');

onMounted(() => {
  GetPlatform();
  window.electronAPI.onFullscreenChange(handleFullscreenChange);
});

onUnmounted(() => {
  window.electronAPI.removeFullscreenListener();
});
</script>

<template>
  <v-app data-app>
    <v-app-bar app color="primary" dark fixed density="compact" class="text-left" style="-webkit-app-region: drag;">
<!--      <v-app-bar-nav-icon @click="toggleSidebarOpenState()" style="-webkit-app-region: no-drag; margin-left: 70px" />-->
      <v-toolbar-title :text="$t('bitmap')" :style="titleMargin" />
      <!-- 우측에 추가메뉴 아이콘을 넣기 위해 v-spacer 엘리먼트 사용 -->
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main fill-width fluid>
      <Sidebar />
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
*:focus {
  outline: none;
}
</style>

<!-- eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzM1NzMyNDUxLCJleHAiOjE4MzA0MDUyNTEsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.Gcb40HCT8mubVZgU8GCFM9k2fL-dO6cBNkCgcwdfhMQxS1HVL-_aRqZwSGtQz1hXNd_OmP7M7XjDSLTrucLuTj2TVjTsYbaPbLOOEm1_zG71itGctn5RM5caoujMDtNIqf9OReU0VdCpfMefoOtFnozZ-pDqN8dxKW7uovwpRfssmzsTl6uOfcjTJWitllY-L8prngkmOsquO2dr4ZCokWwyyzG4cl3pXVrHF1y-tL-JQSEXwuaUewu0vKWDUimT6IbDqfplOS9V3STBeWuQo05Zz-SLmW9C9kNgKaNKA18SeTeot3_xKwCHfnE01MwwLM0nslDkgoSFX59I3B9rig -->