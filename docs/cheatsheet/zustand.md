---
sidebar_position: 16.2
title: Шпаргалка по Zustand
description: Шпаргалка по Zustand
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'state manager', 'state management', 'state', 'zustand', 'cheatsheet', 'шпаргалка', 'инструмент управления состоянием', 'управление состоянием', 'состояние']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'state manager', 'state management', 'state', 'zustand', 'cheatsheet', 'шпаргалка', 'инструмент управления состоянием', 'управление состоянием', 'состояние']
---

# Zustand

> [Zustand](https://github.com/pmndrs/zustand) - современный инструмент для управления состоянием `React-приложений`.

[Пример использования](https://github.com/harryheman/Blog-Posts/tree/master/react-zustand).

## Теория

__Установка__

```bash
yarn add zustand
# or
npm i zustand
```

__Создание хранилища__

Хранилище - это хук. В нем можно хранить что угодно: примитивы, объекты, функции. Функция `set` объединяет (merge) состояние.

```js
import create from 'zustand'

const useStore = create((set) => ({
 count: 0,
 increment: () => set((state) => ({ count: state.count + 1 })),
 decrement: () => set((state) => ({ count: state.count - 1 })),
 reset: () => set({ count: 0 })
}))

export default useStore
```

__Использование хранилища__

Хук можно использовать в любом месте приложения (без провайдера!). Компонент будет повторно рендериться (только) при изменении выбранного состояния.

_Использование всего хранилища_

```js
export default function Counter() {
 const { count, increment, decrement, reset } = useStore()

 return (
   <main>
     <h2>{count}</h2>
     <div className='btn-box'>
       <button onClick={decrement} className='btn decrement'>
         -
       </button>
       <button onClick={increment} className='btn increment'>
         +
       </button>
       <button onClick={reset} className='btn reset'>
         0
       </button>
     </div>
   </main>
 )
}
```

В данном случае компонент `Counter` будет повторно рендериться при любом изменении состояния.

_Использование частей состояния (state slices в терминологии Redux)_

```js
// хук для "регистрации" повторного рендеринга
function useLogAfterFirstRender(componentName) {
 const firstRender = useRef(true)

 useEffect(() => {
   firstRender.current = false
 }, [])

 if (!firstRender.current) {
   console.log(`${componentName} render`)
 }
}

function Count() {
 const count = useStore(({ count }) => count)

 useLogAfterFirstRender('Count')

 return <h2>{count}</h2>
}

function DecrementBtn() {
 const decrement = useStore(({ decrement }) => decrement)

 useLogAfterFirstRender('Decrement')

 return (
   <button onClick={decrement} className='btn decrement'>
     -
   </button>
 )
}

function IncrementBtn() {
 const increment = useStore(({ increment }) => increment)

 useLogAfterFirstRender('Increment')

 return (
   <button onClick={increment} className='btn increment'>
     +
   </button>
 )
}

function ResetBtn() {
 const reset = useStore(({ reset }) => reset)

 useLogAfterFirstRender('Reset')

 return (
   <button onClick={reset} className='btn reset'>
     0
   </button>
 )
}

const Counter = () => (
 <main>
   <Count />
   <div className='btn-box'>
     <DecrementBtn />
     <IncrementBtn />
     <ResetBtn />
   </div>
 </main>
)

export default Counter
```

В данном случае будет повторно рендериться только компонент `Count` и только при изменении значения `count`.

__Рецепты__

Если мы перепишем приведенный выше пример следующим образом:

```js
function Count() {
 const count = useStore(({ count }) => count)

 useLogAfterFirstRender('Count')

 return <h2>{count}</h2>
}

function Controls() {
 const { decrement, increment, reset } = useStore(
   ({ decrement, increment, reset }) => ({ decrement, increment, reset })
 )

 useLogAfterFirstRender('Controls')

 return (
   <div className='btn-box'>
     <button onClick={decrement} className='btn decrement'>
       -
     </button>
     <button onClick={increment} className='btn increment'>
       +
     </button>
     <button onClick={reset} className='btn reset'>
       0
     </button>
   </div>
 )
}

const Counter = () => (
 <main>
   <Count />
   <Controls />
 </main>
)

export default Counter
```

То компонент `Controls` будет рендериться при любом изменении состояния (потому что объекты сравниваются по ссылке, а не по значению).

Для решения этой проблемы предназначена функция `shallow`, поверхностно сравнивающая объекты для определения их идентичности и, как следствие, необходимости в повторном рендеринге компонента.

```js
import shallow from 'zustand/shallow'

function Controls() {
 const { decrement, increment, reset } = useStore(
   ({ decrement, increment, reset }) => ({ decrement, increment, reset }),
   /* 👇 */
   shallow
 )

 useLogAfterFirstRender('Controls')

 return (
   <div className='btn-box'>
     <button onClick={decrement} className='btn decrement'>
       -
     </button>
     <button onClick={increment} className='btn increment'>
       +
     </button>
     <button onClick={reset} className='btn reset'>
       0
     </button>
   </div>
 )
}
```

Пример можно переписать следующим образом:

```js
const useStore = create((set) => ({
 count: 0,
 controls: {
   increment: () => set(({ count }) => ({ count: count + 1 })),
   decrement: () => set(({ count }) => ({ count: count - 1 })),
   reset: () => set({ count: 0 })
 }
}))

function Controls() {
 // функция `shallow` больше не нужна
 const controls = useStore(({ controls }) => controls)

 useLogAfterFirstRender('Controls')

 return (
   <div className='btn-box'>
     <button onClick={controls.decrement} className='btn decrement'>
       -
     </button>
     <button onClick={controls.increment} className='btn increment'>
       +
     </button>
     <button onClick={controls.reset} className='btn reset'>
       0
     </button>
   </div>
 )
}
```

Вместо `shallow` можно использовать собственную функцию сравнения:

```js
const todos = useStore(
 state => state.todos,
 (oldTodos, newTodos) => compare(oldTodos, newTodos)
)
```

_Мемоизированные селекторы_

Для мемоизации селекторов рекомендуется использовать хук `useCallback`:

```js
const todoById = useStore(useCallback(state => state.todos[id], [id]))
```

Если селектор не зависит от области видимости (scope), его можно определить за пределами компонента (это называется фиксированной ссылкой/fixed reference):

```js
const selector = state => state.todos

function TodoList() {
 const todos = useStore(selector)

 // ...
}
```

_Замена состояния_

Для замены состояния вместо объединения можно передать `true` в качестве второго аргумента функции `set`:

```js
const useStore = create(set => ({
 // ...
 clear: () => set({}, true)
}))
```

_Асинхронные операции_

Для `zustand` не имеет значения, какой является операция, синхронной или асинхронной, достаточно просто вызвать `set` в нужном месте и в нужное время:

```js
const useStore = create((set, get) => ({
 todos: [],
 loading: false,
 error: null,
 fetchTodos: async () => {
   set({ loading: true })
   try {
     const response = await fetch(SERVER_URI)
     if (!response.ok) throw response
     set({ todos: await response.json() })
   } catch (e) {
     let error = e
     // custom error
     if (e.status === 400) {
       error = await e.json()
     }
     set({ error })
   } finally {
     set({ loading: false })
   }
 }
}))
```

_Чтение состояние в операциях_

Функция `get` позволяет получать доступ к состоянию в любом месте хранилища (за пределами `set`):

```js
const useStore = create((set, get) => ({
 todos: [],
 removeTodo(id) {
   const newTodos = get().todos.filter(t => t.id !== id)
   set({ todos: newTodos })
 }
}))
```

_Временные обновления_

Функция `subscribe` позволяет привязаться (bind) к части состояния без запуска повторного рендеринга при изменении этой части. Данную технику рекомендуется использовать в хуке `useEffect` для выполнения отписки (unsubscribe) при размонтировании компонента:

```js
const useStore = create(set => ({ count: 0, /* ... */ }))

function Counter() {
 // получаем начальное состояние
 const countRef = useRef(useStore.getState().count)

 useEffect(() => {
   // подключаемся к хранилищу при монтировании,
   // отключаемся при размонтировании
   const unsubscribe = useStore.subscribe(
     state => (countRef.current = state.count)
   )
   return () => {
     unsubscribe()
   }
 }, [])
}
```

_Долгосрочное хранение состояния_

Функция `persist` позволяет записывать состояние в любой вид хранилища (по умолчанию используется `localStorage`):

```js
import create from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(persist(
 (set, get) => ({
   todos: [],
   addTodo(newTodo) {
     const newTodos = [...get().todos, newTodo]
     set({ todos: newTodos })
   }
 }, {
   name: "todos-storage",
   getStorage: () => sessionStorage
 })
))
```

_Для тех, кто не может жить без Redux_

```js
const types = { incrementBy: 'INCREMENT_BY', decrementBy: 'DECREMENT_BY', reset: 'RESET' }

const reducer = (state, { type, payload }) => {
 switch (type) {
   case types.incrementBy: return { count: state.count + payload }
   case types.decrementBy: return { count: state.count - payload }
   case types.reset: return { count: 0 }
   default: return state
 }
}

const useStore = create(set => ({
 count: 0,
 dispatch: action => set(state => reducer(state, action))
}))

const dispatch = useStore(state => state.dispatch)
dispatch({ type: types.incrementBy, payload: 42 })
```

С помощью посредника (middleware) `redux` можно получить еще больше возможностей:

```js
import { redux } from 'zustand/middleware'

const initialState = { count: 0 }

const [useStore, api] = create(redux(reducer, initialState))

const count = useStore(state => state.count)
api.dispatch({ type: types.decrementBy, payload: 24 })
```

_Инструменты разработчика_

Посредник `devtools` позволяет подключить к хранилищу инструменты разработчика, в том числе, предоставляемые `redux`:

```js
import { devtools } from 'zustand/middleware'

// setState
const useStore = create(devtools(store))
// подробная информация о типе и полезной нагрузке операции
const useStore = create(devtools(redux(reducer, initialState)))
```

_Контекст_

Функция `createContext` предназначена для передачи хука `useStore` в качестве пропа через контекст. Это может потребоваться для соблюдения паттерна внедрения зависимостей (dependency injection) или для инициализации хранилища с помощью пропов внутри компонента:

```js
import create from 'zustand'
import createContext from 'zustand/context'

const { Provider, useStore } = createContext()

const createStore = () => create(/* ... */)

const App = () => (
 <Provider createStore={createStore}>
   {/* ... */}
 </Provider>
)

const Component = () => {
 const state = useStore()
 const stateSlice = useStore(selector)

 // ...
}
```

Есть еще несколько менее, на мой взгляд, полезных возможностей, предоставляемых `zustand`, которые мы рассматривать не будем (обязательно загляните в репозиторий).

## Практика

Создаем шаблон `React-приложения` с помощью [`create-snowpack-app`](https://www.npmjs.com/package/create-snowpack-app):

```bash
yarn create snowpack-app react-zustand --template @snowpack/app-template-react --use-yarn --no-git
# или
# в данном случае флаг `--use-yarn` не нужен
npx create-snowpack-app ...
```

Нам потребуется некое подобие сервера, от которого мы будем получать начальные тудушки.

Переходим в созданную директорию и устанавливаем [`json-server`](https://www.npmjs.com/package/json-server):

```bash
cd react-zustand
yarn add json-server
# или
npm i json-server
```

Создаем файл `db.json` в корневой директории проекта:

```json
{
 "todos": [
   {
     "id": "1",
     "text": "Sleep",
     "done": true
   },
   {
     "id": "2",
     "text": "Eat",
     "done": true
   },
   {
     "id": "3",
     "text": "Code",
     "done": false
   },
   {
     "id": "4",
     "text": "Repeat",
     "done": false
   }
 ]
}
```

Определяем в разделе `scripts` файла `package.json` команду для запуска сервера:

```json
"server": "json-server -w db.json -d 1000"
```

- `-w | --watch` - файл с данными;
- `-d | --delay` - задержка для имитации работы реального сервера.

Запускаем сервер с помощью команды `yarn server` или `npm run server`.

По умолчанию сервер запускается по адресу `http://localhost:3000/todos`.

Структура директории `src`:

```
- components
 - Loader.jsx - индикатор загрузки
 - Error.jsx - обработчик ошибок
 - Boundary.jsx - предохранитель
 - TodoForm.jsx - форма для создания новой тудушки
 - TodoInfo.jsx - статистика
 - TodoList.jsx - список тудушек
 - TodoItem.jsx - элемент тудушки
 - TodoControls.jsx - панель управления
 - index.js - повторный экспорт компонентов
- store
 - index.js - хранилище
- App.css
- App.jsx
- index.jsx
```

Создаем хранилище (`store/index.js`):

```js
import create from 'zustand'

const useStore = create((set, get) => ({
 todos: [],
 loading: false,
 error: null,
 info: {},
 updateInfo() {
   const todos = get().todos
   const { length: total } = todos
   const active = todos.filter((t) => !t.done).length
   const done = total - active
   const left = Math.round((active / total) * 100) + '%'
   set({ info: { total, active, done, left } })
 },
 addTodo(newTodo) {
   const todos = [...get().todos, newTodo]
   set({ todos })
 },
 updateTodo(id) {
   const todos = get().todos.map((t) =>
     t.id === id ? { ...t, done: !t.done } : t
   )
   set({ todos })
 },
 removeTodo(id) {
   const todos = get().todos.filter((t) => t.id !== id)
   set({ todos })
 },
 completeActiveTodos() {
   const todos = get().todos.map((t) => (t.done ? t : { ...t, done: true }))
   set({ todos })
 },
 removeCompletedTodos() {
   const todos = get().todos.filter((t) => !t.done)
   set({ todos })
 },
 async fetchTodos() {
   set({ loading: true })
   try {
     const response = await fetch(SERVER_URI)
     if (!response.ok) throw response
     set({ todos: await response.json() })
   } catch (e) {
     let error = e
     // custom error
     if (e.statusCode === 400) {
       error = await e.json()
     }
     set({ error })
   } finally {
     set({ loading: false })
   }
 }
}))

export default useStore
```

У нас имеется состояние для тудушек, загрузки, ошибки и статистики, несколько стандартных и 2 дополнительных синхронных операции, а также 1 асинхронная операция - получение задач от сервера.

Основной файл приложения (`App.jsx`):

```js
import './App.css'
import React from 'react'
// хранилище
import useStore from './store'
// компоненты
import {
 Boundary,
 TodoControls,
 TodoForm,
 TodoInfo,
 TodoList
} from './components'

// одна из фишек, которые мы не рассматривали
// вызываем асинхронную операцию для получения тудушек от сервера за пределами компонента
// если сервер отвечает достаточно быстро
// мы получаем начальное состояние до рендеринга компонентов
useStore.getState().fetchTodos()

const App = () => (
 <>
   <header>
     <h1>Zustand Todo App</h1>
   </header>
   <main>
     <Boundary>
       <TodoForm />
       <TodoInfo />
       <TodoControls />
       <TodoList />
     </Boundary>
   </main>
   <footer>
     <p>&copy; Not all rights reserved.<br />
     Sad, but true</p>
   </footer>
 </>
)

export default App
```

Форма для создания новой тудушки (`components/TodoForm.jsx`):

```js
import React, { useEffect, useState } from 'react'
// утилита для генерации идентификаторов
// yarn add nanoid or
// npm i nanoid
import { nanoid } from 'nanoid'
// хранилище
import useStore from '../store'

export const TodoForm = () => {
 const [text, setText] = useState('')
 const [submitDisabled, setSubmitDisabled] = useState(true)
 /* 👇 */
 const addTodo = useStore(({ addTodo }) => addTodo)

 useEffect(() => {
   setSubmitDisabled(!text.trim())
 }, [text])

 const onChange = ({ target: { value } }) => {
   setText(value)
 }

 const onSubmit = (e) => {
   e.preventDefault()
   if (submitDisabled) return
   const newTodo = {
     id: nanoid(),
     text,
     done: false
   }
   /* 👇 */
   addTodo(newTodo)
   setText('')
 }

 return (
   <form className='todo-form' onSubmit={onSubmit}>
     <label htmlFor='text'>New todo text</label>
     <div>
       <input
         type='text'
         required
         value={text}
         onChange={onChange}
         style={
           !submitDisabled ? { borderBottom: '2px solid var(--success)' } : {}
         }
       />
       <button className='btn-add' disabled={submitDisabled}>
         Add
       </button>
     </div>
   </form>
 )
}
```

Список тудушек (`components/TodoList.jsx`):

```js
import React, { useLayoutEffect, useRef } from 'react'
// библиотека для анимации
// yarn add gsap or
// npm i gsap
import { gsap } from 'gsap'
// хранилище
import useStore from '../store'
import { TodoItem } from './TodoItem'

export const TodoList = () => {
 /* 👇 */
 const todos = useStore(({ todos }) => todos)
 const todoListRef = useRef()
 const q = gsap.utils.selector(todoListRef)

 useLayoutEffect(() => {
   if (todoListRef.current) {
     gsap.fromTo(
       q('.todo-item'),
       {
         x: 100,
         opacity: 0
       },
       {
         x: 0,
         opacity: 1,
         stagger: 1 / todos.length
       }
     )
   }
 }, [])

 /* 👇 */
 return (
   todos.length > 0 && (
     <ul className='todo-list' ref={todoListRef}>
       {todos.map((todo) => (
         <TodoItem key={todo.id} todo={todo} />
       ))}
     </ul>
   )
 )
}
```

Элемент тудушки (`components/TodoItem.jsx`):

```js
import React from 'react'
import { gsap } from 'gsap'
// утилита для сравнения объектов
import shallow from 'zustand/shallow'
// хранилище
import useStore from '../store'

export const TodoItem = ({ todo }) => {
 /* 👇 */
 const { updateTodo, removeTodo } = useStore(
   ({ updateTodo, removeTodo }) => ({
     updateTodo,
     removeTodo
   }),
   shallow
 )

 const remove = (id, target) => {
   gsap.to(target, {
     opacity: 0,
     x: -100,
     // удаляем тудушку после завершения анимации
     onComplete() {
       /* 👇 */
       removeTodo(id)
     }
   })
 }

 const { id, text, done } = todo

 return (
   <li className='todo-item'>
     <input type='checkbox' onChange={() => {
       /* 👇 */
       updateTodo(id)
     }} checked={done} />
     <span
       style={done ? { textDecoration: 'line-through' } : {}}
       className='todo-text'
     >
       {text}
     </span>
     <button
       className='btn-remove'
       onClick={(e) => {
         /* 👇 */
         remove(id, e.target.parentElement)
       }}
     >
       ✖
     </button>
   </li>
 )
}
```

Панель управления (`components/TodoControls.jsx`):

```js
import React from 'react'
// утилита для сравнения объектов
import shallow from 'zustand/shallow'
// хранилище
import useStore from '../store'

export const TodoControls = () => {
 /* 👇 */
 const { todos, completeActiveTodos, removeCompletedTodos } =
   useStore(
     ({ todos, completeActiveTodos, removeCompletedTodos }) => ({
       todos,
       completeActiveTodos,
       removeCompletedTodos
     }),
     shallow
   )

 if (!todos.length) return null

 return (
   <div className='todo-controls'>
     <button className='btn-complete' onClick={completeActiveTodos}>
       Complete all todos
     </button>
     <button className='btn-remove' onClick={removeCompletedTodos}>
       Remove completed todos
     </button>
   </div>
 )
}
```

Статистика (`components/TodoInfo.jsx`):

```js
import React, { useEffect } from 'react'
// утилита для сравнения объектов
import shallow from 'zustand/shallow'
// хранилище
import useStore from '../store'

export const TodoInfo = () => {
 /* 👇 */
 const { todos, info, updateInfo } = useStore(
   ({ todos, info, updateInfo }) => ({ todos, info, updateInfo }),
   shallow
 )

 // обновляем статистику при каждом изменении тудушек
 useEffect(() => {
   /* 👇 */
   updateInfo()
 }, [todos])

 if (!info || !todos.length) return null

 return (
   <div className='todo-info'>
     {['Total', 'Active', 'Done', 'Left'].map((k) => (
       <span key={k}>
         {k}: {info[k.toLowerCase()]}
       </span>
     ))}
   </div>
 )
}
```

Наконец, предохранитель:

```js
import React from 'react'
// утилита для сравнения объектов
import shallow from 'zustand/shallow'
// хранилище
import useStore from '../store'
// компоненты
import { Error } from './Error'
import { Loader } from './Loader'

export const Boundary = ({ children }) => {
 /* 👇 */
 const { loading, error } = useStore(
   ({ loading, error }) => ({ loading, error }),
   shallow
 )

 /* 👇 */
 // yarn add react-loader-spinner
 if (loading) return <Loader width={50} />

 /* 👇 */
 if (error) return <Error error={error} />

 return <>{children}</>
}
```

Запускаем сервер с помощью команды `yarn start` или `npm start` и тестируем приложение.

<img src="https://habrastorage.org/webt/lq/74/p-/lq74p-tzitpeycg4wvbpcvnthrc.png" alt="" />
<br />
<img src="https://habrastorage.org/webt/hm/hc/id/hmhcid_if6nohrec7zxgtth4ado.png" alt="" />
<br />
<img src="https://habrastorage.org/webt/sr/td/ua/srtduauqsvvdffeumkrdibtv6vq.png" alt="" />
<br />

Как видим, все работает, как ожидается.

Что насчет производительности - спросите вы. Давайте посмотрим.

Редактируем файл `components/TodoControls.jsx` следующим образом:

```js
// ...
import { nanoid } from 'nanoid'

export const TodoControls = () => {
 const {
   // ...
   addTodo,
   updateTodo
 } = useStore(
   ({
     // ...
     addTodo,
     updateTodo
   }) => ({
     // ...
     addTodo,
     updateTodo
   }),
   shallow
 )

 // функция для создания 2500 тудушек
 const createManyTodos = () => {
   const times = []
   for (let i = 0; i < 25; i++) {
     const start = performance.now()
     for (let j = 0; j < 100; j++) {
       const id = nanoid()
       const todo = {
         id,
         text: `Todo ${id}`,
         done: false
       }
       addTodo(todo)
     }
     const difference = performance.now() - start
     times.push(difference)
   }
   const time = Math.round(times.reduce((a, c) => (a += c), 0) / 25)
   console.log('Create time:', time)
 }

 // функция для обновления всех тудушек
 const updateAllTodos = () => {
   const todos = useStore.getState().todos
   const start = performance.now()
   for (let i = 0; i < todos.length; i++) {
     updateTodo(todos[i].id)
   }
   const time = Math.round(performance.now() - start)
   console.log('Update time:', time)
 }

 // if (!todos.length) return null

 return (
   <div className='todo-controls'>
     {/* ... */}
     <button className='btn-create' onClick={createManyTodos}>
       Create 2500 todos
     </button>
     <button className='btn-update' onClick={updateAllTodos}>
       Update all todos
     </button>
   </div>
 )
}
```

Отключаем получение задач от сервера в `App.jsx`:

```js
// useStore.getState().fetchTodos()
```

Нажимаем на кнопку `Create 2500 todos`:

<img src="https://habrastorage.org/webt/yn/zm/sq/ynzmsq_6swwasektg589xldv6yo.png" alt="" />
<br />

Время создания `2500` тудушек составляет `6-7 мс`.

Нажимаем `Update all todos`:

<img src="https://habrastorage.org/webt/e8/ti/p6/e8tip651kkazth1gjjmonvipmr4.png" alt="" />
<br />

Время обновления `2500` тудушек составляет `1100-1200 мс`.

Данные показатели очень близки к показателям "чистого" `React` - при использовании в качестве хранилища состояния связки `useContext/useReducer`, и намного превосходят показатели `Redux` в лице `Redux Toolkit`.
