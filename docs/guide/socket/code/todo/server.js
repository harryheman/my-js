const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server ready. Port: ${PORT}`)
})

app.use(express.static(__dirname))

const registerTodoHandlers = require('./todoHandlers')

const onConnection = (socket) => {
  console.log('User connected')
  registerTodoHandlers(io, socket)
}

io.on('connection', onConnection)
