const TYPING_TIMER = 800
const COLORS = [
  '#e21400',
  '#91580f',
  '#f8a700',
  '#f78b00',
  '#58dc00',
  '#287b00',
  '#a8f07a',
  '#4ae8c4',
  '#3b88eb',
  '#3824aa',
  '#a700ff',
  '#d300e7'
]

// вспомогательные функции
const findOne = (selector, el = document) => el.querySelector(selector)
const findAll = (selector, el = document) => [...el.querySelectorAll(selector)]

const hide = (el) => (el.style.display = 'none')
const show = (el) => (el.style.display = 'block')

// HTML-элементы
const $usernameInput = findOne('.username_input')
const $messages = findOne('.messages')
const $messageInput = findOne('.message_input')

const $loginPage = findOne('.login_page')
const $chatPage = findOne('.chat_page')

// глобальные переменные
const S = io()

let username
let connected = false
let typing = false
let lastTypingTime

let $currentInput = $usernameInput
$currentInput.focus()

// функции
const addParticipants = ({ users }) => {
  let message = ''
  if (users === 1) {
    message += `there's 1 participant`
  } else {
    message += `there are ${users} participants`
  }
  log(message)
}

const setUsername = () => {
  username = $usernameInput.value.trim()

  if (username) {
    hide($loginPage)
    show($chatPage)

    $loginPage.onclick = () => false

    $currentInput = $messageInput
    $currentInput.focus()

    S.emit('add user', username)
  }
}

const sendMessage = () => {
  const message = $messageInput.value.trim()

  if (message && connected) {
    $messageInput.value = ''

    addChatMessage({ username, message })

    S.emit('new message', message)
  }
}

const addChatMessage = (data) => {
  removeChatTyping(data)

  const typingClass = data.typing ? 'typing' : ''

  const html = `
    <li
      class="message ${typingClass}"
      data-username="${data.username}"
    >
      <span
        class="username"
        style="color: ${getUsernameColor(data.username)};"
      >
        ${data.username}
      </span>
      <span class="message_body">
        ${data.message}
      </span>
    </li>
  `

  addMessageEl(html)
}

const addMessageEl = (html) => {
  $messages.innerHTML += html
}

const log = (message) => {
  const html = `<li class="log">${message}</li>`

  addMessageEl(html)
}

const addChatTyping = (data) => {
  data.typing = true
  data.message = 'is typing...'
  addChatMessage(data)
}

const removeChatTyping = (data) => {
  const $typingMessages = getTypingMessages(data)

  if ($typingMessages.length > 0) {
    $typingMessages.forEach((el) => {
      el.remove()
    })
  }
}

const updateTyping = () => {
  if (connected) {
    if (!typing) {
      typing = true
      S.emit('typing')
    }

    lastTypingTime = new Date().getTime()

    setTimeout(() => {
      const now = new Date().getTime()
      const diff = now - lastTypingTime
      if (diff >= TYPING_TIMER && typing) {
        S.emit('stop typing')
        typing = false
      }
    }, TYPING_TIMER)
  }
}

const getTypingMessages = ({ username }) =>
  findAll('.message.typing').filter((el) => el.dataset.username === username)

const getUsernameColor = (username) => {
  let hash = 7
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash
  }
  const index = Math.abs(hash % COLORS.length)
  return COLORS[index]
}

// обработчики
window.onkeydown = (e) => {
  if (!(e.ctrlKey || e.metaKey || e.altKey)) $currentInput.focus()

  if (e.which === 13) {
    if (username) {
      sendMessage()
      S.emit('stop typing')
      typing = false
    } else {
      setUsername()
    }
  }
}

$messageInput.oninput = () => {
  updateTyping()
}

$loginPage.onclick = () => {
  $currentInput.focus()
}

$chatPage.onclick = () => {
  $messageInput.focus()
}

// сокет
S.on('login', (data) => {
  connected = true
  log(`Welcome to Socket.IO Chat - `)
  addParticipants(data)
})

S.on('new message', (data) => {
  addChatMessage(data)
})

S.on('user joined', (data) => {
  log(`${data.username} joined`)
  addParticipants(data)
})

S.on('user left', (data) => {
  log(`${data.username} left`)
  addParticipants(data)
  removeChatTyping(data)
})

S.on('typing', (data) => {
  addChatTyping(data)
})

S.on('stop typing', (data) => {
  removeChatTyping(data)
})

S.on('disconnect', () => {
  log('You have been disconnected')
})

S.on('reconnect', () => {
  log('You have been reconnected')
  if (username) {
    S.emit('add user', username)
  }
})

S.on('reconnect_error', () => {
  log('Attempt to reconnect has failed')
})
