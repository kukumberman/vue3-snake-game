<template>
  <h1>Networking</h1>
  <h2>Online: {{ online }}</h2>
</template>

<script>
import { emitter } from "../core/networking/client"

export default {
  data() {
    return {
      online: 0
    }
  },
  mounted() {
    emitter.addListener("count", (message) => {
      this.online = message.data
    })
  }
}
</script>

<style>

</style>