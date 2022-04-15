<template>
  <div>
    <h1>Score: {{ gameWorld.player.score }}</h1>
    <h3>Body: {{ gameWorld.player.body.length }}</h3>
    <h2>Frame count: {{ game.frameCount }}</h2>
    <h2>Delta time: {{ game.deltaTime }}</h2>
  </div>
  <canvas ref="canvas" :width="grid.x * cellSize" :height="grid.y * cellSize"></canvas>
</template>

<script>
import GameWorld from "@/core/GameWorld.js"

export default {
  data() {
    return {
      ctx: null,
      game: {
        frameDelay: 250,
        isPaused: false,
        frameCount: 0,
        lastFrameTime: 0,
        deltaTime: 0,
      },
      cellSize: 50,
      grid: {
        x: 10,
        y: 10
      },
      gameWorld: null,
      colors: {
        pickable: "red",
        player: "green",
        background: "black",
        gridLines: "gray"
      }
    }
  },
  created() {
    this.gameWorld = new GameWorld(this.grid.x, this.grid.y)
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d")

    document.addEventListener("keydown", this.keydownHandler)

    this.render()
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.keydownHandler)
  },
  methods: {
    renderFrame() {
      this.gameWorld.tick()
      this.game.frameCount += 1
      this.draw()
    },
    async render() {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

      this.draw()
      await sleep(this.game.frameDelay)

      while (true) {
        this.game.deltaTime = Date.now() - this.game.lastFrameTime
        if (!this.game.isPaused) {
          this.renderFrame()
        }
        this.game.lastFrameTime = Date.now()
        await sleep(this.game.frameDelay)
      }
    },
    setDirection(x, y) {
      this.gameWorld.player.setDirection(x, y)
    },
    keydownHandler(event) {
      if (event.repeat) {
        return
      }

      switch (event.code) {
        case "ArrowUp":
          this.setDirection(0, -1)
          break
        case "ArrowDown":
          this.setDirection(0, 1)
          break
        case "ArrowLeft":
          this.setDirection(-1, 0)
          break
        case "ArrowRight":
          this.setDirection(1, 0)
          break
        case "Space":
          this.gameWorld.debug.shouldPlayerGrow = true
          break
        case "KeyP":
          this.game.isPaused = !this.game.isPaused
          break
        case "KeyE":
          if (this.game.isPaused) {
            this.renderFrame()
          }
          break
        default:
          break
      }
    },
    drawFilledRect(grid) {
      const cellSize = this.cellSize
      this.ctx.fillRect(grid.x * cellSize, grid.y * cellSize, cellSize, cellSize)
    },
    draw() {
      this.drawBackground()
      this.drawGrid()
      this.drawPickable()
      this.drawPlayerBody()
      this.drawPlayerHead()
    },
    drawBackground() {
      this.ctx.fillStyle = this.colors.background
      const size = {
        x: this.grid.x * this.cellSize,
        y: this.grid.y * this.cellSize
      }
      this.ctx.fillRect(0, 0, size.x, size.y)
    },
    drawGrid() {
      const cellSize = this.cellSize

      this.ctx.strokeStyle = this.colors.gridLines

      for (let y = 0; y < this.grid.y; y++) {
        for (let x = 0; x < this.grid.x; x++) {
          this.ctx.strokeRect(x * cellSize, y * cellSize, (x + 1) * cellSize, (y + 1) * cellSize)
        }
      }
    },
    drawPlayerHead() {
      const cellSize = this.cellSize
      const pos = {
        x: this.gameWorld.player.head.x * cellSize + cellSize * 0.5,
        y: this.gameWorld.player.head.y * cellSize + cellSize * 0.5
      }
      const radius = cellSize * 0.5

      this.ctx.strokeStyle = "white"
      this.ctx.beginPath()
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    },
    drawPlayerBody() {
      this.ctx.fillStyle = this.colors.player
      for (let i = 0; i < this.gameWorld.player.body.length; i++) {
        this.drawFilledRect(this.gameWorld.player.body[i])
      }
    },
    drawPickable() {
      this.ctx.fillStyle = this.colors.pickable
      this.drawFilledRect(this.gameWorld.pickable)
    },
  }
}
</script>

<style>

</style>