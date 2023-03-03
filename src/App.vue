<template>
  <ChatLayout />
</template>

<script>
import ChatLayout from "./components/ChatLayout.vue";

export default {
  name: "App",
  components: {
    ChatLayout,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 0;
}

*::-webkit-scrollbar {
  width: 8px;
}

*::-webkit-scrollbar-thumb {
  background: rgb(221, 221, 221);
  border-radius: 5px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgb(190, 190, 190);
}
</style>
