<script setup lang="ts"></script>

<template>
  <RouterView />

</template>

<style scoped>
html, body, #app {
  height: 100%;
}

:root {
  --bg: #0f172a;
  --card: #111827;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --accent: #22c55e;
}

#app {
  background: var(--bg);
  color: var(--text);
}
</style>
