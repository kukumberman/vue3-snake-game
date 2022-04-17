import EventEmitter from "events"
import Vector2Int from "./math/Vector2Int"
import Snake from "./Snake"
import Client from "./Client"
import { sleep } from "./utils"

export default class GameWorld {
  /**
   * 
   * @param {number} gridWidth 
   * @param {number} gridHeight 
   * @param {number} frameDelay
   */
  constructor(gridWidth, gridHeight, frameDelay) {
    this.grid = new Vector2Int(gridWidth, gridHeight)
    this.frameDelay = frameDelay
    this.snakes = new Map()
    this.clients = new Map()
    this.pickable = new Vector2Int(5, 5)
    this.events = new EventEmitter()
    this.frameCount = 0
    this.deltaTime = 0
    this.lastFrameTime = 0
    this.isPaused = false
  }

  async start() {
    while (true) {
      this.deltaTime = Date.now() - this.lastFrameTime
      if (!this.isPaused) {
        this.update()
      }
      this.lastFrameTime = Date.now()
      await sleep(this.frameDelay)
    }
  }

  update() {
    this.tick()
    this.frameCount += 1
    this.events.emit("update")
  }

  /**
   * 
   * @param {Client} client 
   */
  addPlayer(client) {
    if (this.snakes.size === 2) {
      throw new Error("more than 2 players are not supported")
    }

    client.id = this.snakes.size.toString()
    if (this.snakes.size === 0) {
      this.snakes.set(client.id, this.generateLocalSnake())
    }
    else if (this.snakes.size === 1) {
      this.snakes.set(client.id, this.generateRemoteSnake())
    }

    this.clients.set(client.id, client)

    this.subscribeToClientEvents(client)
  }

  /**
   * 
   * @param {Client} client 
   */
  subscribeToClientEvents(client) {
    client.events.on("extra", () => {
      this.snakes.get(client.id).debug.shouldPlayerGrow = true
    })
    client.events.on("direction.up", () => {
      this.snakes.get(client.id).setDirection(0, -1)
    })
    client.events.on("direction.down", () => {
      this.snakes.get(client.id).setDirection(0, 1)
    })
    client.events.on("direction.left", () => {
      this.snakes.get(client.id).setDirection(-1, 0)
    })
    client.events.on("direction.right", () => {
      this.snakes.get(client.id).setDirection(1, 0)
    })
  }

  tick() {
    this.clients.forEach(client => {
      this.tickPlayer(client)
    })

    if (this.snakes.size === 2) {
      this.collisionHandler()
    }
  }

  /**
   * 
   * @param {Client} client 
   */
  tickPlayer(client) {
    const snake = this.snakes.get(client.id)

    snake.move(this.grid)

    const shouldEat = snake.head.equal(this.pickable)

    if (shouldEat) {
      this.spawnFood()
    }

    const shouldGrow = shouldEat || snake.debug.shouldPlayerGrow

    if (shouldGrow) {
      snake.grow()
    }
    else {
      snake.moveBody()
    }

    if (snake.checkSelf()) {
      this.events.emit("snakeCollision.self", { 
        loser: client.id
      })
    }

    if (snake.debug.shouldPlayerGrow) {
      snake.debug.shouldPlayerGrow = false
    }
  }

  spawnFood() {
    // todo: proper random to place pickable only at empty cell
    this.pickable.x = Math.floor(Math.random() * this.grid.x)
    this.pickable.y = Math.floor(Math.random() * this.grid.y)
  }

  collisionHandler() {
    const clients = Array.from(this.clients.keys())

    const firstCollidesWithSecond = this.snakes.get(clients[0]).collidesWith(this.snakes.get(clients[1]))
    const secondCollidesWithFirst = this.snakes.get(clients[1]).collidesWith(this.snakes.get(clients[0]))

    if (firstCollidesWithSecond && secondCollidesWithFirst) {
      this.events.emit("snakeCollision.both")
    }
    else if (firstCollidesWithSecond) {
      this.events.emit("snakeCollision.other", {
        winner: clients[1]
      })
    }
    else if (secondCollidesWithFirst) {
      this.events.emit("snakeCollision.other", {
        winner: clients[0]
      })
    }
  }

  generateLocalSnake() {
    const head = new Vector2Int(0, 0)
    const snake = new Snake(head, new Vector2Int(1, 0))
    return snake
  }

  generateRemoteSnake() {
    const head = new Vector2Int(this.grid.x - 1, this.grid.y - 1)
    const snake = new Snake(head, new Vector2Int(-1, 0))
    return snake
  }
}
