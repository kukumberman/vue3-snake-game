import Vector2Int from "./math/Vector2Int"
import Snake from "./Snake"

export default class GameWorld {
  /**
   * 
   * @param {Vector2Int} gridSize 
   */
  constructor(gridSize) {
    this.player = new Snake()
    this.grid = gridSize
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
    this.pickable.x = Math.floor(Math.random() * this.grid.x)
    this.pickable.y = Math.floor(Math.random() * this.grid.y)
  }

  deathHandler() {
    this.player.score = 0
    this.player.head = new Vector2Int(0, 0)
    this.player.direction = new Vector2Int(1, 0)
    this.player.body.splice(0, this.player.body.length)
  }
}
