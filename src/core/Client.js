import EventEmitter from "events"

export default class Client {
  constructor(input, name) {
    this.id = "" // from server
    this.input = input
    this.name = name
    this.events = new EventEmitter()
  }

  handleKeydown(code) {
    const entry = Object.entries(this.input).find(([action, key]) => {
      if (Array.isArray(key)) {
        if (key.includes(code)) {
          return true
        }
      }
      else if (key === code) {
        return true
      }
      return false
    })

    if (!entry) {
      return
    }

    const [action, _] = entry
    this.events.emit(action)
  }
}
