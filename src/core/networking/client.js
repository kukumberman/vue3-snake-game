import EventEmitter from "events"

export const emitter = new EventEmitter()

const PORT = 5555

const socket = new WebSocket(`ws://localhost:${PORT}/snake`)

window.socket = socket
window.sendAsync = sendAsync
console.log("client.js")

function messageHandler(event) {
  console.log(event.type, event.data)
  // const message = JSON.parse(event.data)
  // if (message.id === "count") {
  //   emitter.emit("count", message)
  // }
}

/**
 * usage: sendAsync("some shit").then(response => console.log(response)) // <-- echo "some shit"
 * @param {*} data 
 * @returns 
 */
function sendAsync(data) {
  return new Promise((resolve, reject) => {
    socket.removeEventListener("message", messageHandler)
    socket.addEventListener("message", (event) => {
      socket.addEventListener("message", messageHandler)
      resolve(event.data)
    })
    socket.send(data)
  })
}

socket.addEventListener("message", messageHandler)

socket.addEventListener("open", event => {
  console.log(event.type)
  console.log(event)
})

socket.addEventListener("close", event => {
  console.log(event.type)
  console.log(event)
})
