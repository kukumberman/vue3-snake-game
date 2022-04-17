<template>
  <div>
    <h2>Frame count: {{ gameWorld.frameCount }}</h2>
    <h2>Delta time: {{ gameWorld.deltaTime }}</h2>
  </div>
  <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
</template>

<script>
import GameWorld from "@/core/GameWorld.js"

export default {
  props: {
    clients: {
      type: Array,
      require: true
    }
  },
  data() {
    return {
      ctx: null,
      frameDelay: 250,
      cellSize: 50,
      grid: {
        x: 15,
        y: 10
      },
      gameWorld: null,
      colors: {
        pickable: "red",
        background: "black",
        gridLines: "gray"
      },
    }
  },
  created() {
    this.gameWorld = new GameWorld(this.grid.x, this.grid.y, this.frameDelay)

    this.clients.forEach(client => this.gameWorld.addPlayer(client))
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d")

    document.addEventListener("keydown", this.keydownHandler)
    this.subscribeToGameWorldEvents()

    this.gameWorld.start()
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.keydownHandler)
    this.unsubscribeFromGameWorldEvents()
  },
  methods: {
    subscribeToGameWorldEvents() {
      this.gameWorld.events.on("update", this.onUpdate)
      this.gameWorld.events.on("snakeCollision.other", this.onSnakeCollisionWithOther)
      this.gameWorld.events.on("snakeCollision.both", this.onSnakeCollisionBoth)
      this.gameWorld.events.on("snakeCollision.self", this.onSnakeSelfCollision)
    },
    unsubscribeFromGameWorldEvents() {
      this.gameWorld.events.off("update", this.onUpdate)
      this.gameWorld.events.off("snakeCollision.other", this.onSnakeCollisionWithOther)
      this.gameWorld.events.off("snakeCollision.both", this.onSnakeCollisionBoth)
      this.gameWorld.events.off("snakeCollision.self", this.onSnakeSelfCollision)
    },
    onUpdate() {
      this.draw()
    },
    onSnakeCollisionWithOther(args) {
      const { winner } = args
      const client = this.gameWorld.clients.get(winner)
      this.gameWorld.isPaused = true
      alert(`Snake "${client.name}" wins!`)
    },
    onSnakeCollisionBoth() {
      this.gameWorld.isPaused = true
      alert(`Both snakes ate each other!`)
    },
    onSnakeSelfCollision(args) {
      const { loser } = args
      const client = this.gameWorld.clients.get(loser)
      this.gameWorld.isPaused = true
      alert(`Snake "${client.name}" eats yourself!`)
    },
    keydownHandler(event) {
      if (event.repeat) {
        return
      }

      this.gameWorld.clients.forEach(client => {
        client.handleKeydown(event.code)
      })

      switch (event.code) {
        case "KeyP":
          this.gameWorld.isPaused = !this.gameWorld.isPaused
          break
        case "KeyE":
          if (this.gameWorld.isPaused) {
            this.gameWorld.update()
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

      this.gameWorld.clients.forEach(client => {
        const snake = this.gameWorld.snakes.get(client.id)
        this.drawPlayerBody(client, snake)
        this.drawPlayerHead(client, snake)
      })
    },
    drawBackground() {
      this.ctx.fillStyle = this.colors.background
      const size = {
        x: this.gameWorld.grid.x * this.cellSize,
        y: this.gameWorld.grid.y * this.cellSize
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
    drawPlayerHead(client, snake) {
      const cellSize = this.cellSize
      const pos = {
        x: snake.head.x * cellSize + cellSize * 0.5,
        y: snake.head.y * cellSize + cellSize * 0.5
      }
      const radius = cellSize * 0.5

      this.ctx.strokeStyle = "white"
      this.ctx.beginPath()
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    },
    drawPlayerBody(client, snake) {
      this.ctx.fillStyle = client.name
      for (let i = 0; i < snake.body.length; i++) {
        this.drawFilledRect(snake.body[i])
      }
    },
    drawPickable() {
      this.ctx.fillStyle = this.colors.pickable
      this.drawFilledRect(this.gameWorld.pickable)
    },
  },
  computed: {
    canvasWidth() {
      return this.gameWorld.grid.x * this.cellSize
    },
    canvasHeight() {
      return this.gameWorld.grid.y * this.cellSize
    }
  }
}
</script>

<style>

</style>