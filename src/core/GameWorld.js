import Vector2Int from "./math/Vector2Int"
import Snake from "./Snake"
import Client from "./Client"

export default class GameWorld {
  /**
   * 
   * @param {number} gridWidth 
   * @param {number} gridHeight 
   */
  constructor(gridWidth, gridHeight) {
    this.grid = new Vector2Int(gridWidth, gridHeight)
    this.snakes = new Map()
    this.clients = new Map()
    this.pickable = new Vector2Int(5, 5)
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
    client.eventEmitter.on("extra", () => {
      this.snakes.get(client.id).debug.shouldPlayerGrow = true
    })
    client.eventEmitter.on("direction.up", () => {
      this.snakes.get(client.id).setDirection(0, -1)
    })
    client.eventEmitter.on("direction.down", () => {
      this.snakes.get(client.id).setDirection(0, 1)
    })
    client.eventEmitter.on("direction.left", () => {
      this.snakes.get(client.id).setDirection(-1, 0)
    })
    client.eventEmitter.on("direction.right", () => {
      this.snakes.get(client.id).setDirection(1, 0)
    })
  }

  tick() {
    this.snakes.forEach((player, id) => {
      this.tickPlayer(player)
    })

    if (this.snakes.size === 2) {
      // todo: handle collision
    }
  }

  tickPlayer(snake) {
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
      // todo
      console.log("dead")
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

  /*
  deathHandler() {
    // this.player.score = 0
    // this.player.head = new Vector2Int(0, 0)
    // this.player.direction = new Vector2Int(1, 0)
    // this.player.body.splice(0, this.player.body.length)
    this.player = this.generateLocalSnake()
  }
  */

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
