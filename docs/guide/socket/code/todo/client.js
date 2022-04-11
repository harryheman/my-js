const socket = io()

const form = document.querySelector('form')
const input = document.querySelector('input')
const list = document.querySelector('ul')

socket.emit('todo:get')

socket.on('todos', (todos) => {
  list.innerHTML = ''
  todos.forEach(addTodo)
})

function addTodo({ id, title }) {
  const template = /*html*/ `
          <li>
            <span>${title}</span>
            <button data-id="${id}">Remove</button>
          </li>
        `
  list.innerHTML += template
  initBtns()
}

function initBtns() {
  const buttons = document.querySelectorAll('button')

  buttons.forEach((btn) => {
    btn.addEventListener('click', ({ target }) => {
      const { id } = target.dataset
      socket.emit('todo:remove', id)
    })
  })
}

form.onsubmit = (e) => {
  e.preventDefault()
  const title = input.value.trim()
  input.value = ''
  socket.emit('todo:add', title)
}
