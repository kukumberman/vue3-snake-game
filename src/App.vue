<template>
  <!-- <SnakeSingleplayer /> -->
  <Networking />
</template>

<script>
import SnakeSingleplayer from "./components/SnakeSingleplayer.vue"
import Networking from "./components/Networking.vue"

export default {
  name: 'App',
  components: {
    SnakeSingleplayer, Networking
  }
}
</script>

<style>
</style>
