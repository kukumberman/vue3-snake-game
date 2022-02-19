export default class Vector2Int {
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    this.x = x ?? 0
    this.y = y ?? 0
  }

  /**
   * 
   * @param {Vector2Int} other 
   */
  set(other) {
    this.x = other.x
    this.y = other.y
  }

  copy() {
    return Vector2Int.from(this)
  }

  /**
   * 
   * @param {Vector2Int} other 
   * @returns 
   */
  equal(other) {
    return this.x === other.x && this.y === other.y
  }

  /**
   * 
   * @param {Vector2Int} other 
   * @returns 
   */
  static from(other) {
    return new Vector2Int(other.x, other.y)
  }
}
