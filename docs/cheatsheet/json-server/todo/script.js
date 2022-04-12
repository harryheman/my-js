// api
import { api } from './modules/api.js'
// constants - methods & actions
import { POST, DELETE, PUT, UPDATE, REMOVE } from './modules/constants.js'
// "global" helpers
import { getEl, uuid } from './modules/helpers.js'

// state
let todos = []

// local helper
const getTodoById = (id) => todos.find((todo) => todo.id === id)

// DOM-elements
const formEl = getEl('form')
const textInput = getEl('input')
const listEl = getEl('ul')

// functions
// add todo to the DOM
const addTodo = (todo, replace = false) => {
  const itemTemplate = `
    <li
      data-id="${todo.id}"
      style="margin: 0.5rem 0"
    >
      <input
        type="checkbox"
        ${todo.completed ? 'checked' : ''}
      />
      <span style="${
        todo.completed ? 'text-decoration: line-through; opacity: 0.8' : ''
      }">
        ${todo.text}
      </span>
      <button data-btn="remove">
        Remove
      </button>
    </li>
  `

  // for updated todo
  if (replace) return itemTemplate

  // for new todo
  listEl.insertAdjacentHTML('beforeend', itemTemplate)
}

// fetch todos from the server
async function getTodos() {
  listEl.innerHTML = ''
  todos = await api()
  todos.forEach((todo) => addTodo(todo))
  initButtons()
}
getTodos()

// init checkboxes & buttons
function initButtons() {
  const checkboxInputs = getEl('[type="checkbox"]', true, listEl)
  const removeButtons = getEl('[data-btn="remove"]', true, listEl)

  checkboxInputs.forEach(
    (input) => (input.onclick = (e) => handleClick(e, UPDATE))
  )

  removeButtons.forEach((btn) => (btn.onclick = (e) => handleClick(e, REMOVE)))
}

// update | remove todo
const handleClick = async (e, action) => {
  const itemEl = e.target.parentElement
  const { id } = itemEl.dataset

  switch (action) {
    case UPDATE: {
      const todo = getTodoById(id)
      todo.completed = !todo.completed

      await api(PUT, { id, body: todo })

      // enable replace, replace instead add
      itemEl.outerHTML = addTodo(todo, true)

      // we need to re-init updated todo's buttons
      initButtons()
      break
    }
    case REMOVE: {
      await api(DELETE, { id })
      itemEl.remove()
      break
    }
    default:
      return
  }
}

// add new todo
formEl.onsubmit = async (e) => {
  e.preventDefault()

  const trimmed = textInput.value.trim()

  if (trimmed) {
    const newTodo = {
      id: uuid(5),
      text: trimmed,
      completed: false
    }

    await api(POST, { body: newTodo })

    // we need to update todos arr
    getTodos()

    textInput.value = ''
  }
}
