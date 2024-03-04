<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

import { useGetters, useActions } from "vuex-composition-helpers/dist";

const { token } = useGetters({
  token: "auth/token",
});

const { logoutUser, clearStore } = useActions({
  logoutUser: "auth/logoutUser",
  clearStore: "auth/clearStore",
});

const timeoutInMS = 1500000; //? 25 minutes -> 25 * 60 * 1000
let timeoutId;

function handleInactive() {
  if (token.value) {
    logoutUser({ token: token.value });
  }
}

function startTimer() {
  timeoutId = setTimeout(handleInactive, timeoutInMS);
}

function resetTimer() {
  clearTimeout(timeoutId);
  startTimer();
}

function setupTimers() {
  document.addEventListener("keypress", resetTimer, false);
  document.addEventListener("mousemove", resetTimer, false);
  document.addEventListener("mousedown", resetTimer, false);
  document.addEventListener("touchmove", resetTimer, false);

  startTimer();
}

onMounted(() => {
  setupTimers();
});

onUnmounted(() => {
  clearStore();
});
</script>

<style></style>
