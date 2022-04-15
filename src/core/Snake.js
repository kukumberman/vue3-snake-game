import Vector2Int from "./math/Vector2Int"

export default class Snake {
  /**
   * 
   * @param {Vector2Int} head 
   * @param {Vector2Int} direction 
   */
  constructor(head, direction) {
    this.head = head
    this.direction = direction
    this.body = [this.head.copy()]
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
    // todo: fix minor bug when player sets new direction and immediately changes to opposite of previous dir (if body.length > 2 snake eats yourself)
    // ! all checks is used to prevent moving in opposite direction
    if (Math.abs(this.direction.x) != Math.abs(x)) {
      this.direction.x = x
    }
    if (Math.abs(this.direction.y) != Math.abs(y)) {
      this.direction.y = y
    }
  }
}
