<script setup lang="ts">
import {onMounted, ref} from "vue";

const windowControl = (method: number) => {
  switch (method) {
    case 0:
      window.electronAPI.closeApp();
      break;
    case 1:
      window.electronAPI.minimizeApp();
      break;
    case 2:
      window.electronAPI.maximizeApp();
      break;
    default:
      break;
  }
};

const getIsWindowMaximized = async () => {
  await window.electronAPI.isMaximized().then(function (isMaximized: boolean) {
    isWindowMaximized.value = isMaximized;
  })
};
let isWindowMaximized = ref<boolean>(false);

onMounted(function () {
  getIsWindowMaximized();
});

</script>

<template>
  <v-btn density="compact" icon="mdi-alpha-x" @click="windowControl(0)" style="-webkit-app-region: no-drag;" />
  <v-btn density="compact" icon="mdi-minus" @click="windowControl(1)" style="-webkit-app-region: no-drag;" />
  <v-btn density="compact" :icon="isWindowMaximized ? 'mdi-minus-circle' : 'mdi-plus-circle'" @click="windowControl(2); getIsWindowMaximized();" style="-webkit-app-region: no-drag;" />
</template>

<style scoped>

</style>