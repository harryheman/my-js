---
sidebar_position: 4
---

# Redux Toolkit

> [Redux Toolkit](https://redux-toolkit.js.org/) - это набор утилит, облегчающих работу с [Redux](https://redux.js.org/) - инструментом для управления состоянием приложений.

Он был разработан для решения трех главных проблем:

- Слишком сложная настройка хранилища (store)
- Для того, чтобы заставить `Redux` делать что-то полезное, приходится использовать дополнительные пакеты
- Слишком много шаблонного кода (boilerplate)

`Redux Toolkit` предоставляет инструменты для настройки хранилища и выполнения наиболее распространенных операций, а также содержит полезные утилиты, позволяющие упростить код.

## Установка

*Создание нового приложения с помощью Create React App*

```bash
# app-name - это название приложения
yarn create react-app app-name --template redux
# или
npx create-react-app app-name --template redux
```

*TypeScript*

```bash
yarn create react-app app-name --template redux-typescript
# или
npx create-react-app app-name --templae redux-typescript
```

*Добавление пакета в существующее приложение*

```bash
yarn add @reduxjs/toolkit
# или
npm i @reduxjs/toolkit
```

## Состав пакета

`Redux Toolkit` включает в себя следующие API:

- `configureStore()`: обертка для `createStore()`, упрощающая настройку хранилища с настройками по умолчанию. Позволяет автоматически комбинировать отдельные частичные редукторы (slice reducers), добавлять промежуточные слои или посредников (middlewares), по умолчанию включает `redux-thunk` (преобразователя), позволяет использовать расширение `Redux DevTools` (инструменты разработчика `Redux`)
- `createReducer()`: позволяет использовать таблицу поиска (lookup table) операций для редукторов случая (case reducers) вместо инструкций `switch`. В данном API используется библиотека `immer`, позволяющая напрямую изменять иммутабельный код, например, так: `state.todos[3].completed = true`
- `createAction()`: генерирует создателя операции (action creator) для переданного типа операции. Функция имеет переопределенный метод `toString()`, что позволяет использовать ее вместо константы типа
- `createSlice()`: принимает объект, содержащий редуктор, название части состояния (state slice), начальное значение состояния, и автоматически генерирует частичный редуктор с соответствующими создателями и типами операции
- `createAsyncThunk()`: принимает тип операции и функцию, возвращающую промис, и генерирует `thunk`, отправляющий типы операции `pending/fulfilled/rejected` на основе промиса
- `createEntityAdapter()`: генерирует набор переиспользуемых редукторов и селекторов для управления нормализованными данными в хранилище
- утилита `createSelector()` из библиотеки `Reselect`

# Руководство по использованию

## Настройка хранилища (store setup)

Разработка любого `Redux`-приложения предполагает создание и настройку хранилища. Как правило, данный процесс состоит из следующих этапов:

- Импорт или создание корневого редуктора (root reducer)
- Настройка `middleware`, как минимум, для работы с асинхронным кодом
- Настройка инстурментов разработчика `Redux`
- Возможно, программное изменение кода в зависимости от режима разработки

### Ручная настройка

Приведенный ниже пример демострирует типичный процесс настройки хранилища:

```js
import { applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [thunkMiddleware, loggerMiddleware]
  const middlewareEnhacer = applyMiddleware(...middlewares)

  const enhancers = [monitorReducersEnhancer, middlewareEnhacer]
  const composedEnhancers = composeWithDevTools(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

Проблемы данного подхода:

- Аргументы `(rootReducer, preloadedState, enhancer)` должны быть переданы функции `createStore()` в правильном порядке
- Процесс настройки `middlewares` и `enhancers` (усилителей) может быть сложным, особенно, при попытке добавить несколько частей конфигурации
- Документация `Redux DevTools Extension` рекомендует использовать некоторый код для проверки глобального пространства имен для опеределения доступности расширения. Копирование/вставка предложенного сниппета усложняет последующее изучение кода

### Упрощение настройки с помощью `configureStore()`

`configureStore()` помогает решить названные проблемы следующим образом:

- Принимает объект с "именованными" параметрами, что облегчает изучение кода
- Позволяет передавать массив `middlewares` и `enhancers`, автоматически вызывая `applyMiddleware()` и `compose()`
- автоматически включает расширение `Redux DevTools`

Кроме того, `configureStore()` автоматически добавляет следующих посредников:

- `redux-thunk` - наиболее часто используемый промежуточный слой для работы с синхронной и асинхронной логикой за пределами компонентов
- в режиме разработки, промежуточный слой для обнаружения распространенных ошибок, вроде мутирования состояния или использования несериализуемых значений

Простейшим способом создания и настройки хранилища является передача в `configureStore()` корневого редуктора в качестве аргумента `reducer`:

```js
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducers'

const store = configureStore({
  reducer: rootReducer
})

export default store
```

Также допускается передавать объект с частичными редукторами, в этом случае `configureStore()` автоматически вызывает `combineReducers()`:

```js
import usersReducer from './usersReducer'
import postsReducer from './postsReducer'

const store = configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer
  }
})
```

*Обратите внимание*, что это работает только для одного уровня вложенности. Если требуются вложенные редукторы, придется вызывать `combineReducers()` самостоятельно.

Для кастомизации настройки хранилища, можно передать дополнительные опции. Вот пример "горячей" перезагрузки:

```js
import { configureStore } from '@reduxjs/toolkit'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(loggerMiddleware),
    preloadedState,
    enhancers: [monitorReducersEnhancer]
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

## Создание редукторов

Редукторы - это самая важная часть `Redux`. Как правило, редуктор отвечает за:

- Определение характера ответа на основе поля `type` объекта операции
- Обновление состояния посредством копирования части состояния и модификации этой копии

Хотя в редукторе можно использовать любую условную логику, наиболее распространенным и простым способом является использование инструкции `switch`. Однако, многим не нравится `switch`. В документации по `Redux` приводится пример <a href="https://redux.js.org/recipes/reducing-boilerplate#generating-reducers">создания функции, выступающей в роли поисковой таблицы на основе типов операции</a>.

Другой проблемой, возникающей при написании редукторов, является необходимость "иммутабельного" обновления состояния. JavaScript - это язык, допускающий мутации, <a href="https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns">ручное обновление вложенных структур</a> - задача не из простых, легко допустить ошибку.

### Упрощение создания редукторов с помощью `createReducer()`

Функция `createReducer()` похожа на функцию создания поисковой таблицы из документации по `Redux`. В ней используется библиотека `immer`, что позволяет писать "мутирующий" код, обновляющий состояние иммутабельно. Это защищает от непреднамеренного мутирования состояния в редукторе.

Любой редуктор, в котором используется инструкция `switch`, может быть преобразован с помощью `createReducer()`. Каждый `case` становится ключом объекта, передаваемого в `createReducer()`. Иммутабельные обновления, такие как распаковка объектов или копирование массивов, могут быть преобразованы в "мутации". Но это не обязательно: можно оставить все как есть.

Ниже приводится пример использования `createReducer()`. Начнем с типичного редуктора для списка задач, в котором используется инструкция `switch` и иммутабельные обновления:

```js
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO': {
      return state.concat(action.payload)
    }
    case 'TOGGLE_TODO': {
      const { index } = action.payload
      return state.map((todo, i) => {
        if (i !== index) return todo

        return {
          ...todo,
          completed: !todo.completed
        }
      })
    }
    case 'REMOVE_TODO': {
      return state.filter((todo, i) => i !== action.payload.index)
    }
    default:
      return state
  }
}
```

*Обратите внимание*, что мы вызываем `state.concat()` для получения копии массива с новой задачей, `state.map()` также для получения копии массива, и используем оператор `spread` для создания копии задачи, подлежащей обновлению.

С помощью `createReducer()` мы можем сократить приведенный пример следующим образом:

```js
const todosReducer = createReducer([], builder => {
  builder
    .addCase('ADD_TODO', (state, action) => {
      // "мутируем" массив, вызывая push()
      state.push(action.payload)
    })
    .addCase('TOGGLE_TODO', (state, action) => {
      const todo = state[action.payload.index]
      // "мутируем" объект, перезаписывая его поле `completed`
      todo.completed = !todo.completed
    })
    .addCase('REMOVE_TODO', (state,action) => {
      // мы по-прежнему можем использовать иммутабельную логику обновления состояния
      return state.filter((todo,i) => i !== action.payload.index)
    })
})
```

Возможность "мутировать" состояние особенно полезна при необходимости обновления глубоко вложенных свойств. Например, такой код:

```js
case 'UPDATE_VALUE':
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
```

Можно упростить так:

```js
updateValue(state, action) {
  const { someId, someValue } = action.payload
  state.first.second[someId].fourth = someValue
}
```

Гораздо лучше!

Функция `createReducer()` может быть очень полезной, но следует помнить о том, что:

- "Мутирующий" код правильно работает только внутри `createReducer()`
- `Immer` не позволяет смешивать "мутирование" черновика (`draft`) состояния и возвращение нового состояния

## Определение создателей операции (action creators)

`Redux` рекомендует использовать "создателей операции" для инкапсуляции процесса создания объектов операции. Это не является обязательным.

Большинство создателей операции очень простые. Они принимают некоторые параметры и возвращают объект операции с определенным полем `type` и параметрами, необходимыми для выполнения операции. Данные параметры, обычно, помещаются в поле `payload`. Типичный создатель операции выглядит так:

```js
function addTodo(text) {
  return {
    type: 'ADD_TODO',
    payload: {text}
  }
}
```

### Определение создателей операции с помощью `createAction()`

Написание создателей операции вручную может быть утомительным. `Redux Toolkit` предоставляет функцию `createAction()`, которая генерирует создателя операции с указанным типом операции и преобразует переданные аргументы в поле `payload`:

```js
const addTodo = createAction('ADD_TODO')
addTodo({ text: 'Buy milk' })
// { type : "ADD_TODO", payload : {text : "Buy milk"}} )
```

`createAction()` также принимает аргумент-колбек `prepare`, позволяющий кастомизировать результирующее поле `payload` и добавлять поле `meta`, при необходимости.

### Использование создателей в качестве типов операции (action types)

Для определения того, как должно быть обновлено состояние, редукторы полагаются на тип операции. Обычно, это делается посредством раздельного определения типов и создателей операции. `createAction()` позволяет упростить данный процесс.

Во-первых, `createAction()` перезаписывает метод `toString()` генерируемых создателей. Это означает, что создатель может использовать в качестве ссылки на "тип операции", например, в ключах, передаваемых в `builder.addCase()` или объектной нотации `createReducer()`.

Во-вторых, тип операции также определяется как поле `type` создателя.

```js
const actionCreator = createAction('SOME_ACTION_TYPE')

console.log(actionCreator.toString())
// SOME_ACTION_TYPE

console.log(actionCreator.type)
// SOME_ACTION_TYPE

const reducer = createReducer({}, builder => {
  // Здесь будет автоматически вызван `actionCreator.toString()`
  // Кроме того, при использовании TypeScript, будет правильно предложен (предположен) тип операции
  builder.addCase(actionCreator, (state, action) => {})

  // Или вы можете указать поле `type`
  // В этому случае, при использовании TypeScript, тип операции предложен не будет
  builder.addCase(actionCreator.type, (state, action) => {})
})
```

Это означает, что нам не нужно создавать отдельную переменную для типа операции или дублировать название и значение типа, например: `const SOME_ACTION_TYPE = 'SOME_ACTION_TYPE'`.

К сожалению, неявного приведения к строке не происходит в инструкции `switch`. Приходится делать это вручную:

```js
const actionCreator = createAction('SOME_ACTION_TYPE')

const reducer = (state = {}, action) => {
  switch (action.type) {
    // ошибка
    case actionCreator: {
      break
    }
    // правильно
    case actionCreator.toString(): {
      break
    }
    // так тоже работает
    case actionCreator.type: {
      break
    }
  }
}
```

При использовании `Redux Toolkit` с `TypeScript`, принимайте во внимание, что компилятор `TypeScript` может не осуществлять неявного преобразования в строку, когда создатель используется как ключ объекта. В этом случае также может потребоваться прямое указание типа создателя (`actionCreator as string`) или использование поля `type` в качестве ключа объекта.

## Создание частей состояния (slices of state)

В `Redux` состояние, обычно, делится на "части", определяемые редукторами, передаваемыми в `combineReducers()`:

```js
import { combineReducers } from 'redux'
import usersReducer from './usersReducer'
import postsReducer from './postsReducer'

const rootReducer = combineReducers({
  users: usersReducer,
  posts: postsReducer
})
```

В приведенном примере `users` и `posts` являются "частями". Оба редуктора:

- "Владеют" частью состояния, включая его начальное значение
- Определяют, как состояние обновляется
- Определяют, какие операции приводят к обновлению состояния

Общий подход состоит в определении частичного редуктора в одном файле, а создателей - в другом. Поскольку и редуктор, и создатели используют одни и те же типы операции, эти типы, как правило, определяются в третьем файле и импортируются в другие файлы:

```js
// postsConstants.js
const CREATE_POST = 'CREATE_POST'
const UPDATE_POST = 'UPDATE_POST'
const DELETE_POST = 'DELETE_POST'

// postsActions.js
import { CREATE_POST, UPDATE_POST, DELETE_POST } from './postsConstants'

export const addPost = (id, title) => ({
  type: CREATE_POST,
  payload: { id, title }
})

// postsReducer.js
import { CREATE_POST, UPDATE_POST, DELETE_POST } from './postsConstants'

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POST: {
      // реализация
    }
    default:
      return state
  }
}
```

Единственная по-настоящему полезная часть - это редуктор. Что касается других частей, то:

- Мы могли бы указывать типы операции как строки в обоих местах
- Создатели - полезная штука, но они не являются обязательными - компонент может "пропустить" аргумент `mapDispatch` в `connect()` и просто вызвать `props.dispatch({ type: 'CREATE_POST', payload: { id: 123, title: 'Привет, народ!' } })`
- Единственная причина создания нескольких файлов заключается в практике разделения кода по принципу того, что он делает

<a href="https://github.com/erikras/ducks-modular-redux">"Утиная" структура файла</a> предлагает размещать логику, связанную с `Redux`, для определенной части в одном файле:

```js
// postsDuck.js
const CREATE_POST = 'CREATE_POST'
const UPDATE_POST = 'UPDATE_POST'
const DELETE_POST = 'DELETE_POST'

export const addPost = (id, title) => ({
  type: CREATE_POST,
  payload: { id, title }
})

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POST: {
      // реализация
      break
    }
    default:
      return state
  }
}
```

Это облегчает задачу, но нам по-прежнему приходится вручную писать типы и создателей операции.

### Определение функций в объектах

В современном JS существует несколько способов определения ключей и функций в объекте:

```js
const keyName = 'ADD_TODO4'

const reducerObject = {
  // название ключа в кавычках, стрелочная функция для редуктора
  'ADD_TODO1': (state, action) => {}

  // ключ без кавычек, ключевое слово "function"
  ADD_TODO2: function(state, action) {}

  // сокращенный вариант
  ADD_TODO3(state,action) {}

  // вычисляемое свойство
  [keyName]: (state, action) => {}
}
```

### Упрощение создания частей состояния с помощью `createSlice()`

`createSlice()` автоматически генерирует типы и создателей операции на основе переданного названия редуктора:

```js
const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    createPost(state, action) {},
    updatePost(state, action) {},
    deletePost(state, action) {}
  }
})

console.log(postsSlice)
/*
{
  name: 'posts',
  actions : {
      createPost,
      updatePost,
      deletePost,
  },
  reducer
}
*/

const { createPost } = postsSlice.actions

console.log(createPost({ id: 123, title: 'Привет, народ!' }))
// { type : 'posts/createPost', payload : { id : 123, title : 'Привет, народ!' } }
```

`createSlice()` анализирует функции, определенные в поле `reducers`, создает редуктор для каждого случая и генерирует создателя, использующего название редуктора в качестве типа операции. Таким образом, редуктор `createPost` становится типом операции `posts/createPost`, а создатель `createPost()` возвращает операцию с этим типом.

### Экспорт и использование частей

Обычно, мы определяем часть и экспортируем создателей и редукторы:

```js
const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    createPost(state, action) {},
    updatePost(state, action) {},
    deletePost(state, action) {}
  }
})

// Извлекаем объект с создателями и редуктор
const { actions, reducer } = postsSlice
// Извлекаем и экспортируем каждого создателя по названию
export const { createPost, updatePost, deletePost } = actions
// Экпортируем редуктор по умолчанию или по названию
export default reducer
```

## Асинхронная логика и получение данных

### Использование посредника для работы с асинхронным кодом

Хранилище `Redux` ничего не знает об асинхронной логике. Оно знает только о том, как синхронно отправлять операции, обновлять состояние посредством вызова корневого редуктора и уведомлять UI об изменениях. Любые асинхронные операции должны выполняться за пределами хранилища.

Но что если нам нужна асинхронная логика, которая взаимодействует с хранилищем, отправляя операции или проверяя текущее состояние хранилища? Здесь в игру вступают посредники. Они расширяют хранилище, позволяя делать следующее:

- Выполнять дополнительную логику при отправке операции (например, выводить информацию об операции и состоянии)
- Приостанавливать, модифицировать, задерживать выполнение или полностью останавливать отправку операции
- Писать дополнительный код, имеющий доступ к `dispatch()` и `getState()`
- "Обучать" `dispatch()` принимать значения, отсутствующие в объектах операции, такие как функции и промисы, перехватывая их и отправляя "настоящие" объекты операции

Ниболее частым случаем использования посредников является обеспечение взаимодействия асинхронной логики с хранилищем. Это позволяет писать код, отправляющий операции и проверяющий хранилище, сохраняя данную логику независимой от UI.

Существует несколько посредников для реализации асинхронности в `Redux`. Рекомендуемым является <a href="https://github.com/reduxjs/redux-thunk">`Redux Thunk`</a>. Он прекрасно подходит для большинства случаев, а использование синтаксиса `async/await` делает его еще лучше.

`configureStore()` устанавливает `thunk` автоматически.

### Определение асинхронной логики в частях

Преобразователи не могут быть определены в `createSlice()`. Их нужно писать отдельно от логики редуктора.

Преобразователи, как правило, отпрвляют обычные операции, такие как `dispatch(dataLoaded(response.data))`.

Многие `Redux`-приложения структурируются по принципу "директория-тип". В такой структуре преобразователи, обычно, определяются в файле "actions", отдельно от обычных создателей.

Поскольку у нас таких файлов нет, имеет смысл определять преобразователей прямо в файлах "slice":

```js
// Сначала, мы определяем редуктор и создателей с помощью `createSlice()`
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    loading: 'idle',
    users: []
  },
  reducers: {
    usersLoading(state, action) {
      // Используем подход "state machine" для состояния загрузки вместо логических значений
      if (state.loading === 'idle') {
        state.loading = 'pending'
      }
    },
    usersReceived(state, action) {
      if (state.loading === 'pending') {
        state.loading = 'idle'
        state.users = action.payload
      }
    }
  }
})

// Деструктурируем и экспортируем обычных создателей
export const { usersLoading, usersReceived } = usersSlice.actions

// Определяем `thunk`, отправляющего создателей
const fetchUsers = () => async dispatch => {
  dispatch(usersLoading())
  const response = await usersAPI.fetchAll()
  dispatch(usersReceived(response.data))
}
```

### Шаблоны получения данных в `Redux`

Логика получения данных в `Redux`, обычно, следует такому шаблону:

- Перед запросом в качестве индикатора его выполнения отправляется операция "start". Это может использоваться для отслеживания состояния загрузки во избежание дублирования запросов или для отображения индикаторов загрузки в UI
- Выполнение асинхронного запроса
- В зависимости от результата запроса, отправляется либо операция "success" с данными, либо операция "failure" с ошибкой. В обоих случаях редуктор очищает состояние загрузки и либо обрабатывает данные либо сохраняет ошибку для ее потенциального отображения

Стандартная реализация может выглядеть следующим образом:

```js
const getRepoDetailsStarted = () => ({
  type: "repoDetails/fetchStarted"
})
const getRepoDetailsSuccess = (repoDetails) => {
  type: "repoDetails/fetchSucceeded",
  payload: repoDetails
}
const getRepoDetailsFailed = (error) => {
  type: "repoDetails/fetchFailed",
  error
}
const fetchIssuesCount = (org, repo) => async dispatch => {
  dispatch(getRepoDetailsStarted())
  try {
    const repoDetails = await getRepoDetails(org, repo)
    dispatch(getRepoDetailsSuccess(repoDetails))
  } catch (err) {
    dispatch(getRepoDetailsFailed(err.toString()))
  }
}
```

Написание кода указанным способом может быть утомительным. Каждый тип запроса требует повторения одинаковой реализации:

- Уникальные типы операции должны быть определены для трех разных случаев
- Каждый их этих типов, обычно, имеет соответствующего создателя
- Преобразователь должен отправлять правильные операции в правильном порядке

`createAsyncThunk()` абстрагирует данный паттерн, генерируя типы, создателей операции и преобразователя, отправляющего эти операции.

### Выполнение асинхронных запросов с помощью `createAsyncThunk()`

`createAsyncThunk()` упрощает процесс выполнения асинхронных запросов - мы передаем ему строку для префикса типа операции и колбек создателя полезной нагрузки (payload), выполняющего реальную асинхронную логику и возвращающего промис с результатом. `createAsyncThunk()` возвращает преобразователя, который заботится об отправке правильных операций на основе возвращенного промиса, и типы операции, которые можно обработать в редукторах:

```js
import { createAsyncThunk, createSlice } from '@redux/toolkit'
import { userAPI } from './userAPI'

// Создаем преобразователя
const fetchUserById = createAsyncThunk(
  'user/fetchByIdStatus',
  async (userId, thunkAPI) => {
    const response = await userAPI.fetchById(userId)
    return response.data
  }
)

// Обрабатываем операции в редукторах
const usersSlice = createSlice({
  name: 'users',
  initialState: {entries: [], loading: 'idle'},
  reducers: {
    // стандартная логика редуктора с авто-генерируемыми типами операции для каждого редуктора
  },
  extraReducers: {
    [fetchUserById.fullfilled]: (state, action) => {
      // Добавляем пользователя в массив состояния
      state.entries.push(action.payload)
    }
  }
})

// Позже, отправляем `thunk`
dispatch(fetchUserById(123))
```

Создатель операции преобразователя принимает единственный аргумент, который он передает в качестве первого аргумента в колбек создателя полезной нагрузки.

Последний также принимает объект `thunkAPI`, содержащий параметры, которые передаются стандартному `thunk`, а также авто-генерируемый уникальный идентификатор запроса и объект `AbortController.signal`:

```js
ThunkAPI {
  dispatch: func
  getState: func
  extra?: any
  requestId: string
  signal: AbortSignal
}
```

## Управление нормализованными данными

Большинство приложений имеют дело с глубоко вложенными и связанными между собой данными. Цель нормализации данных состоит в эффективной организации данных состояния. Как правило, это реализуется посредством создания коллекции объектов с `id` в качестве ключей и отсортированного массива этих ключей.

### Ручная нормализация

Нормализация данных не требует использования специальной библиотеки. Ниже приводится пример ручной нормализации ответа от API `fetchAll`, возвращающего данные в виде `{ users: [{id: 1, first_name: 'normalized', last_name: 'person'}] }`:

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userAPI from './userAPI'

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const response = await userAPI.fetchAll()
  return response.data
})

export const slice = createSlice({
  name: 'users',
  initialState: {
    ids: [],
    entities: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      // преобразуем (reduce) коллекцию по свойству `id` в форму { 1: { ...user }}
      const byId = action.payload.users.reduce((byId, user) => {
        byId[user.id] = user
        return byId
      }, {})
      state.entities = byId
      state.ids = Object.keys(byId)
    })
  }
})
```

### Нормализация с помощью `normalizr`

`normalizr` - это популярная библиотека для нормализации данных. Она очень часто используется с `Redux`. Типичным случаем ее использования является форматирование ответа от API и последующая обработка данных в редукторах:

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { normalize, schema } from 'normalizr'

import userAPI from './userAPI'

const userEntity = new schema.Entity('users')

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const response = await userAPI.fetchAll()
  // Нормализация данных до их передачи в редуктор
  const normalized = normalize(response.data, [userEntity])
  return normalized.entities
})

export const slice = createSlice({
  name: 'users',
  initialState: {
    ids: [],
    entities: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.entities = action.payload.users
      state.ids = Object.keys(action.payload.users)
    })
  }
})
```

### Нормализация с помощью `createEntityAdapter()`

`createEntityAdapter()` предоставляет стандартизированный способ хранения данных путем преобразования коллекции в форму `{ ids: [], entities: {} }`. Кроме предопределения формы состояния, эта функция генерирует набор редукторов и селекторов, которые знают, как работать с такими данными.

```js
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit'
import userAPI from './userAPI'

export const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const response = await userAPI.fetchAll()
  // В данном случае `response.data` будет выглядеть так:
  // [{id: 1, first_name: 'Example', last_name: 'User'}]
  return response.data
})

export const updateUser = createAsyncThunk('users/updateOne', async arg => {
  const response = await userAPI.updateUser(arg)
  // В данном случае `response.data` будет выглядеть так:
  // { id: 1, first_name: 'Example', last_name: 'UpdatedLastName'}
  return response.data
})

export const usersAdapter = createEntityAdapter()

// По умолчанию `createEntityAdapter()` возвращает `{ ids: [], entities: {} }`
// Для отслеживания 'loading' или других ключей, их необходимо инициализировать:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = usersAdapter.getInitialState()

export const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    removeUser: usersAdapter.removeOne
  },
  extraReducers: builder => {
    builder.addCase(fetchUsers.fulfilled, usersAdapter.upsertMany)
    builder.addCase(updateUser.fulfilled, (state, { payload }) => {
      const { id, ...changes } = payload
      usersAdapter.updateOne(state, { id, changes })
    })
  }
})

const reducer = slice.reducer
export default reducer

export const { removeUser } = slice.actions
```

### Использование `createEntityAdapter()` совместно с библиотеками для нормализации

По умолчанию методы `setAll()`, `addMany()` и `upsertMany()` ожидают получения массива сущностей (entities). Тем не менее, они также позволяют передавать объекты формы `{ 1: { id: 1, ... }}`, что облегчает добавление предварительно нормализованных данных.

```js
// features/articles/articlesSlice.js
import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector
} from '@reduxjs/toolkit'
import fakeAPI from '../../services/fakeAPI'
import { normalize, schema } from 'normalizr'

// Определяем схемы сущностей `normalizr`
export const userEntity = new schema.Entity('users')
export const commentEntity = new schema.Entity('comments', {
  commenter: userEntity
})
export const articleEntity = new schema.Entity('articles', {
  author: userEntity,
  comments: [commentEntity]
})

const articlesAdapter = createEntityAdapter()

export const fetchArticle = createAsyncThunk(
  'articles/fetchArticle',
  async id => {
    const data = await fakeAPI.articles.show(id)
    // Нормализуем данные, чтобы редуктор мог загрузить предсказуемую нагрузку, например:
    // `action.payload = { users: {}, articles: {}, comments: {} }`
    const normalized = normalize(data, articleEntity)
    return normalized.entities
  }
)

export const slice = createSlice({
  name: 'articles',
  initialState: articlesAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [fetchArticle.fulfilled]: (state, action) => {
      // Обрабатываем результат запроса, добавляя статьи
      articlesAdapter.upsertMany(state, action.payload.articles)
    }
  }
})

const reducer = slice.reducer
export default reducer

// features/users/usersSlice.js

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { fetchArticle } from '../articles/articlesSlice'

const usersAdapter = createEntityAdapter()

export const slice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchArticle.fulfilled, (state, action) => {
      // И обрабатываем тот же результат запроса, добавляя пользователей
      usersAdapter.upsertMany(state, action.payload.users)
    })
  }
})

const reducer = slice.reducer
export default reducer

// features/comments/commentsSlice.js

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { fetchArticle } from '../articles/articlesSlice'

const commentsAdapter = createEntityAdapter()

export const slice = createSlice({
  name: 'comments',
  initialState: commentsAdapter.getInitialState(),
  reducers: {},
  extraReducers: {
    [fetchArticle.fulfilled]: (state, action) => {
      // Тоже самое для комментариев
      commentsAdapter.upsertMany(state, action.payload.comments)
    }
  }
})

const reducer = slice.reducer
export default reducer
```

### Использование селекторов с `createEntityAdapter()`

Адаптер сущностей предоставляет фабрику селекторов, генерирующую наиболее востребованные селекторы. Мы можем создать селекторы для `usersSlice` из приведенного выше примера следующим образом:

```js
// Переименовываем экспорты для повышения читаемости при их использовании в компонентах
export const {
  selectById: selectUserById,
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectAllUsers,
  selectTotal: selectTotalUsers
} = usersAdapter.getSelectors(state => state.users)
```

Пример использования селекторов в компоненте:

```js
import React from 'react'
import { useSelector } from 'react-redux'
import { selectTotalUsers, selectAllUsers } from './usersSlice'

import styles from './UsersList.module.css'

export function UsersList() {
  const count = useSelector(selectTotalUsers)
  const users = useSelector(selectAllUsers)

  return (
    <div>
      <div className={styles.row}>
        Количество пользователей: <span className={styles.value}>{count}</span>.{' '}
        {count === 0 && `Почему бы не запросить больше?`}
      </div>
      {users.map(user => (
        <div key={user.id}>
          <div>{`${user.first_name} ${user.last_name}`}</div>
        </div>
      ))}
    </div>
  )
}
```

### Определение альтернативных полей `id`

По умолчанию `createEntityAdapter()` предполагает, что данные имеют уникальные идентификаторы в поле `entity.id`. Если данные хранят идентификаторы в другом поле, можно передать аргумент `selectId`, возвращающий соответствующее поле:

```js
// В данном случае основным ключом пользовательских данных является `idx`
const userData = {
  users: [
    { idx: 1, first_name: 'Test' },
    { idx: 2, first_name: 'Two' }
  ]
}

// Поскольку основным ключом является `idx`, а не `id`,
// передаем `selectId` для получения этого поля
export const usersAdapter = createEntityAdapter({
  selectId: user => user.idx
})
```

### Сортировка сущностей

`createEntityAdapter()` предоставляет аргумент `sortComparer`, который можно использовать для сортировки коллекции `id`. Это может быть полезным в случае, когда мы хотим обеспечить правильный порядок сортировки и наши данные приходят неотсортированными.

```js
const userData = {
  users: [
    { id: 1, first_name: 'Test' },
    { id: 2, first_name: 'Altera' }
  ]
}

// Сортируем по `first_name`. `state.ids` будут упорядочены как
// `ids: [ 2, 1 ]`, поскольку 'A' находится перед 'T'.
// При использовании селектора `selectAll()`, результат будет выглядеть так:
// [{ id: 2, first_name: 'Altera' }, { id: 1, first_name: 'Test' }]
export const usersAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.first_name.localeCompare(b.first_name)
})
```

# Основные части API

## Настройка хранилища

## configureStore

Абстракция над стандартной функцией `createStore()`, добавляющая полезные "дефолтные" настройки хранилища для лучшего опыта разработки.

### Параметры

`cofigureStore()` принимает следующий объект:

```js
{
  /**
   * Функция редуктора, используемая в качестве корневого редуктора,
   * или объект с частичными редукторами, автоматически передаваемыми в `combineReducers()`
  */
  reducer: func | object,

  /**
   * Массив посредников, автоматически передаваемых в `applyMiddleware()`,
   * или набор дефолтных посредников, возвращаемый `getDefaultMiddleware()`
  */
  middleware?: array,

  /**
    * Интеграция с инструментами разработчика `Redux`
    *
    * Допускается дополнительная настройка
  */
  devTools?: bool | object,

  /**
   * Начальное состояние, аналогичное начальному состоянию `createStore()`.
   * Это можно использовать для гидратации состояния,
   * полученного от сервера в универсальных приложениях,
   * или для восстановления ранее сериализованной сессии пользователя.
   * При использовании `combineReducers()` для получения корневого редуктора,
   * `preloadedState` должен быть объектом аналогичной формы (с такими же ключами, что и редуктор)
  */
  preloadedState?: any,

  /**
   * Массив усилителей хранилища, автоматически передаваемых в `compose()`.
   * Все усилители будут включены до расширения `DevTools`.
   * Если вам требуется кастомизировать порядок усилителей,
   * используйте функцию обратного вызова, получающую оригинальный массив (например, `[applyMiddleware]`),
   * и возвращающую новый массив (например, `[applyMiddleware, offline]`)
   * Для добавления посредника можно использовать параметр `middleware`
  */
  enhancers?: array | func
}
```

### Примеры использования

*Основной*

```js
import { createStore } from '@reduxjs/toolkit'

import rootReducer from './reducers'

const store = configureStore({ reducer: rootReducer })
// В хранилище автоматически добавляется `redux-thunk` и расширение `Redux DevTools`
```

*Полный*

```js
import { configureStore } from '@reduxjs/toolkit'

// Мы используем `redux-logger` для примера добавления дополнительного посредника
import logger from 'redux-logger'

// и `redux-batch` для примера добавления дополнительного усилителя
import { reduxBatch } from '@manaflair/redux-batch'

import todosReducer from './todos/todosReducer'
import visibilityReducer from './visibility/visibilityReducer'

const reducer = {
  todos: todosReducer,
  visibility: visibilityReducer
}

const preloadedState = {
  todos: [
    {
      text: 'Eat food',
      completed: true
    },
    {
      text: 'Exercise',
      completed: false
    }
  ],
  visibilityFilter: 'SHOW_COMPLETED'
}

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== production,
  preloadedState,
  enhancers: [reduxBatch]
})
/**
 * Хранилище будет иметь такие настройки:
 * - частичные редукторы будут переданы в `combineReducers()`
 * - `redux-thunk` и `redux-logger` будут добавлены в качестве посредников
 * - инструменты разработчика будут отключены в производственном режиме
 * - будет создана композиция из посредников, усилителя и инструментов разработчика
*/
```

## getDefaultMiddleware

Возвращает список дефолтных посредников.

### Случаи использования

По умолчанию `configureStore()` добавляет некоторых посредников автоматически:

```js
const store = configureStore({
  reducer: rootReducer
})

// В хранилище были добавлены дефолтные посредники, поскольку список посредников не был кастомизирован
```

Для кастомизации списка посредников можно передать массив в `configureStore()`:

```js
const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, logger]
})

// В хранилище были добавлены только указанные посредники
```

*Обратите внимание*, при кастомизации списка в хранилище будут добавлены только указанные посредники.

Для добавления посредников в дополнение к "дефолтным" следует использовать `getDefaultMiddleware()`.

```js
import { configureStore } from '@reduxjs/toolkit'

import logger from 'redux-logger'

import rootReducer from './reducer'

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})

// В хранилище были добавлены дефолтные посредники + `logger`
```

### Посредники по умолчанию

*Режим разработки*

- `immutableStateInvariant` - осуществляет глубокое сравнение значений состояния для обнаружения мутаций (прямых изменений значений состояния)
- `serializableStateInvariant` - осуществляет глубокую проверку дерева состояния и операций для обнаружения несериализуемых значений, таких как функции, промисы, символы и т.д.
- `thunk` - позволяет запускать побочные эффекты, такие как выполнение асинхронных запросов

*Производственный режим*

- `thunk`

### Кастомизация дефолтных посредников

`getDefaultMiddleware()` принимает объект, позволяющий кастомизировать каждого посредника двумя способами:

- Исключение из результирующего массива путем передачи `false` для соответствующего поля
- Настройка путем передачи объекта

В следующем примере мы отключаем посредника, отвечающего за обнаружение несериализуемых значений, и передаем значение для "дополнительного аргумента" (extra argument) преобразователя:

```js
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'
import { myCustomApiService } from './api'

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: myCustomApiService,
      },
      serializableCheck: false,
    })
})
```

# Редукторы и операции

## createReducer

### Обзор

`createReducer()` - это утилита, упрощающая создание редукторов. Благодаря использованию библиотеки `immer`, она позволяет напрямую "мутировать" состояние. Также она поддерживает преобразование типов операции в соответствующие редукторы, которые обновляют состояние при отправке этих типов.

Редукторы часто реализуются с помощью инструкции `switch` с одним `case` для каждого типа операции:

```js
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, value: state.value + 1 }
    case 'decrement':
      return { ...state, value: state.value - 1 }
    case 'incrementByAmount':
      return { ...state, value: state.value + action.payload }
    default:
      return state
  }
}
```

Много шаблонного кода, подверженного ошибкам. Например, легко забыть указать `default` или начальное состояние.

`createReducer()` предлагает две формы создания редукторов: нотация "колбека строителя" ("builder callback" notaion) и нотация "объекта коллекции" ("map object" notation). Названные подходы являются эквивалентными, рекомендуется использовать первый вариант.

Создание редуктора с помощью `createReducer()` выглядит так:

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const increment = createAction('counter/increment')
const decrement = createAction('counter/decrement')
const incrementByAmount = createAction('counter/incrementByAmount')

const initialState = { value: 0 }

const counterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(increment, (state, action) => {
      state.value++
    })
    .addCase(decrement, (state, action) => {
      state.value--
    })
    .addCase(incrementByAmount, (state, action) => {
      state.value += action.payload
    })
})
```

### Нотация "builder callback"

В данном случае `createReducer()` принимает функцию обратного вызова, получающую объект `builder` в качестве аргумента. "Строитель" предоставляет методы `addCase()`, `addMatcher()` и `addDefaultCase()`, которые могут вызываться для определения действий, выполняемых редуктором.

#### Параметры

- `initialState` - начальное состояние, используемое при первом вызове редуктора
- `builderCallback` - колбек, принимающий объект `builder` для определения редуктора случая путем `builder.addCase(actionCreatorOrType, reducer)`

#### Пример использования

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const increment = createAction('increment')
const decrement = createAction('decrement')

function isActionWithNumberPayload(action) {
  return typeof action.payload === 'number'
}

createReducer(
  {
    counter: 0,
    sumOfNumberPayloads: 0,
    unhandledActions: 0,
  },
  (builder) => {
    builder
      .addCase(increment, (state, action) => {
        state.counter += action.payload
      })
      // Можно создавать цепочки из вызовов `addCase`
      // или каждый раз писать `builder.addCase()`
      .addCase(decrement, (state, action) => {
        state.counter -= action.payload
      })
      // Можно использовать "функцию поиска совпадений" для входящих операций
      .addMatcher(isActionWithNumberPayload, (state, action) => {})
      // и указывать случай по умолчанию, если ни один из обработчиков не сработал
      .addDefaultCase((state, action) => {})
  }
)
```

#### Методы "строителя"

- `addCase()` - добавляет редуктора случая для определенного типа операции. Вызов данного метода должен предшествовать вызову любого `addMatcher()` или `addDefaultCase()`. Параметры:
  - `actionCreator` - тип или создатель операции, сгенерированный с помощью `createAction()`, который может использоваться для определения типа операции
  - `reducer` - логика редуктора для указанного случая
- `addMacther()` - позволяет осуществлять проверку входящей операции с помощью собственных фильтров в дополнение к проверке типа. При регистрации нескольких совпадений, соответствующие функции выполняются в порядке определения. Вызовы `addMacther()` должны следовать после вызовов `addCase()`, но перед вызовами `addDefaultCase()`. Параметры:
  - `matcher` - функция поиска совпадений
  - `reducer` - логика редуктора для указанного случая

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const initialState = {}
const resetAction = createAction('reset-tracked-loading-state')

function isPendingAction(action) {
  return action.type.endsWith('/pending')
}

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetAction, () => initialState)
    // `matcher` может быть определен снаружи как функция предиката типа (type predicate function)
    .addMatcher(isPendingAction, (state, action) => {
      state[action.meta.requestId] = 'pending'
    })
    .addMatcher(
      // `matcher` может быть определен внутри как функция предиката типа
      (action) => action.type.endsWith('/rejected'),
      (state, action) => {
        state[action.meta.requestId] = 'rejected'
      }
    )
    // `matcher` может просто возвращать логическое значение и получать общий аргумент (generic argument)
    .addMatcher(
      (action) => action.type.endsWith('/fulfilled'),
      (state, action) => {
        state[action.meta.requestId] = 'fulfilled'
      }
    )
})
```

- `addDefaultCase()` - добавляет дефолтный случай, когда для операции не были выполнены другие редукторы. Параметры:
  - `reducer` - логика редуктора для случая по умолчанию

```js
import { createReducer } from '@reduxjs/toolkit'
const initialState = { otherActions: 0 }
const reducer = createReducer(initialState, (builder) => {
  builder
    // .addCase(...)
    // .addMatcher(...)
    .addDefaultCase((state, action) => {
      state.otherActions++
    })
})
```

### Нотация "map object"

В данном случае `createReducer()` принимает объект, в котором ключи являются типами операции, а значения - функциями для обработки этих типов.

#### Параметры

- `initialState` - начальное состояние, используемое при первом вызове редуктора
- `actionsMap` - объект, связывающий типы операции с соответствующими редукторами, каждый из которых обрабатывает определенный тип
- `actionMatchers` - массив определений `matcher` в форме `{matcher, reducer}`. Все совпадения обрабатываются последовательно, независимо от совпадения с редуктором случая
- `defaultCaseReducer` - дефолтный редуктор

#### Пример использования

```js
const counterReducer = createReducer(0, {
  increment: (state, action) => state + action.payload,
  decrement: (state, action) => state - action.payload
})
```

Создатели операции, сгенерированные с помощью `createAction()`, могут использоваться в качестве ключей с помощью синтаксиса вычисляемых свойств:

```js
const increment = createAction('increment')
const decrement = createAction('decrement')

const counterReducer = createReducer(0, {
  [increment]: (state, action) => state + action.payload,
  [decrement.type]: (state, action) => state - action.payload
})
```

#### Поиск совпадений и дефолтный случай

```js
const isStringPayloadAction = action => typeof action.payload === 'string'

const lengthOfAllStringsReducer = createReducer(
  // начальное состояние
  { strLen: 0, nonStringActions: 0 },
  // редукторы случая
  {
    /*...*/
  },
  // массив редукторов совпадения
  [
    {
      matcher: isStringPayloadAction,
      reducer(state, action) {
        state.strLen += action.payload.length
      }
    }
  ],
  // дефолтный редуктор
  state => {
    state.nonStringActions++
  }
)
```

### Прямое изменение состояния

`Redux` требует, чтобы редукторы были чистыми функциями, а значения состояния - иммутабельными. Несмотря на то, что это обеспечивает предсказуемость и отслеживаемость обновлений состояния, порой это делает реализацию таких обновлений неудобной. Рассмотрим следующий пример:

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const addTodo = createAction('todos/add')
const toggleTodo = createAction('todos/toggle')

const todosReducer = createReducer([], (builder) => {
  builder
    .addCase(addTodo, (state, action) => {
      const todo = action.payload
      return [...state, todo]
    })
    .addCase(toggleTodo, (state, action) => {
      const index = action.payload
      const todo = state[index]
      return [
        ...state.slice(0, index),
        { ...todo, completed: !todo.completed },
        ...state.slice(index + 1),
      ]
    })
})
```

`createReducer()` использует `immer`, библиотеку, позволяющую изменять состояние напрямую. В действительности, редуктор получает проксированное состояние, преобразующее все мутации в эквивалентные операции копирования.

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const addTodo = createAction('todos/add')
const toggleTodo = createAction('todos/toggle')

const todosReducer = createReducer([], (builder) => {
  builder
    .addCase(addTodo, (state, action) => {
      // Операция `push()` преобразуется в создание расширенного массива
      // из предыдущего примера
      const todo = action.payload
      state.push(todo)
    })
    .addCase(toggleTodo, (state, action) => {
      // Данная версия редуктора выглядит намного лучше
      // "чистого" аналога
      const index = action.payload
      const todo = state[index]
      todo.completed = !todo.completed
    })
})
```

Использование `immer` накладывает некоторые ограничения, наиболее важным из которых является то, что мы не должны одновременно мутировать состояние и возвращать новое состояние. Например, следующий редуктор выбросит исключение при передаче операции `toggleTodo`:

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const toggleTodo = createAction('todos/toggle')

const todosReducer = createReducer([], (builder) => {
  builder.addCase(toggleTodo, (state, action) => {
    const index = action.payload
    const todo = state[index]

    // Данный редуктор одновременно мутирует состояние
    todo.completed = !todo.completed

    // и возвращает новое значение. Это приведет к возникновению ошибки.
    // В данном случае простейшим способом решения проблемы является
    // удаление инструкции `return`
    return [...state.slice(0, index), todo, ...state.slice(index + 1)]
  })
})
```

### Выполнение нескольких редукторов

Изначально `createReducer()` сопоставляет тип операции и редуктор, и только совпавший редуктор выполняется.

Использование нескольких `matcher` изменяет это поведение, несколько `matcher` могут обрабатывать одну операцию.

Для любой отправленной операции характерно следующее:

- Если имеет место точное совпадение типа операции, выполняется соответствующий редуктор случая
- Любой `matcher`, возвращающий `true`, выполняется в порядке определения
- Если указан дефолтный редуктор и не запущено выполнение другого редуктора, будет выполнен данный редуктор
- Если ни один редуктор случая или совпадения не запущен, значение состояния возвращается без изменения

Редукторы выполняются последовательно, каждый следующий редуктор получает результат от предыдущего:

```js
import { createReducer } from '@reduxjs/toolkit'

const reducer = createReducer(0, (builder) => {
  builder
    .addCase('increment', (state) => state + 1)
    .addMatcher(
      (action) => action.startsWith('i'),
      (state) => state * 2
    )
    .addMatcher(
      (action) => action.endsWith('t'),
      (state) => state + 3
    )
})

console.log(reducer(0, { type: 'increment' }))
// Возвращается 5, поскольку случай 'increment' и оба `matcher` выполняются последовательно:
// - случай 'increment': 0 => 1
// - `matcher`, осуществляющий поиск первого символа 'i': 1 => 2
// - `matcher`, осуществляющий поиск последнего символа 't': 2 => 5
```

### Логгирование "черновых" значений состояния

В `createSlice()` или `createReducer()` для получения удобочитаемой копии текущего значения состояния `Draft` (черновика - объекта, предоставляемого `immer`) можно использовать `current`:

```js
import { createSlice, current } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'todos',
  initialState: [{ id: 1, title: 'Example todo' }],
  reducers: {
    addTodo: (state, action) => {
      console.log('before', current(state))
      state.push(action.payload)
      console.log('after', current(state))
    }
  }
})
```

## createAction

Вспомогательная функция для определения типа и создателя операции.

```js
function createAction(type, prepareAction?)
```

Обычным способом определения операции в `Redux` является объявление константы типа операции и функции создателя операции для конструирования операций данного типа.

```js
const INCREMENT = 'counter/increment'

function increment(amount) {
  return {
    type: INCREMENT,
    payload: amount,
  }
}

const action = increment(3)
// { type: 'counter/increment', payload: 3 }
```

`createAction()` объединяет эти два объявления в одно. Она принимает тип операции и возвращает создателя операции для этого типа. Создатель может вызываться без аргументов или с аргументом `payload`, добавляемым к операции. Кроме того, создатель перезаписывает метод `toString()`, поэтому тип операции становится его строковым представлением.

```js
import { createAction } from '@reduxjs/toolkit'

const increment = createAction('counter/increment')

let action = increment()
// { type: 'counter/increment' }

action = increment(3)
// returns { type: 'counter/increment', payload: 3 }

console.log(increment.toString())
// 'counter/increment'

console.log(`Тип операции: ${increment}`)
// 'Тип операции: counter/increment'
```

### Использование подготовительных колбеков (prepare callbacks) для кастомизации контента операции

По умолчанию генерируемый создатель операции принимает один аргумент, который становится `action.payload`. Это предполагает некоторую подготовку полезной нагрузки.

Во многих случаях нам может потребоваться дополнительная логика для кастомизации создания значения `payload`, например, обеспечение возможности получения создателем нескольких параметров, генерация случайного `id`, получение текущей даты и времени и т.д. Для этого `createAction()` принимает второй аргумент: "prepare callback", который используется для формирования значения полезной нагрузки:

```js
import { createAction, nanoid } from '@reduxjs/toolkit'

const addTodo = createAction('todos/add', function prepare(text) {
  return {
    payload: {
      text,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    },
  }
})

console.log(addTodo('Написать больше руководств'))
/**
 * {
 *   type: 'todos/add',
 *   payload: {
 *     text: 'Написать больше руководств',
 *     id: '4AJvwMSWEHCchcWYga3dj',
 *     createdAt: '2019-10-03T07:53:36.581Z'
 *   }
 * }
 **/
```

Все аргументы из создателя передаются в подготовительный колбек. Колбек должен вернуть объект с полем `payload` (в противном случае, полезная нагрузка будет иметь значение `undefined`). Данный объект также может иметь поля `meta` и/или `error`, которые также будут добавлены в создателя. `meta` может содержать дополнительную информацию об операции, `error` может содержать подробности о провале операции.

*Обратите внимание*: поле `type` добавляется автоматически.

### Использование с `createReducer()`

Благодаря перезаписи `toString()` создатели, возвращаемые `createAction()`, могут использоваться в качестве ключей в редукторах случая, передаваемых в `createReducer()`.

```js
import { createAction, createReducer } from '@reduxjs/toolkit'

const increment = createAction('counter/increment')
const decrement = createAction('counter/decrement')

const counterReducer = createReducer(0, (builder) => {
  builder.addCase(increment, (state, action) => state + action.payload)
  builder.addCase(decrement, (state, action) => state - action.payload)
})
```

*Важно*: несмотря на то, что `Redux` позволяет использовать в качестве типа операции любое значение, настоятельно рекомендуется использовать только строки. Это объясняется дополнительным функционалом перезаписанного `toString()`.

#### actionCreator.match

Каждый создатель, сгенерированный с помощью `createAction()`, имеет метод `match(action)`, который может использоваться для определения того, что переданная операция имеет такой же тип, что и операция, возвращаемая создателем.

## createSlice

Функция, принимающая начальное состояние, объект с редукторами и "название части", и автоматически генерирующая создателей и типы операции, связанные с редукторами и состоянием.

Данный API является стандартным подходом к написанию логики `Redux`.

Он использует `createAction()` и `createReducer()`, что позволяет использовать `immer` для "мутирования" состояния:

```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: 0 }

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value++
    },
    decrement(state) {
      state.value--
    },
    incrementByAmount(state, action) {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

### Параметры

`createSlice()` принимает следующий объект:

```js
function createSlice({
    // Название, используемое в качестве префикса в типах операции
    name: string,
    // Начальное состояние редуктора
    initialState: any,
    // Объект с "редукторами случая". Названия ключей используются для создания операций
    reducers: object,
    // Функция "builder callback", используемая для добавления дополнительных редукторов
    // или дополнительный объект с "редукторами случая", ключи которого должны быть другими типами операции
    extraReducers?: func | object
})
```

#### Кастомизация генерируемых создателей операции

Для кастомизации создания значения полезной нагрузки создателя операции с помощью подготовительного колбека значением соответствующего поля аргумента `reducers` должен быть объект, а не функция. Данный объект должен содержать два свойства: `reducer` и `prepare`. Значением `reducer` должна быть функция редуктора случая, а значением `prepare` - подготовительная функция обратного вызова:

```js
import { createSlice, nanoid } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.push(action.payload)
      },
      prepare: (text) => {
        const id = nanoid()
        return { payload: { id, text } }
      },
    },
  },
})
```

### `extraReducers`

Одной из ключевых концепций `Redux` является то, что каждый частичный редуктор "владеет" определенной частью состояния и несколько частичных редукторов могут независимо обрабатывать один тип операции. `extraReducers` позволяет `createSlice()` обрабатывать дополнительные типы операции.

Поскольку редукторы случая, определенные с помощью `extraReducers`, считаются обработчиками "внешних" операций, их операции не попадают в `slice.actions`.

Такие редукторы также передаются в `createReducer()` и могут безопасно "мутировать" их состояние.

Если два поля из `reducers` и `extraReducers` регистрируют один и тот же тип операции, для обработки данного типа будет вызвана функция из `reducers`.

#### Использование "builder callback" для `extraReducers`

Рекомендуемый способ использования `extraReducers` заключается в передаче ему колбека, принимающего экземпляр `ActionReducerMapBuilder`.

Нотация "строителя" - это также единственный способ добавления редукторов совпадения и дефолтного редуктора для части состояния:

```js
import { createAction, createSlice } from '@reduxjs/toolkit'
const incrementBy = createAction('incrementBy')
const decrement = createAction('decrement')

function isRejectedAction(action) {
  return action.type.endsWith('rejected')
}

createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(incrementBy, (state, action) => {
        // ...
      })
      // Можно создать цепочку из вызовов `addCase()`
      // или каждый раз писать `builder.addCase()`
      .addCase(decrement, (state, action) => {})
      // Редуктор совпадения
      .addMatcher(
        isRejectedAction,
        (state, action) => {}
      )
      // Дефолтный редуктор
      .addDefaultCase((state, action) => {})
  },
})
```

#### Использование нотации "map object" для `extraReducers`

```js
const incrementBy = createAction('incrementBy')

createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
  extraReducers: {
    [incrementBy]: (state, action) => {
      return state + action.payload
    },
    'some/other/action': (state, action) => {}
  }
})
```

### Возвращаемое значение

`createSlice()` возвращает такой объект:

```js
{
  name: string,
  reducer: func,
  actions,
  caseReducers
}
```

Каждая функция, определенная в `reducers`, получает соответствующего создателя операции, генерируемого с помощью `createAction()`, и включается в `actions` под тем же названием.

Генерируемый редуктор подходит для передачи в функцию `combineReducers()` в качестве "частичного редуктора".

Создателей операции можно деструктурировать и экспортировать по отдельности.

### Полный пример

```js
import { configureStore, createSlice, createAction } from '@reduxjs/toolkit'

// "внешние" операции
const incrementBy = createAction('incrementBy')
const decrementBy = createAction('decrementBy')

const counter = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    multiply: {
      reducer: (state, action) => state * action.payload,
      prepare: (value) => ({ payload: value || 2 }), // страховка на случай, если полезная нагрузка - ложное значение
    },
  },
  // "builder callback API"
  extraReducers: (builder) => {
    builder.addCase(incrementBy, (state, action) => {
      return state + action.payload
    })
    builder.addCase(decrementBy, (state, action) => {
      return state - action.payload
    })
  },
})

const user = createSlice({
  name: 'user',
  initialState: { name: '', age: 20 },
  reducers: {
    setUserName: (state, action) => {
      state.name = action.payload // состояние можно мутировать как угодно (спасибо `immer`)
    },
  },
  // "map object API"
  extraReducers: {
    [counter.actions.increment]: (
      state,
      action
    ) => {
      state.age += 1
    },
  },
})

const store = configureStore({
  reducer: {
    counter: counter.reducer,
    user: user.reducer
  }
})

const { increment, decrement, multiply } = counter.actions
const { setUserName } = user.actions

store.dispatch(increment())
// -> { counter: 1, user: {name : '', age: 21} }
store.dispatch(increment())
// -> { counter: 2, user: {name: '', age: 22} }
store.dispatch(multiply(3))
// -> { counter: 6, user: {name: '', age: 22} }
store.dispatch(multiply())
// -> { counter: 12, user: {name: '', age: 22} }
console.log(`${decrement}`)
// -> "counter/decrement"
store.dispatch(setUserName('John'))
// -> { counter: 6, user: { name: 'John', age: 22} }
```

## createAsyncThunk

### Обзор

Функция, которая принимает тип операции и колбек, возвращающий промис. Генерирует типы операции, соответствующие жизненному циклу промиса на основе переданного префикса типа операции, и возвращает преобразователь создателя операции, который запускает колбек промиса и отправляет операции жизненного цикла на основе возвращенного промиса.

Данная абстракция является рекомендуемым подходом к обработке жизненных циклов асинхронных запросов.

Она не генерирует редукторы, поскольку не знает, какие данные запрашиваются, как отслеживается состояние загрузки или как данные будут обрабатываться. Поэтому для обработки этих операций нужны отдельные редукторы.

Простой пример использования:

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { userAPI } from './userAPI'

// Сначала создаем `thunk`
const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId, thunkAPI) => {
    const response = await userAPI.fetchById(userId)
    return response.data
  }
)

// Затем обрабатываем операции в редукторах
const usersSlice = createSlice({
  name: 'users',
  initialState: { entities: [], loading: 'idle' },
  reducers: {
    // стандартная логика с авто-генерируемыми типами операции для каждого редуктора
  },
  extraReducers: {
    // Добавляем редукторы для дополнительных операций и обрабатываем состояние загрузки
    [fetchUserById.fulfilled]: (state, action) => {
      // Добавляем пользователя в массив состояния
      state.entities.push(action.payload)
    }
  }
})

// Позже, отправляем `thunk`
dispatch(fetchUserById(123))
```

### Параметры

`createAsyncThunk()` принимает три параметра: значение `type`, колбек `payloadCreator` и объект `options`.

#### `type`

Строка, которая используется для генерации дополнительных констант типа операции, представляющих жизненный цикл асинхронного запроса.

Например, аргумент `type` `users/requestStatus` сгенерирует следующие типы операции:

- `pending`: users/requestStatus/pending
- `fulfilled`: users/requestStatus/fulfilled
- `rejected`: users/requestStatus/rejected

#### `payloadCreator()`

Колбек, возвращающий промис, содержащий результат некоторой асинхронной логики. Может возвращать значение синхронно. При возникновении ошибки, должен вернуть отклоненный промис, содержащий экземпляр `Error` или обычное значение, такое как описательное сообщение об ошибке, или же разрешенный промис с аргументом `RejectWithValue` - результатом вызова функции `thunkAPI.rejectWithValue`.

`payloadCreator()` может содержать любую логику, необходимую для вычисления результата. Это может включать стандартный AJAX-запрос данных или несколько вызовов AJAX с результатами, объединяемыми в результирующее значение, взаимодействие с `AsyncStorage` React Native и т.д.

`payloadCreator()` принимает два аргумента:

- `arg`: простое значение, содержащее первый параметр, переданный `thunk` при его отправке. Это может быть полезным для отправки идентификаторов, включаемых в запрос. Если требуется передать несколько значений, это можно сделать с помощью объекта, например: `dispatch(fetchUsers({status: 'active', sortBy: 'name'}))`
- `thunkAPI`: объект, содержащий все параметры, обычно передаваемый в `thunk`, а также дополнительные опции:
  - `dispatch`: метод `dispatch` хранилища `Redux`
  - `getState`: метод `getState` хранилища `Redux`
  - `extra`: "дополнительный аргумент", переданный посреднику `thunk` в момент настройки хранилища, если доступен
  - `requestId`: уникальный `id`, автоматически генерируемый для идентификации данной последовательности запроса
  - `signal`: объект `AbortController.signal`, который может использоваться для обнаружения отмены запроса другой частью приложения
  - `rejectWithValue`: утилита, которую можно вернуть в создателя операции для получения отклоненного промиса с определенной полезной нагрузкой. Она передаст любое указанное значение и вернет его в виде полезной нагрузки отклоненной операции

##### Options

Объект, содержащий следующие опциональные поля:

- `condition`: колбек, который может использоваться для пропуска выполнения создателя полезной нагрузки и всех отправляемых операций
- `dispatchConditionRejection`: если `condition()` возвращает `false`, поведением по умолчанию является отмена отправки всех операций. Если требуется отправить "отклоненную" операцию при отмене `thunk`, данному полю необходимо присвоить значение `true`

### Возвращаемое значение

`createAsyncThunk()` возвращает стандартного создателя операции `thunk`. `thunk` включает создателей для случаев `pending`, `fulfilled` и `rejected` в виде вложенных полей.

В приведенном выше примере `createAsyncThunk()` создает четыре функции:

- `fetchUserById` - преобразователь, запускающий все указанные асинхронные колбеки полезной нагрузки
`fetchUserById.pending` - создатель, отправляющий операцию `users/fetchByIdStatus/pending`
`fetchUserById.fulfilled` - создатель, отправляющий операцию `users/fetchByIdStatus/fulfilled`
`fetchUserById.rejected` - создатель, отправляющий операцию `users/fetchByIdStatus/rejected`

При отправке преобразователь делает следующее:

- отправляет операцию `pending`
- вызывает колбек `payloadCreator` и ждет возвращения промиса
- при разрешении промиса:
  - если промис успешно разрешен, отправляет операцию `fulfilled` со значением промиса в виде `action.payload`
  - если промис разрешился со значением, возвращенным `rejectWithValue(value)`, отправляет операцию `rejected` со значением, переданным в `action.payload`, и "отклоняется" как `action.error.message`
  - если промис провалился и не был обработан с помощью `rejectWithValue`, отправляет операцию `rejected` с сериализованной версией ошибки как `action.error`
- возвращает разрешенный промис, содержащий финальную отправленную операцию (объект операции `fulfilled` или `rejected`)

### Операции жизненного цикла промиса

`createAsyncThunk()` генерирует трех создателей операции с помощью `createAction()`: `pending`, `fulfilled` и `rejected`. Каждый создатель жизненного цикла привязывается к возвращаемому `thunk`, поэтому логика редуктора может ссылаться на типы операции и реагировать на их отправку. Каждый объект операции содержит текущий уникальный `requestId` и `args` в `action.meta`.

Создатели операции имеют такую сигнатуру:

```js
SerializedError {
  name?: string
  message?: string
  code?: string
  stack?: string
}

PendingAction {
  type: string
  payload: undefined
  meta: {
    requestId: string
    arg: ThunkArg
  }
}

FulfilledAction {
  type: string
  // полезная нагрузка - результат успешно разрешенного промиса
  payload: PromiseResult
  meta: {
    requestId: string
    arg: ThunkArg
  }
}

RejectedAction {
  type: string
  payload: undefined
  error: SerializedError | any
  meta: {
    requestId: string
    arg: ThunkArg
    aborted: boolean
    condition: boolean
  }
}

RejectedWithValueAction {
  type: string
  // полезная нагрзука - резервное значение, возвращаемое при отклонении промиса
  payload: RejectedValue
  error: { message: 'Rejected' }
  meta: {
    requestId: string
    arg: ThunkArg
    aborted: boolean
  }
}
```

Эти операции могут обрабатываться через ссылки на создателей операции с `createReducer()` или `createSlice()`:

```js
const reducer1 = createReducer(initialState, {
  [fetchUserById.fulfilled]: (state, action) => {}
})

const reducer2 = createReducer(initialState, builder => {
  builder.addCase(fetchUserById.fulfilled, (state, action) => {})
})

const reducer3 = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUserById.fulfilled]: (state, action) => {}
  }
})

const reducer4 = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUserById.fulfilled, (state, action) => {})
  }
})
```

### Обработка результатов преобразования

*Распаковка результирующих операций*

Преобразователи могут возвращать значение при отправке. Распространенной практикой является возвращение промиса из `thunk`, его отправка из компонента и ожидание разрешения промиса перед выполнением каких-либо действий:

```js
const onClick = () => {
  dispatch(fetchUserById(userId)).then(() => {
    // обработка значения промиса
  })
}
```

Преобразователи, созданные с помощью `createAsyncThunk()` всегда возвращают разрешенный промис либо с объектом операции `fulfilled`, либо с объектом операции `rejected`.

`Redux Toolkit` экспортирует функцию `unwrapResult`, которая может использоваться для извлечения `payload` операции `fulfilled` или для выбрасывания `error` или `payload`, созданного `rejectWithValue` из операции `rejected`:

```js
import { unwrapResult } from '@reduxjs/toolkit'

// в компоненте
const onClick = () => {
  dispatch(fetchUserById(userId))
    .then(unwrapResult)
    .then(originalPromiseResult => {})
    .catch(rejectedValueOrSerializedError => {})
}
```

### Отмена

#### Отмена перед выполнением

Для отмены `thunk` перед вызовом создателя нагрузки можно передать колбек `condition` после создателя операции. Колбек получит аргумент `thunk` и объект с параметрами `{getState, extra}`, который он использует для определения того, следует продолжать или нет. Если выполнение должно быть отменено, колбек `condition()` должен вернуть значение `false`:

```js
const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId, thunkAPI) => {
    const response = await userAPI.fetchById(userId)
    return response.data
  },
  {
    condition: (userId, { getState, extra }) => {
      const { users } = getState()
      const fetchStatus = users.requests[userId]
      if (fetchStatus === 'fulfilled' || fetchStatus === 'loading') {
        // Пользователь уже запрошен или запрос находится на стадии выполнения, необходимость выполнения повторного запроса отсутствует
        return false
      }
    }
  }
)
```

Если `condition()` возвращает `false`, никакие операции не отправляются. Если требуется отправить операцию "отклонения" при отмене `thunk`, следует передать `{condition, dispatchConditionRejection: true}`.

#### Отмена в процессе выполнения

Для отмены запущенного `thunk` можно использовать метод `abort` промиса, возвращаемого `dispatch(fetchUserById(userId))`. Пример:

```js
import { fetchUserById } from './slice'
import { useAppDispatch } from './store'
import React from 'react'

function MyComponent(props) {
  const dispatch = useAppDispatch()
  React.useEffect(() => {
    // Отправка `thunk` возвращает промис
    const promise = dispatch(fetchUserById(props.userId))
    return () => {
      // `createAsyncThunk()` добавляет в промис метод `abort()`
      promise.abort()
    }
  }, [props.userId])
}
```

После отмены `thunk` таким способом, он отправит (и вернет) операцию `thunkName/rejected` с `AbortError` в свойстве `error`. Другие операции отправлены не будут.

`payloadCreator()` может использовать `AbortSignal`, переданный через `thunkAPI.signal` для отмены "дорогостоящих" асинхронных операций.

`Fetch API` поддерживает `AbortSignal`:

```js
import { createAsyncThunk } from '@reduxjs/toolkit'

const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId: string, thunkAPI) => {
    const response = await fetch(`https://reqres.in/api/users/${userId}`, {
      signal: thunkAPI.signal,
    })
    return await response.json()
  }
)
```

### Примеры

- Получение данных пользователя по идентификатору с состоянием загрузки и отправкой одного запроса за раз:

```js
import { createAsyncThunk, createSlice, unwrapResult } from '@reduxjs/toolkit'
import { userAPI } from './userAPI'

const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId, { getState, requestId }) => {
    const { currentRequestId, loading } = getState().users
    if (loading !== 'pending' || requestId !== currentRequestId) {
      return
    }
    const response = await userAPI.fetchById(userId)
    return response.data
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    entities: [],
    loading: 'idle',
    currentRequestId: undefined,
    error: null
  },
  reducers: {},
  extraReducers: {
    [fetchUserById.pending]: (state, action) => {
      if (state.loading === 'idle') {
        state.loading = 'pending'
        state.currentRequestId = action.meta.requestId
      }
    },
    [fetchUserById.fulfilled]: (state, action) => {
      const { requestId } = action.meta
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.loading = 'idle'
        state.entities.push(action.payload)
        state.currentRequestId = undefined
      }
    },
    [fetchUserById.rejected]: (state, action) => {
      const { requestId } = action.meta
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.loading = 'idle'
        state.error = action.error
        state.currentRequestId = undefined
      }
    }
  }
})

const UsersComponent = () => {
  const { users, loading, error } = useSelector(state => state.users)
  const dispatch = useDispatch()

  const fetchOneUser = async userId => {
    try {
      const resultAction = await dispatch(fetchUserById(userId))
      const user = unwrapResult(resultAction)
      showToast('success', `Получены данные ${user.name}`)
    } catch (err) {
      showToast('error', `Запрос данных завершился ошибкой: ${err.message}`)
    }
  }

  // рендеринг UI
}
```

- Использование `rejectWithValue` для доступа к кастомной отклоненной нагрузке в компоненте

*Обратите внимание*: это надуманный пример, наш `userAPI` всегда выбрасывает ошибки валидации

```js
// user/slice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { userAPI } from './userAPI'

export const updateUser = createAsyncThunk(
  'users/update',
  async (userData, { rejectWithValue }) => {
    try {
      const { id, ...fields } = userData
      const response = await userAPI.updateById(id, fields)
      return response.data.user
    } catch (err) {
      let error = err // кастомизируем ошибку для обеспечения доступа
      if (!error.response) {
        throw err
      }
      // Мы получаем ошибки валидации, вернем их для извлечения в компоненте и указания в форме
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  entities: {},
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(updateUser.fulfilled, (state, { payload }) => {
      state.entities[payload.id] = payload
    })
    builder.addCase(updateUser.rejected, (state, action) => {
      if (action.payload) {
        // Здесь мы имеем доступ к ошибкам, переданным в `createAsyncThunk()`
        state.error = action.payload.errorMessage
      } else {
        state.error = action.error.message
      }
    })
  },
})

export default usersSlice.reducer

// user/UsersComponent.js
import { useAppDispatch } from '../store'
import { useSelector } from 'react-redux'
import { updateUser } from './slice'
import { showToast } from 'some-toast-library'

const UsersComponent = (props) => {
  const { entities, error } = useSelector((state) => state.users)
  const dispatch = useAppDispatch()

  // Это пример обработчика `onSubmit`, реализованного с помощью `Formik` для демонстрации доступа к нагрузке отклоненной операции
  const handleUpdateUser = async (values, formikHelpers) => {
    const resultAction = await dispatch(updateUser({ id: props.id, ...values }))
    if (updateUser.fulfilled.match(resultAction)) {
      const user = resultAction.payload
      showToast('success', `Данные пользователя ${user.first_name} ${user.last_name} обновлены`)
    } else {
      if (resultAction.payload) {
        // Здесь мы имеем доступ к ошибкам, переданным в `createAsyncThunk()`
        formikHelpers.setErrors(resultAction.payload.field_errors)
      } else {
        showToast('error', `Update failed: ${resultAction.error}`)
      }
    }
  }

  // рендеринг UI
}
```

## createEntityAdapter

### Обзор

Функция, генерирующая набор встроенных редукторов и селекторов для выполнения GRUD-операций с нормализованной структурой состояния определенного типа объекта данных. Эти редукторы могут передаваться в качестве редукторов случая в `createReducer()` и `createSlice()`. Они также могут использоваться как помощники "мутации" ("mutation" helpers) внутри `createReducer()` и `createSlice()`.

Данный API был портирован из библиотеки `@ngrx/entity`, созданной командой `NgRx`, но существенно модифицирован для лучшей интеграции с `Redux Toolkit`.

*Обратите внимание*: термин "сущность" (entity) означает уникальный тип объекта данных приложения. Например, в блоге такими объектами данных могут быть `User`, `Post` и `Comment`, каждый с несколькими экземплярами, хранящимися на клиенте и на сервере. `User` - это "сущность", уникальный тип объекта данных, используемый приложением. Каждый экземпляр сущности имеет уникальный `id` в соответствующем поле.

В хранилище могут передаваться только обычные JS-объекты и массивы, но не экземпляры классов.

В дальнейшем термин `Entity` будет использоваться для обозначения специфического типа данных, управляемого копией редуктора в определенной части дерева состояния, а термин `entity` - для обозначения единичного экземпляра этого типа. Например: в `state.users` `Entity` указывает на тип `User`, а `state.users.entities[123]` - это единичный `entity`.

Методы, генерируемые `createEntityAdapter()`, манипулируют структурой "состояния сущности", которая выглядит так:

```js
{
  // Уникальные `id` элементов. Должны быть строками или числами
  ids: [ ]
  // Таблица поиска, связывающая `id` с соответствующими объектами
  entities: { }
}
```

`createEntityAdapter()` может вызываться несколько раз в приложении. Определение адаптера можно повторно использовать для нескольких типов сущности, если они в достаточной степени похожи между собой (например, все имеют поле `entity.id`).

Простой пример:

```js
import {
  createEntityAdapter,
  createSlice,
  configureStore,
} from '@reduxjs/toolkit'

const booksAdapter = createEntityAdapter({
  // Предположим, что идентификаторы хранятся в поле, отличающемся от `book.id`
  selectId: (book) => book.bookId,
  // Сортируем `id` по заголовкам книг
  sortComparer: (a, b) => a.title.localeCompare(b.title),
})

const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: {
    // Адаптер может передаваться прямо в редуктор случая. Поскольку мы передаем его как значение,
    // `createSlice()` автоматически генерирует тип / создателя `bookAdded`
    bookAdded: booksAdapter.addOne,
    booksReceived(state, action) {
      // или мы можем вызывать его в качестве помощника "мутации" в редукторе случая
      booksAdapter.setAll(state, action.payload.books)
    },
  },
})

const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
  },
})

console.log(store.getState().books)
// { ids: [], entities: {} }

// Можем создать набор мемоизированных селекторов на основе локации данного состояния сущности
const booksSelectors = booksAdapter.getSelectors((state) => state.books)

// и затем использовать эти селекторы для извлечения соответствующих значений
const allBooks = booksSelectors.selectAll(store.getState())
```

### Параметры

`createEntityAdapter()` принимает объект с двумя полями:

- `selectId` - функция, принимающая экземпляр `Entity` и возвращающая значение уникального поля. Реализацией по умолчанию является `entity => entity.id`. Если сущность хранит уникальные значения в поле, отличающемся от `entity.id`, необходимо добавить реализацию `selectId`.
- `sortComparer` - колбек, принимающий два экземпляра сущности и возвращающий числовой результат стандартного метода `Array.sort()` (1, 0, -1) для определения порядка сортировки.

### Возвращаемое значение

Экземпляр "адаптера сущности". Объект, содержащий сгенерированные редукторы, переданные `selectId` и `sortComparer`, метод для инициализации начального значения "состояния сущности" и функцию для генерации набора мемоизированных селекторов для данного типа сущности.

### CRUD функции

Основное содержимое адаптера сущности - это набор редукторов для добавления, обновления и удаления экземпляров из объекта состояния:

- `addOne` - принимает единичную сущность и добавляет ее
- `addMany` - принимает массив сущностей или объект определенной формы и добавляет их
- `setAll` - принимает массив сущностей или объект определенной формы и заменяет контент существующих сущностей значениями из массива
- `removeOne` - принимает единичное значение `id` и удаляет соответствуюую сущность, если она имеется
- `removeMany` - принимает массив значений `id` и удаляет соответствующие сущности
- `updateOne` - принимает "объект обновления", содержащий `id` сущности и объект с одним и более новыми значениями полей в поле `changes`, и выполняет поверхностное обновление соответствующей сущности
- `updateMany` - принимает массив объектов обновления и выполняет поверхностное обновление соответствующих сущностей
- `upsertOne` - принимает единичную сущность. Если сущность с указанным `id` существует, выполняется ее поверхностное обновление и объединение полей. Значения совпадающих полей перезаписываются. Если сущность с указанным `id` отсутствует, она добавляется
- `upsertMany` - принимает массив сущностей или объект определенной формы и выполняет `upsertOne` для каждой сущности

Сигнатура каждого метода выглядит так:

```js
(state, argument) => newState
```

Другими словами, методы принимают состояние в виде `{ids: [], entities: {}}`, вычисляют и возвращают новое состояние.

Эти методы могут использоваться разными способами:

- Могут передаваться в редукторы напрямую в `createReducer()` и `createSlice()`
- Могут использоваться в качестве помощников "мутации", когда вызываются вручную, например, когда `addOne()` вызывается в существующем редукторе для `state`, которое на самом деле является значением `Draft` из `immer`
- Могут использоваться как методы иммутабельного обновления, когда вызываются вручную, если `state` является обычным JS-объектом или массивом

*Обратите внимание*: данные методы не имеют соответствующих операций - они представляют собой автономную логику редукторов / обновления. Где и как их использовать, зависит только от нас. В большинстве случаев они передаются в `createSlice()` или используются внутри других редукторов.

Каждый метод проверяет, является ли `state` черновиком. Если является, метод решает, что дальнейшее мутирование является безопасным. Если не является, метод передает объект в `createNextState()` и возвращает иммутабельно обновленный результат.

`argument` может быть обычным значением (таким как единичный объект `Entity` для `addOne()` или массив `Entity` для `addMany()`) или объектом операции `PayloadAction` со значением, аналогичным `action.payload`. Это позволяет использовать их и как вспомогательные функции, и как редукторы.

*Обратите внимание*: методы `updateOne()`, `updateMany()`, `upsertOne()` и `upsertMany()` выполняют поверхностное обновление. Это означает, что если мы обновляем/заменяем содержимое объекта, включающего вложенные свойства, эти свойства будут перезаписаны переданными значениями. Поэтому указанные методы могут использоваться только для нормализованных данных, не имеющих вложенных свойств.

### `getInitialState()`

Возвращает новый объект состояния сущности вида `{ids: [], entities: {}}`.

Принимает опциональный объект в качестве аргумента. Поля этого объекта будут объединены с возвращаемым начальным состоянием. Предположим, что мы хотим, чтобы наша часть также отслеживала состояние загрузки:

```js
const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState({
    loading: 'idle'
  }),
  reducers: {
    booksLoadingStarted(state, action) {
      // Можем обновлять дополнительное поле состояния
      state.loading = 'pending'
    }
  }
})
```

### Селекторы

Адаптер содержит функцию `getSelectors()`, возвращающую набор селекторов, которые умеют читать содержимое объекта состояния:

- `selectIds` - возвращает массив `state.ids`
- `selectEntities` - возвращает поисковую таблицу `state.entities`
- `selectAll` - проходится по массиву `state.ids` и возвращает массив сущностей в том же порядке
- `selectTotal` - возвращает общее количество сущностей, хранящихся в состоянии
- `selectById` - принимает состояние и `id`, возвращает сущность с данным `id` или `undefined`

Каждый селектор создается с помощью функции `createSelector()` из `Reselect`, поэтому может мемоизировать вычисления результатов.

Поскольку селекторы полагаются на нахождение указанного объекта состояния сущности в определенном месте дерева состояния, `getSelectors()` может вызываться двумя способами:

- Если вызывается без аргументов, возвращает "неглобализированный" набор селекторов, предполагающих, что аргумент `state` - это актуальный объект состояния сущности для чтения
- Может вызываться с селектором, принимающим определенную сущность дерева состояния. В этом случае он возвращает правильный объект состояния сущности

Например, состояние для типа `Book` может храниться в дереве состояния как `state.books`. Мы можем использовать `getSelectors()` для чтения состояния двумя способами:

```js
const store = configureStore({
  reducer: {
    books: booksReducer
  }
})

const simpleSelectors = booksAdapter.getSelectors()
const globalizedSelectors = booksAdapter.getSelectors(state => state.books)

// В этот селектор необходимо вручную передавать правильный объект состояния сущности
const bookIds = simpleSelectors.selectIds(store.getState().books)

// Этот селектор уже знает, где искать такой объект
const allBooks = globalizedSelectors.selectAll(store.getState())
```

### Применение нескольких обновлений

Если `updateMany()` вызван с несколькими обновлениями для одной сущности, эти обновления будут объединены в одно, последующие обновления перезапишут предыдущие.

Изменение идентификатора существующей сущности с помощью `updateOne()` или `updateMany()`, приводящее к совпадению с идентификатором другой существующей сущности, заканчивается тем, что первая сущность полностью заменяет вторую.

### Пример

```js
import {
  createEntityAdapter,
  createSlice,
  configureStore
} from '@reduxjs/toolkit'

// Поскольку мы не указываем `selectId`, уникальным полем будет считаться `entity.id`
const booksAdapter = createEntityAdapter({
  // Сортируем массив с идентификаторами по заголовкам книг
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState({
    loading: 'idle'
  }),
  reducers: {
    bookAdded: booksAdapter.addOne,
    booksLoading(state, action) {
      if (state.loading === 'idle') {
        state.loading = 'pending'
      }
    },
    booksReceived(state, action) {
      if (state.loading === 'pending') {
        booksAdapter.setAll(state, action.payload)
        state.loading = 'idle'
      }
    },
    bookUpdated: booksAdapter.updateOne
  }
})

const {
  bookAdded,
  booksLoading,
  booksReceived,
  bookUpdated
} = booksSlice.actions

const store = configureStore({
  reducer: {
    books: booksSlice.reducer
  }
})

// Проверяем начальное состояние
console.log(store.getState().books)
// {ids: [], entities: {}, loading: 'idle' }

const booksSelectors = booksAdapter.getSelectors(state => state.books)

store.dispatch(bookAdded({ id: 'a', title: 'First' }))
console.log(store.getState().books)
// {ids: ["a"], entities: {a: {id: "a", title: "First"}}, loading: 'idle' }

store.dispatch(bookUpdated({ id: 'a', changes: { title: 'Second' } }))
store.dispatch(booksLoading())
console.log(store.getState().books)
// {ids: ["a"], entities: {a: {id: "a", title: "Second"}}, loading: 'pending' }

store.dispatch(
  booksReceived([
    { id: 'b', title: 'Book 3' },
    { id: 'c', title: 'Book 2' }
  ])
)

console.log(booksSelectors.selectIds(store.getState()))
// "a" был удален из-за вызова `setAll()`
// Поскольку книги сортируются по заголовкам, "Book 2" находится перед "Book 3"
// ["c", "b"]

console.log(booksSelectors.selectAll(store.getState()))
// Все сущности в отсортированном порядке
// [{id: "c", title: "Book 2"}, {id: "b", title: "Book 3"}]
```
