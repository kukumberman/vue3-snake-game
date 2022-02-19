<template>
  <div>
    <h1>Score: {{ player.score }}</h1>
    <h3>Body: {{ player.body.length }}</h3>
    <h2>Frame count: {{ game.frameCount }}</h2>
    <h2>Delta time: {{ game.deltaTime }}</h2>
  </div>
  <div>
    <button @click="game.isPaused = !game.isPaused">Pause</button>
  </div>
  <canvas ref="canvas" :width="grid.x * cellSize" :height="grid.y * cellSize"></canvas>
</template>

<script>
export default {
  data() {
    return {
      ctx: null,
      game: {
        frameDelay: 250,
        interval: 0,
        isPaused: false,
        frameCount: 0,
        lastFrameTime: 0,
        deltaTime: 0,
        debugPlayerGrow: false
      },
      cellSize: 50,
      grid: {
        x: 10,
        y: 10
      },
      player: {
        head: {
          x: 0,
          y: 0
        },
        direction: {
          x: 1,
          y: 0
        },
        score: 0,
        body: [],
        color: "green"
      },
      pickable: {
        pos: {
          x: 5,
          y: 5,
        },
        color: "red"
      }
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d")

    document.addEventListener("keydown", this.keydownHandler)

    this.render()

    // this.draw()
    // this.game.interval = setInterval(() => {
    //   this.frame()
    // }, this.game.frameDelay)
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.keydownHandler)

    // clearInterval(this.game.interval)
  },
  methods: {
    async render() {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
      while (true) {
        this.frame()
        await sleep(this.game.frameDelay)
      }
    },
    setDirection(x, y) {
      // all checks is used to prevent moving in opposite direction

      if (Math.abs(this.player.direction.x) != Math.abs(x)) {
        this.player.direction.x = x
      }
      if (Math.abs(this.player.direction.y) != Math.abs(y)) {
        this.player.direction.y = y
      }
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
          this.game.debugPlayerGrow = true
          break
        default:
          break
      }
    },
    frame() {
      this.game.deltaTime = Date.now() - this.game.lastFrameTime
      this.game.lastFrameTime = Date.now()
      this.game.frameCount += 1
      if (!this.game.isPaused) {
        this.tick()
      }
      this.draw()
    },
    tick() {
      this.player.head.x += this.player.direction.x
      this.player.head.y += this.player.direction.y

      this.wallHandler()

      // non reference type
      const head = { x: this.player.head.x, y: this.player.head.y }

      const shouldEatFood = this.player.head.x === this.pickable.pos.x && this.player.head.y === this.pickable.pos.y

      if (shouldEatFood) {
        this.spawnFood()
      }

      const shouldGrow = shouldEatFood || this.game.debugPlayerGrow

      if (shouldGrow) {
        this.player.score += 1
      }

      if (shouldGrow) {
        this.player.body.unshift(head)
      }
      else {
        if (this.player.body.length === 0) {
          this.player.body.push(head)
        }
        else if (this.player.body.length === 1) {
          this.player.body[0] = head
        }
        else if (this.player.body.length > 1) {
          this.player.body.unshift(head)
          this.player.body.splice(this.player.body.length - 1, 1)
        }
      }

      for (let i = 1; i < this.player.body.length; i++) {
        const { x, y } = this.player.body[i]
        if (this.player.head.x === x && this.player.head.y === y) {
          // on death
          this.deathHandler()
          break
        }
      }

      if (this.game.debugPlayerGrow) {
        this.game.debugPlayerGrow = false
      }
    },
    wallHandler() {
      if (this.player.head.x === this.grid.x) {
        this.player.head.x = 0
      }
      else if (this.player.head.x < 0) {
        this.player.head.x = this.grid.x - 1
      }

      if (this.player.head.y === this.grid.y) {
        this.player.head.y = 0
      }
      else if (this.player.head.y < 0) {
        this.player.head.y = this.grid.y - 1
      }
    },
    deathHandler() {
      this.player.head.x = 0
      this.player.head.y = 0
      this.player.direction.x = 1
      this.player.direction.y = 0
      this.player.body = []
      this.player.score = 0
    },
    drawFilledRect(grid) {
      const cellSize = this.cellSize
      this.ctx.fillRect(grid.x * cellSize, grid.y * cellSize, cellSize, cellSize)
    },
    draw() {
      this.drawBackground()
      this.drawGrid()
      this.drawPickable()
      this.drawPlayer()
    },
    drawBackground() {
      this.ctx.fillStyle = "black"
      const size = {
        x: this.grid.x * this.cellSize,
        y: this.grid.y * this.cellSize
      }
      this.ctx.fillRect(0, 0, size.x, size.y)
    },
    drawGrid() {
      const cellSize = this.cellSize

      this.ctx.strokeStyle = "gray"

      for (let y = 0; y < this.grid.y; y++) {
        for (let x = 0; x < this.grid.x; x++) {
          this.ctx.strokeRect(x * cellSize, y * cellSize, (x + 1) * cellSize, (y + 1) * cellSize)
        }
      }
    },
    drawPlayerHead() {
      const cellSize = this.cellSize
      const pos = {
        x: this.player.head.x * cellSize + cellSize * 0.5,
        y: this.player.head.y * cellSize + cellSize * 0.5
      }
      const radius = cellSize * 0.5

      this.ctx.strokeStyle = "white"
      this.ctx.beginPath()
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    },
    drawPlayer() {
      this.ctx.fillStyle = this.player.color
      for (let i = 0; i < this.player.body.length; i++) {
        this.drawFilledRect(this.player.body[i])
      }
      this.drawPlayerHead()
    },
    drawPickable() {
      this.ctx.fillStyle = this.pickable.color
      this.drawFilledRect(this.pickable.pos)
    },
    spawnFood() {
      // todo: proper random to place pickable only at empty cell
      this.pickable.pos.x = Math.floor(Math.random() * this.grid.x)
      this.pickable.pos.y = Math.floor(Math.random() * this.grid.y)
    },
  }
}
</script>

<style>

</style>