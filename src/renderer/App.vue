<script setup lang="ts">
import GameEsdView from "./components/GameEsdView.vue";

window.electronAPI.sendMessage('Hello from App.vue!');
</script>

<template>
  <div>
    <GameEsdView/>
<!--    <a href="https://vitejs.dev" target="_blank">-->
<!--      <img :src="viteLogo" class="logo" alt="Vite logo" />-->
<!--    </a>-->
<!--    <a href="https://vuejs.org/" target="_blank">-->
<!--      <img :src="vueLogo" class="logo vue" alt="Vue logo" />-->
<!--    </a>-->
  </div>
<!--  <HelloWorld msg="Vite + Vue" />-->
</template>

<style scoped>
</style>
