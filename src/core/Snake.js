import Vector2Int from "./math/Vector2Int"

export default class Snake {
  constructor() {
    this.head = new Vector2Int()
    this.direction = new Vector2Int()
    this.body = []
    this.score = 0
  }

  /**
   * 
   * @param {Vector2Int} grid 
   */
  move(grid) {
    this.head.x += this.direction.x
    this.head.y += this.direction.y

    if (this.head.x === grid.x) {
      this.head.x = 0
    }
    else if (this.head.x < 0) {
      this.head.x = grid.x - 1
    }

    if (this.head.y === grid.y) {
      this.head.y = 0
    }
    else if (this.head.y < 0) {
      this.head.y = grid.y - 1
    }
  }

  grow() {
    this.score += 1
    this.body.unshift(this.head.copy())
  }

  moveBody() {
    if (this.body.length == 0) {
      this.body.push(this.head.copy())
    }
    else if (this.body.length == 1) {
      this.body[0].set(this.head)
    }
    else if (this.body.length > 1) {
      this.body.unshift(this.head.copy())
      this.body.splice(this.body.length - 1, 1)
    }
  }

  checkSelf() {
    for (let i = 1; i < this.body.length; i++) {
      if (this.head.equal(this.body[i])) {
        return true
      }
    }
    return false
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  setDirection(x, y) {
    if (Math.abs(this.direction.x) != Math.abs(x)) {
      this.direction.x = x
    }
    if (Math.abs(this.direction.y) != Math.abs(y)) {
      this.direction.y = y
    }
  }
}