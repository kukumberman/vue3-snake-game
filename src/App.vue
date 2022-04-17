<template>
  <div v-if="!gameplayState">
    <div>
      <button @click="playSolo">Play solo</button>
    </div>
    <div>
      <button @click="playDuo">Play duo</button>
    </div>
    <!-- <div>
      <button @click="playMultiplayer">Play multiplayer</button>
    </div> -->
  </div>
  <div v-else>
    <SnakeSingleplayer
      :clients="clients"
    />
  </div>
</template>

<script>
import config from "@/core/config.json"
import Client from "@/core/Client.js"
import SnakeSingleplayer from "./components/SnakeSingleplayer.vue"

const WASD_INPUTS = config.inputs[0]
const ARROW_INPUTS = config.inputs[1]
const COMBINED_INPUTS = config.inputs[2]

export default {
  name: 'App',
  components: {
    SnakeSingleplayer,
  },
  data() {
    return {
      gameplayState: false,
      clients: []
    }
  },
  created() {
    const params = new URLSearchParams(window.location.search)

    if (!params.has("mode")) {
      return
    }

    const mode = params.get("mode")
    if (mode === "solo") {
      this.playSolo()
    }
    else if (mode === "duo") {
      this.playDuo()
    }
    else if (mode === "multiplayer") {
      this.playMultiplayer()
    }
  },
  methods: {
    setSelectedMode(mode) {
      window.history.replaceState(null, null, `?mode=${mode}`)
      this.gameplayState = true
    },
    playSolo() {
      this.clients.push(new Client(COMBINED_INPUTS, "green"))
      this.setSelectedMode("solo")
    },
    playDuo() {
      this.clients.push(new Client(WASD_INPUTS, "green"))
      this.clients.push(new Client(ARROW_INPUTS, "orange"))
      this.setSelectedMode("duo")
    },
    playMultiplayer() {
      // todo
      alert("not implemented yet")
      // this.setSelectedMode("multiplayer")
    }
  }
}
</script>

<style>
</style>
