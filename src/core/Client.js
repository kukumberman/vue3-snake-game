import EventEmitter from "events"

export default class Client {
  constructor(input, preferences) {
    this.id = "" // from server
    this.input = input
    this.preferences = preferences
    this.eventEmitter = new EventEmitter()
  }

  handleKeydown(code) {
    const entry = Object.entries(this.input).find(([k, v]) => v === code)
    if (!entry) {
      return
    }

    const [action, _] = entry
    this.eventEmitter.emit(action)
  }
}
