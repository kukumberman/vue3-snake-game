import Vector2Int from "./math/Vector2Int"
import Snake from "./Snake"

export default class GameWorld {
  /**
   * 
   * @param {number} gridWidth 
   * @param {number} gridHeight 
   */
  constructor(gridWidth, gridHeight) {
    this.player = this.generateLocalSnake()
    this.grid = new Vector2Int(gridWidth, gridHeight)
    this.pickable = new Vector2Int(5, 5)
    this.debug = {
      shouldPlayerGrow: false
    }
  }

  tick() {
    this.player.move(this.grid)

    const shouldEat = this.player.head.equal(this.pickable)

    if (shouldEat) {
      this.spawnFood()
    }

    const shouldGrow = shouldEat || this.debug.shouldPlayerGrow

    if (shouldGrow) {
      this.player.grow()
    }
    else {
      this.player.moveBody()
    }

    if (this.player.checkSelf()) {
      this.deathHandler()
    }

    if (this.debug.shouldPlayerGrow) {
      this.debug.shouldPlayerGrow = false
    }
  }

  spawnFood() {
    // todo: proper random to place pickable only at empty cell
    this.pickable.x = Math.floor(Math.random() * this.grid.x)
    this.pickable.y = Math.floor(Math.random() * this.grid.y)
  }

  deathHandler() {
    // this.player.score = 0
    // this.player.head = new Vector2Int(0, 0)
    // this.player.direction = new Vector2Int(1, 0)
    // this.player.body.splice(0, this.player.body.length)
    this.player = this.generateLocalSnake()
  }

  generateLocalSnake() {
    return new Snake(new Vector2Int(0, 0), new Vector2Int(1, 0))
  }
}
