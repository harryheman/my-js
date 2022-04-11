const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { nanoid } = require('nanoid')

const adapter = new FileSync('todos.json')
const db = low(adapter)

db.defaults({
  todos: [
    { id: '1', title: 'Eat' },
    { id: '2', title: 'Sleep' },
    { id: '3', title: 'Repeat' }
  ]
}).write()

module.exports = (io, socket) => {
  const getTodos = () => {
    const todos = db.get('todos').value()
    io.emit('todos', todos)
  }

  const addTodo = (title) => {
    db.get('todos')
      .push({ id: nanoid(4), title })
      .write()
    getTodos()
  }

  const removeTodo = (id) => {
    db.get('todos').remove({ id }).write()
    getTodos()
  }

  socket.on('todo:get', getTodos)
  socket.on('todo:add', addTodo)
  socket.on('todo:remove', removeTodo)
}
