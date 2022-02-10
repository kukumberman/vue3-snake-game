<template>
  <div>
    <h1>Score: {{ player.score }}</h1>
  </div>
  <div>
    <h2>Frame count: {{ game.frameCount }}</h2>
    <h2>Delta time: {{ game.deltaTime }}</h2>
  </div>
  <div>
    <button @click="game.isPaused = !game.isPaused">Pause</button>
  </div>
  <canvas ref="canvas" :width="size.x" :height="size.y"></canvas>
</template>

<script>
export default {
  data() {
    return {
      ctx: null,
      game: {
        frameDelay: 100,
        interval: 0,
        isPaused: false,
        frameCount: 0,
        lastFrameTime: 0,
        deltaTime: 0,
        debugPlayerGrow: false
      },
      size: {
        x: 500,
        y: 500
      },
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
    getCellSize() {
      return {
        x: this.size.x / this.grid.x,
        y: this.size.y / this.grid.y,
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
      const head = { x: this.player.head.x, y: this.player.head.y }
      
      this.player.head.x += this.player.direction.x
      this.player.head.y += this.player.direction.y

      this.wallHandler()

      const bodyLength = this.player.body.length

      if (bodyLength == 0) {
        this.player.body.push(this.player.head)
      }
      else if (bodyLength == 1) {
        this.player.body[0] = this.player.head
      }

      const shouldEatFood = head.x === this.pickable.pos.x && head.y === this.pickable.pos.y

      if (shouldEatFood) {
        this.spawnFood()
      }

      const shouldGrow = shouldEatFood || this.game.debugPlayerGrow

      if (shouldGrow) {
        this.player.score += 1
      }
      else {
        this.player.body.pop()
      }

      this.player.body.unshift(head)

      if (this.game.debugPlayerGrow) {
        this.game.debugPlayerGrow = false
      }

      for (let i = 1; i < this.player.body.length; i++) {
        const { x, y } = this.player.body[i]
        if (head.x === x && head.y === y) {
          // on death
          this.player.score = 0
          this.player.body = []
          return
        }
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
    drawFilledRect(grid) {
      const cellSize = this.getCellSize()
      this.ctx.fillRect(grid.x * cellSize.x, grid.y * cellSize.y, cellSize.x, cellSize.y)
    },
    draw() {
      this.drawBackground()
      this.drawGrid()
      this.drawPlayer()
      this.drawPickable()
    },
    drawBackground() {
      this.ctx.fillStyle = "black"
      this.ctx.fillRect(0, 0, this.size.x, this.size.y)
    },
    drawGrid() {
      const cellSize = this.getCellSize()

      this.ctx.strokeStyle = "gray"

      for (let y = 0; y < this.grid.y; y++) {
        for (let x = 0; x < this.grid.x; x++) {
          this.ctx.strokeRect(x * cellSize.x, y * cellSize.y, (x + 1) * cellSize.x, (y + 1) * cellSize.y)
        }
      }
    },
    drawPlayer() {
      for (let i = 0; i < this.player.body.length; i++) {
        this.ctx.fillStyle = this.player.color
        this.drawFilledRect(this.player.body[i])
      }
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