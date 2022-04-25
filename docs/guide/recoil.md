---
sidebar_position: 8
title: Руководство по Recoil
description: Руководство по Recoil
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'recoil', 'state manager', 'state management', 'state', 'guide', 'руководство', 'инструмент для управления состоянием', 'управление состоянием', 'состояние']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'recoil', 'state manager', 'state management', 'state', 'guide', 'руководство', 'инструмент для управления состоянием', 'управление состоянием', 'состояние']
---

# Recoil

> [Recoil](https://recoiljs.org/) - это инструмент для управления состоянием React-приложений. Он позволяет создавать граф потока данных (data-flow graph), распространяющихся от атомов (atoms) через селекторы (selectors) (чистые функции) в компоненты. Атомы - это единицы состояния, на которые компоненты могут подписываться. Селекторы преобразуют состояние синхронным или асинхронным способом.

### Атомы (atoms)

Атомы - это единицы состояния. Они являются обновляемыми и на них можно подписываться: при обновлении атома, каждый подписанный на него компонент перерисовывается с новым значением. Они могут создаваться во время выполнения. Атомы могут использоваться вместо локального состояния компонента. Если одни и те же атомы используются несколькими компонентами, состояние, содержащееся в таких атомах, является распределенным.

Атомы создаются с помощью функции `atom()`:

```js
const fontSizeState = atom({
  key: 'fontSizeState',
  default: 14
})
```

Атому передается уникальный ключ, который используется для отладки, обеспечения согласованности и в некоторых продвинутых API, позволяющих получать карту всех атомов, используемых в приложении. Данные ключи должны быть глобально уникальными, в противном случае, выбрасывается исключение. Как и состояние компонента, они также имеют значение по умолчанию.

Для чтения и записи в атом из компонента используется хук `useRecoilState()`. Это как `useState()`, но состояние может распределяться между несколькими компонентами:

```js
function FontButton() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState)

  return (
    <button onClick={() => setFontSize((size) => size + 1)} style={{fontSize}}>
      Увеличить размер шрифта
    </button>
  )
}
```

Нажатие кнопки приводит к увеличению размера шрифта на единицу. Другие компоненты также могут использовать это состояние:

```js
function Text() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState)

  return <p style={{fontSize}}>Этот текст также будет увеличиваться в размерах</p>
}
```

### Селекторы (selectors)

Селектор - это чистая функция, принимающая атомы или другие селекторы. При обновлении переданных атомов или селекторов, функция селектора вычисляется повторно. Компоненты могут подписываться на селекторы также, как на атомы, они будут перерисовываться при изменении селекторов.

Селекторы используются для вычисления производных данных на основе состояния. Это позволяет избежать избыточности состояния, поскольку в атомах хранится минимальный набор состояния, все остальное эффективно вычисляется с помощью функций. Поскольку селекторы следят за подписанными на них компонентами, подход, основанный на функциях, является очень эффективным.

Атомы и селекторы имеют одинаковый интерфейс и являются взаимозаменяемыми.

Селекторы определяются с помощью функции `selector()`:

```js
const fontSizeLabelState = selector({
  key: 'fontSizeLabelState',
  get: ({ get }) => {
    const fontSize = get(fontSizeState)
    const unit = 'px'

    return `${fontSize}${unit}`
  }
})
```

Свойство `get` - это функция, подлежащая вычислению. Она может извлекать значения из атомов и других селекторов с помощью аргумента `get`. При доступе к другому атому или селектору, создается зависимость: обновление атома или селектора-зависимости приводит к обновлению селектора.

В приведенном примере селектор `fontSizeLabelState` имеет одну зависимость: атом `fontSizeState`. Концептуально, `fontSizeLabelState` представляет собой чистую функцию, принимающую `fontSizeState` на вход и возвращающую форматированную подпись размера шрифта на выходе.

Селекторы можно читать с помощью хука `useRecoilValue()` , принимающего атом или селектор в качестве аргумента и возвращающего соответствующее значение. Мы не используем `useRecoilState()`, поскольку селектор `fontSizeLabelState` доступен только для чтения:

```js
function FontButton() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState)
  const fontSizeLabel = useRecoilValue(fontSizeLabelState)

  return (
    <>
      <div>Текущий размер шрифта: {fontSizeLabel}</div>

      <button onClick={() => setFontSize(fontSize + 1)} style={{fontSize}}>
        Увеличить размер шрифта
      </button>
    </>
  )
}
```

Нажатие на кнопку теперь приводит к следующему: во-первых, увеличивается размер шрифта кнопки, во-вторых, обновляется подпись, отражающая текущий размер шрифта.

## Начало работы

### Create React App

`Recoil` - это библиотека для управления состоянием в React-приложениях, поэтому использование `Recoil` предполагает установку `React`. Самый простой способ это сделать заключается в использовании `Create React App`:

```bash
yarn create react-app my-app
# или
npm init create-app my-app
# или
npx create-react-app my-app
```

### Установка

```bash
yarn add recoil
# или
npm i recoil
```

### RecoilRoot

Компоненты, использующие состояние `Recoil` должны быть обернуты в `RecoilRoot`. Подходящим местом для этого является корневой компонент приложения:

```js
import React from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil'

const App() => (
  <RecoilRoot>
    <CharacterCounter />
  </RecoilRoot>
)
```

### Атом

Атом представляет собой часть состояния. Атомы доступны для любого компонента. Компоненты, извлекающие значение из атома, неявно на него подписываются: обновление атома приводит к повторному рендерингу подписанных на него компонентов:

```js
const textState = atom({
  key: 'textState', // уникальный ID (по сравнению с другими атомами/селекторами)
  default: '' // дефолтное (начальное) значение
})
```

Для извлечения и записи значений в атомы компоненты должны использовать хук `useRecoilState()`:

```js
const CharacterCounter = () => (
  <div>
    <TextInput />
    <CharacterCount />
  </div>
)

function TextInput() {
  const [text, setText] = useRecoilState(textState)

  const onChange = (event) => {
    setText(event.target.value)
  }

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <br />
      Текст: {text}
    </div>
  )
}
```

###  Селектор

Селектор представляет собой часть производного состояния. Производное состояние - это преобразованный вариант исходного состояния. Вы можете думать о производном состоянии как о результате передачи оригинального состояния в чистую функцию, модифицирующую состояние каким-либо образом:

```js
const charCountState = selector({
  key: 'charCountState', // уникальный ID
  get: ({get}) => {
    const text = get(textState)

    return text.length
  },
})
```

Для извлечения значения из `charCharacterState` используется хук `useRecoilValue()`:

```js
function CharacterCount() {
  const count = useRecoilValue(charCountState)

  return <>Количество символов: {count}</>
}
```

## Туториал

В данном туториале мы создадим простое приложение - список задач. Функционал нашего приложения будет следующим:

- Добавление задач в список
- Редактирование задач
- Удаление задач
- Фильтрация задач
- Отображение полезной статистики

Предполагается, что вы установили `React` и `Recoil`, а также обернули корневой компонент в `RecoilRoot`.

### Атомы

Атомы содержат источник истины для состояния приложения. Для нашей тудушки источником истины будет массив объектов, где каждый объект - это задача (элемент списка).

Создаем атом списка `todoListState` с помощью функции `atom()`:

```js
const todoListState = atom({
  key: 'todoListState',
  default: []
})
```

Мы передаем атому уникальный ключ и устанавливаем пустой массив в качестве дефолтного значения. Для извлечения значений из атома мы используем хук `useRecoilValue()` в компоненте `TodoList`:

```js
function TodoList() {
  const todos = useRecoilValue(todoListState)

  return (
    <>
      <TodoListStats />
      <TodoListFilters />
      <TodoItemCreator />

      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  )
}
```

Для создания новой задачи необходимо получить функцию-сеттер для обновления состояния `todoListState`. Для этого в компоненте `TodoListCreator` воспользуемся хуком `useSetRecoilState()`:

```js
function TodoItemCreator() {
  const [text, setText] = useState('')
  const setTodos = useSetRecoilState(todoListState)

  const addTodo = () => {
    const trimmed = text.trim()

    if (!trimmed) return

    const newTodo = {
      id: getId(),
      text: trimmed,
      isComplete: false
    }

    setTodos((oldTodos) => oldTodos.concat(newTodo))
  }

  const changeText = ({target: {value}}) => {
    setText(value)
  }

  return (
    <div>
      <input type="text" value={text} onChange={changeText} />
      <button onClick={addTodo}>Add</button>
    </div>
  )
}

// утилита для генерации уникального ID
let id = 0
const getId = () => id++
```

*Обратите внимание*, что мы используем обновляющую форму сеттера, поэтому имеем возможность создать новый список на основе старого.

Компонент `TodoItem` будет отображать значение элемента списка, позволяя изменять текст задачи и удалять ее из списка. Для извлечения значения из `todoListState` и получения сеттера для обновления текста, выполнения и удаления задачи мы снова используем `useRecoilState()`:

```js
function TodoItem({ todo }) {
  const [todos, setTodos] = useRecoilState(todoListState)

  const { id, text, isComplete } = todo

  const toggleTodo = () => {
    const newTodos = todos.map(todo => todo.id === id ? {...todo, isComplete: !todo.isComplete} : todo)

    setTodos(newTodos)
  }

  const updateTodo = ({target: {value}}) => {
    const trimmed = value.trim()

    if (!trimmed) return

    const newTodos = todos.map(todo => todo.id === id ? {...todo, text: value} : todo)

    setTodos(newTodos)
  }

  const deleteTodo = () => {
    const newTodos = todos.filter(todo => todo.id !== id)

    setTodos(newTodos)
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={isComplete}
        onChange={toggleTodo}
      />
      <input type="text" value={text} onChange={updateTodo} />
      <button onClick={deleteTodo}>X</button>
    </div>
  )
}
```

### Селекторы

Селектор представляет собой часть производного состояния.

Производное состояние - мощная концепция, позволяющая динамически генерировать данные на основе других данных. В контексте списка задач следующие данные являются производными:

- Отфильтрованный список задач: является производным от оригинального списка посредством создания нового списка с задачами, отфильтрованными по определенному критерию (такому как отметка о выполнении)
- Статистика списка задач: является производным от оригинального списка посредством вычисления полезных атрибутов списка, таких как общее количество задач в списке, количество и процент выполненных задач

Для реализации отфильтрованного списка необходимо выбрать критерий, значение которого может быть сохранено в атоме. Мы будет использовать следующие фильтры: "Show All", "Show Completed" и "Show Active". Значением по умолчанию будет "Show All":

```js
const todoListFilterState = atom({
  key: 'todoListFilterState',
  default: 'Show All'
})
```

С помощью `todoListFilterState` и `todoListState` мы можем создать селектор `filteredTodoListState`, генерирующий отфильтрованный список:

```js
const filteredTodoListState = selector({
  key: 'filteredTodoListState',
  get: ({ get }) => {
    const filter = get(todoListFilterState)
    const todos = get(todoListState)

    switch (filter) {
      case 'Show Completed':
        return todos.filter(todo => todo.isComplete)
      case 'Show Active':
        return todos.filter(todo => !todo.isComplete)
      default:
        return todos
    }
  }
})
```

`filteredTodoListState` имеет две зависимости: `todoListFilterState` и `todoListState`: селектор повторно вычисляется при изменении любой из них.

Для того, чтобы отображать отфильтрованный список задач, необходимо внести небольшое изменение в компонент `TodoList`:

```js
function TodoList() {
  const todos = useRecoilValue(filteredTodoListState)

  return (
    <>
      <TodoListStats />
      <TodoListFilters />
      <TodoItemCreator />

      {todos.map((todo) => (
        <TodoItem todo={todo} key={todo.id} />
      ))}
    </>
  )
}
```

*Обратите внимание*, что в UI отображаются все задачи, поскольку дефолтным значением `todoListFilterState` является "Show All". Для того, чтобы иметь возможность изменять фильтр, необходимо реализовать компонент `TodoListFilters`:

```js
function TodoListFilters() {
  const [filter, setFilter] = useRecoilState(todoListFilterState)

  const changeFilter = ({target: {value}}) => {
    setFilter(value)
  }

  return (
    <>
      <span>Фильтр:</span>
      <select value={filter} onChange={updateFilter}>
        <option value="Show All">Все</option>
        <option value="Show Completed">Выполненные</option>
        <option value="Show Active">Активные</option>
      </select>
    </>
  )
}
```

С помощью нескольких строк кода иы реализовали фильтрацию списка задач! Аналогичный подход будет использован для реализации компонента `TodoListStats`.

Мы хотим отображать следующую статистику:

- Общее количество задач
- Количество выполненных задач
- Количество активных задач
- Процент выполненных задач

Мы могли бы создать селектор для каждого значения, но проще создать один селектор, возвращающий объект со всеми данными. Мы назовем его `todoListStatsState`:

```js
const todoListStatsState = selector({
  key: 'todoListStatsState',
  get: ({ get }) => {
    const todos = get(todoListState)
    const total = todos.length
    const completed = todos.filter((todo) => todo.isComplete).length
    const active = total - completed
    const percent = total === 0 ? 100 : Math.round((active / total) * 100) + '%'

    return {
      total,
      completed,
      active,
      percent
    }
  }
})
```

Для извлечения значений из `todoListStatsState` мы снова воспользуемся `useRecoilValue()`:

```js
function TodoLIstStats() {
  const {
    total,
    completed,
    active,
    percent
  } = useRecoilValue(todoListStatsState)

  return (
    <ul>
      <li>Общее количество задач: {total}</li>
      <li>Количество выполненных задач: {completed}</li>
      <li>Количество активных задач: {active}</li>
      <li>Процент выполненных задач: {percent}</li>
    </ul>
  )
}
```

Таким образом, мы легко и просто реализовали список задач, отвечающий всем заявленным требованиям.

## Асинхронное получение данных

`Recoil` обеспечивает возможность связывать состояние и производное состояние с компонентами через граф потока данных. При этом, функции графа могут быть асинхронными. Это позволяет использовать асинхронные функции в синхронном методе `render()` компонентов. `Recoil` позволяет смешивать синхронные и асинхронные функции в графе потока данных селекторов. Для этого достаточно вернуть промис вместо значения в колбеке `get()` селектора. Поскольку асинхронные селекторы остаются селекторами, другие селекторы могут полагаться на них для дальнейшего преобразования данных.

*Обратите внимание*, что селекторы являются "идемпотентными" функциями: для указанного набора входных данных они всегда должны возвращать одинаковый результат (по крайней мере, в течение жизненного цикла приложения). Это важно, поскольку вычисления селекторов могут кэшироваться, перезапускаться или выполняться несколько раз. Учитывая изложенное, селекторы - это хороший способ моделирования доступных только для чтения запросов к базам данных. Для мутируемых данных можно использовать `Query Refresh`, а для синхронизации мутируемого состояния, сохранения состояния или выполнения других побочных эффектов - экспериментальный `Atom Effects API`.

### Синхронный пример

Ниже приводится пример синхронного получения имени пользователя с помощью атома и селектора:

```js
const currentUserIDState = atom({
  key: 'CurrentUserID',
  default: 1,
})

const currentUserNameState = selector({
  key: 'CurrentUserName',
  get: ({get}) => {
    return tableOfUsers[get(currentUserIDState)].name
  },
})

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameState)
  return <div>{userName}</div>
}

function MyApp() {
  return (
    <RecoilRoot>
      <CurrentUserInfo />
    </RecoilRoot>
  )
}
```

### Асинхронный пример

Если имя пользователя хранится в БД, нам требуется строка запроса (query). Все, что нам нужно сделать, это вернуть промис или воспользоваться асинхронной функцией. При изменении любой зависимости селектор будет вычислен повторно и выполнит новый запрос. Результаты кэшируются, поэтому запрос будет выполнен только один раз для каждого случая.

```js
const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async ({get}) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    })
    return response.name
  },
})

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameQuery)
  return <div>{userName}</div>
}
```

Интерфейс селектора остается прежним, поэтому использующему его компоненту не нужно заботиться о том, с чем он имеет дело, с синхронным состоянием атома, производным состоянием селектора или асинхронным запросом.

Однако, поскольку функция `render()` является синхронной, может получиться так, что компонент будет отрендерен до разрешения промиса. `Recoil` специально спроектирован для работы с `React Suspense` для обработки данных, находящихся на стадии получения. Оборачивание компонента в предохранитель `Suspense` позволит отображать резервный UI до получения данных:

```js
function MyApp() {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>Загрузка...</div>}>
        <CurrentUserInfo />
      </React.Suspense>
    </RecoilRoot>
  )
}
```

### Обработка ошибок

Но что если запрос завершился ошибкой? Селекторы могут выбрасывать исключения, которые будут переданы дальше при попытке компонента использовать это значение. Такие исключения могут быть обработаны с помощью `ErrorBoundary` (предохранителя). Например:

```js
const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async ({get}) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    })
    if (response.error) {
      throw response.error
    }
    return response.name
  },
})

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameQuery)
  return <div>{userName}</div>
}

function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Загрузка...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  )
}
```

### Запросы с параметрами

Порой может потребоваться отправить запрос с дополнительными параметрами, не зависящими от производного состояния. Например, может потребоваться отправить запрос на основе пропов компонента. Это можно сделать с помощью утилиты `selectorFamily()`:

```js
const userNameQuery = selectorFamily({
  key: 'UserName',
  get: userID => async () => {
    const response = await myDBQuery({userID})
    if (response.error) {
      throw response.error
    }
    return response.name
  },
})

function UserInfo({userID}) {
  const userName = useRecoilValue(userNameQuery(userID))
  return <div>{userName}</div>
}

function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Загрузка...</div>}>
          <UserInfo userID={1}/>
          <UserInfo userID={2}/>
          <UserInfo userID={3}/>
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  )
}
```

### Граф потока данных

Моделируя запросы в виде селекторов, мы можем смешивать состояние, производное состояние и запросы. При обновлении состояния, граф автоматически обновляется, что приводит к повторному рендерингу компонентов.

В приведенном ниже примере рендерится имя текущего пользователя и список его друзей. При клике по имени одного из друзей, он становится текущим пользователем, а имя и список автоматически обновляются:

```js
const currentUserIDState = atom({
  key: 'CurrentUserID',
  default: null,
})

const userInfoQuery = selectorFamily({
  key: 'UserInfoQuery',
  get: userID => async () => {
    const response = await myDBQuery({userID})
    if (response.error) {
      throw response.error
    }
    return response
  },
})

const currentUserInfoQuery = selector({
  key: 'CurrentUserInfoQuery',
  get: ({get}) => get(userInfoQuery(get(currentUserIDState))),
})

const friendsInfoQuery = selector({
  key: 'FriendsInfoQuery',
  get: ({get}) => {
    const {friendList} = get(currentUserInfoQuery)
    return friendList.map(friendID => get(userInfoQuery(friendID)))
  },
})

function CurrentUserInfo() {
  const currentUser = useRecoilValue(currentUserInfoQuery)
  const friends = useRecoilValue(friendsInfoQuery)
  const setCurrentUserID = useSetRecoilState(currentUserIDState)
  return (
    <div>
      <h1>{currentUser.name}</h1>
      <ul>
        {friends.map(friend =>
          <li key={friend.id} onClick={() => setCurrentUserID(friend.id)}>
            {friend.name}
          </li>
        )}
      </ul>
    </div>
  )
}

function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Загрузка...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  )
}
```

### Параллельные запросы

В приведенном примере `friendsInfoQuery` использует запрос для получения информации о каждом друге. Это происходит в цикле. Если поисковая таблица небольшая, тогда все в порядке. Если вычисления являются дорогими, тогда можно использовать утилиту `waitForAll()` для одновременного выполнения запросов. Данная вспомогательная функция принимает массив и именованый объект зависимостей:

```js
const friendsInfoQuery = selector({
  key: 'FriendsInfoQuery',
  get: ({ get }) => {
    const { friendList } = get(currentUserInfoQuery)
    const friends = get(waitForAll(
      friendList.map(friendID => userInfoQuery(friendID))
    ))
    return friends
  },
})
```

Для дополнительного обновления UI частичными данными можно использовать `waitForNone()`:

```js
const friendsInfoQuery = selector({
  key: 'FriendsInfoQuery',
  get: ({ get }) => {
    const { friendList } = get(currentUserInfoQuery)
    const friendLoadables = get(waitForNone(
      friendList.map(friendID => userInfoQuery(friendID))
    ))
    return friendLoadables
      .filter(({state}) => state === 'hasValue')
      .map(({contents}) => contents)
  },
})
```

### Предварительные запросы

В целях повышения производительности можно выполнять запросы перед рендерингом. Изменим приведенный выше пример для получения информации о следующем пользователе сразу после нажатия пользователем соответствующей кнопки:

```js
function CurrentUserInfo() {
  const currentUser = useRecoilValue(currentUserInfoQuery)
  const friends = useRecoilValue(friendsInfoQuery)

  const changeUser = useRecoilCallback(({snapshot, set}) => userID => {
    snapshot.getLoadable(userInfoQuery(userID)) // предварительный запрос
    set(currentUserIDState, userID) // меняем текущего пользователя для начала нового рендеринга
  })

  return (
    <div>
      <h1>{currentUser.name}</h1>
      <ul>
        {friends.map(friend =>
          <li key={friend.id} onClick={() => changeUser(friend.id)}>
            {friend.name}
          </li>
        )}
      </ul>
    </div>
  )
}
```

### Запрос дефолтных значений атома

Обычно, атомы используются для хранения локального обновляемого состояния. Однако, для запроса дефолтных значений атома можно использовать селектор:

```js
const currentUserIDState = atom({
  key: 'CurrentUserID',
  default: selector({
    key: 'CurrentUserID/Default',
    get: () => fetchCurrentUserID(),
  }),
})
```

### Асинхронные запросы без `React Suspense`

Для обработки асинхронный запросов, находящихся на стадии разрешения, не обязательно использовать `Suspense`. Вместо этого, для определения статуса в процессе рендеринга можно использовать хук `useRecoilValueLoadable()`:

```js
function UserInfo({userID}) {
  const userNameLoadable = useRecoilValueLoadable(userNameQuery(userID))
  switch (userNameLoadable.state) {
    case 'hasValue':
      return <div>{userNameLoadable.contents}</div>
    case 'loading':
      return <div>Загрузка...</div>
    case 'hasError':
      throw userNameLoadable.contents
  }
}
```

### Обновление запроса

При использовании селекторов для моделирования запросов данных, важно помнить о том, что вычисление селектора всегда должно заканчиваться предоставлением согласованного значения для соответствующего состояния. Селекторы представляют состояние, производное от состояния атома или другого селектора. Поэтому селекторы должны быть идемпотентными по отношению к входным данным, поскольку они могут кэшироваться и выполняться неоднократно. На практике это означает, что один и тот же селектор не должен использоваться для выполнения запроса, когда мы ожидаем, что результаты будут разными в зависимости от жизненного цикла приложения.

Существует несколько паттернов для работы с мутирующими данными:

#### Использование идентификатора запроса

Вычисление селектора должно завершаться согласованным значением для определенного состояния на основе входных данных (зависимое состояние или параметры семьи (family parameters)). Поэтому в селектор можно добавлять ID запроса в качестве параметра семьи или зависимости:

```js
const userInfoQueryRequestIDState = atomFamily({
  key: 'UserInfoQueryRequestID',
  default: 0,
})

const userInfoQuery = selectorFamily({
  key: 'UserInfoQuery',
  get: userID => async ({get}) => {
    get(userInfoQueryRequestIDState(userID)) // Добавляем ID запроса в качестве зависимости
    const response = await myDBQuery({userID})
    if (response.error) {
      throw response.error
    }
    return response
  },
})

function useRefreshUserInfo(userID) {
  setUserInfoQueryRequestID = useSetRecoilState(userInfoQueryRequestIDState(userID))
  return () => {
    setUserInfoQueryRequestID(requestID => requestID + 1)
  }
}

function CurrentUserInfo() {
  const currentUserID = useRecoilValue(currentUserIDState)
  const currentUserInfo = useRecoilValue(userInfoQuery(currentUserID))
  const refreshUserInfo = useRefreshUserInfo(currentUserID)

  return (
    <div>
      <h1>{currentUser.name}</h1>
      <button onClick={refreshUserInfo}>Обновить</button>
    </div>
  )
}
```

#### Использование атома

Другой возможностью является использование атома вместо селектора для моделирования результатов запроса. Это позволяет императивно обновлять состояние атома новыми результатами запроса на основе выбранной стратегии обновления:

```js
const userInfoState = atomFamily({
  key: 'UserInfo',
  default: userID => fetch(userInfoURL(userID)),
})

// Компонент для обновления запроса
function RefreshUserInfo({userID}) {
  const refreshUserInfo = useRecoilCallback(({set}) => async id => {
    const userInfo = await myDBQuery({userID})
    set(userInfoState(userID), userInfo)
  }, [userID])

  // Обновлять информацию о пользователе каждую секунду
  useEffect(() => {
    const intervalID = setInterval(refreshUserInfo, 1000)
    return () => clearInterval(intervalID)
  }, [refreshUserInfo])

  return null
}
```

Одним из недостатков данного подхода является то, что в настоящее время атомы не поддерживают получение промиса в качестве нового значения, поэтому отсутствует возможность использовать `Suspense` в ожидании разрешения запроса.

## Атомарные эффекты (Atom Effects)

Атомарные эффекты - это новый экспериментальный API для управления побочными эффектами и инициализации атомов. Он может использоваться для сохранения, синхронизации состояния, управления историей, логгирования и т.д. Атомарные эффекты определяются как часть определения атома, поэтому каждый атом может иметь собственные эффекты. Данный API находится в разработке, поэтому помечен как `_UNSTABLE`.

Атомарные эффекты подключаются к атомам с помощью опции `effects_UNSTABLE`. Каждый атом может иметь массив эффектов, которые вызываются при инициализации атома. Атомы инициализируются при первом использовании в `RecoilRoot`, но могут инициализироваться повторно после очистки. Атомарный эффект может возвращать обработчик очистки (cleanup handler) для выполнения побочных эффектов, связанных с очисткой:

```js
const myState = atom({
  key: 'MyKey',
  default: null,
  effects_UNSTABLE: [
    () => {
      ...effect1...
      return () => ...cleanup effect1...
    },
    () => { ...effect2... }
  ]
})
```

Семьи атомов также поддерживают параметризованные и непараметризованные эффекты:

```js
const myStateFamily = atomFamily({
  key: 'MyKey',
  default: null,
  effects_UNSTABLE: param => [
    () => {
      ...effect1, использующий параметр...
      return () => ...cleanup effect 1...
    },
    () => { ...effect2, использующий параметр... },
  ],
})
```

#### Сравнение с эффектами `React`

Атомарные эффекты могут быть реализованы с помощью `useEffect()`. Тем не менее, атомы создаются за пределами контекста `React`, поэтому управлять эффектами из React-компонентов может быть непросто, особенно в случае динамически создаваемых атомов. Данный подход также нельзя использоваться для инициализации начального значения атома или при рендеринге на стороне сервера. Использование атомарных эффектов также позволяет держать определение атома и его эффектов в одном месте:

```js
const myState = atom({key: 'Key', default: null})

function MyStateEffect(): {
  const [value, setValue] = useRecoilState(myState)
  useEffect(() => {
    // Эффект запускается при изменении значения атома
    store.set(value)
    store.onChange(setValue)
    return () => { store.onChange(null) } // Эффект очистки
  }, [value])
  return null
}

function MyApp(): {
  return (
    <div>
      <MyStateEffect />
    </div>
  )
}
```

#### Сравнение со снимками (snapshots)

API хуков снимка (shapshot hooks) также позволяет следить за изменениями состояния атома, а проп `initializeState` в `RecoilRoot` позволяет устанавливать начальное значение атома при первоначальном рендеринге. Тем не менее, данный API следит за всеми изменениями состояния и может быть неудобным для управления динамическими атомами или их семьями. Атомарные эффекты позволяют определять эффекты каждого атома раздельно, независимо комбинируя разные стратегии.

### Примеры

#### Логгирование изменений состояния атома

Простой пример использования атомарных эффектов для логгирования изменений состояния атома:

```js
const currentUserIDState = atom({
  key: 'CurrentUserID',
  default: null,
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet(newID => {
        console.debug('ID текущего пользователя: ', newID)
      })
    },
  ],
})
```

#### Сохранение истории изменений

Более сложный пример логгирования. В данном примере используется эффект для работы с очередью истории (history queue) изменений состояния с колбеком для отмены определенного изменения:

```js
const history = []

const historyEffect = name => ({ setSelf, onSet }) => {
  onSet((newValue, oldValue) => {
    history.push({
      label: `${name}: ${JSON.serialize(oldValue)} -> ${JSON.serialize(newValue)}`,
      undo: () => {
        setSelf(oldValue)
      },
    })
  })
}

const userInfoState = atomFamily({
  key: 'UserInfo',
  default: null,
  effects_UNSTABLE: userID => [
    historyEffect(`Информация о пользователе: ${userID}`),
  ],
})
```

#### Синхронизация состояния

Атомы можно использовать для локального кэширования значения другого состояния, полученного из БД, локального хранилища (local storage) и т.д. Для установки дефолтного значения атома можно использовать свойство `default` с селектором для получения значения из хранилища. Тем не менее, это можно сделать лишь раз. При обновлении значения в хранилище значение атома не изменится. Атомарные эффекты позволяют подписываться на хранилище и обновлять значение атома при любом изменении этого хранилища. Вызов `setSelf()` из эффекта инициализирует атом этим значением и будет использоваться для первоначального рендеринга. При сбросе атома, он вернется к дефолтному значению:

```js
const syncStorageEffect = userID => ({ setSelf, trigger }) => {
  // Инициализируем атом значением из удаленного хранилища состояния
  if (trigger === 'get') { // Предотвращаем дорогую инициализацию
    setSelf(myRemoteStorage.get(userID)) // Синхронная инициализация
  }

  // Подписываемся на удаленное хранилище и обновляем значение атома
  myRemoteStorage.onChange(userID, userInfo => {
    setSelf(userInfo) // Синхронное обновление значения
  })

  // Отписываемся от хранилища
  return () => {
    myRemoteStorage.onChange(userID, null)
  }
}

const userInfoState = atomFamily({
  key: 'UserInfo',
  default: null,
  effects_UNSTABLE: userID => [
    historyEffect(`Информация о пользователе: ${userID}`),
    syncStorageEffect(userID),
  ],
})
```

#### Запись через кэш

Мы также можем реализовать синхронизацию атома с удаленным хранилищем: изменения на сервере будут приводить к обновлению атома, и наоборот.

```js
const syncStorageEffect = userID => ({ setSelf, onSet, trigger }) => {
  // Инициализируем атом значением из удаленного хранилища состояния
  if (trigger === 'get') { // Предотвращаем дорогую инициализацию
    setSelf(myRemoteStorage.get(userID)) // Синхронная инициализация
  }

  // Подписываемся на удаленное хранилище и обновляем значение атома
  myRemoteStorage.onChange(userID, userInfo => {
    setSelf(userInfo) // Синхронное обновление значения
  })

  // Подписываемся на локальные изменения и обновляем значение на сервере
  onSet(userInfo => {
    myRemoteStorage.set(userID, userInfo)
  })

  // Отписываемся от хранилища
  return () => {
    myRemoteStorage.onChange(userID, null)
  }
}
```

#### Использование локального хранилища

Атомарные эффекты могут использоваться для сохранения состояния атома в локальном хранилище браузера. `localStorage` является синхронным, поэтому мы можем извлекать из него данные без `async/await` и промисов.

*Обратите внимание*, что приводимый ниже пример намеренно упрощен и не охватывает всех возможных случаев:

```js
const localStorageEffect = key => ({ setSelf, onSet }) => {
  const savedValue = localStorage.getItem(key)
  if (savedValue != null) {
    setSelf(JSON.parse(savedValue))
  }

  onSet(newValue => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  })
}

const currentUserIDState = atom({
  key: 'CurrentUserID',
  default: 1,
  effects_UNSTABLE: [
    localStorageEffect('current_user'),
  ]
})
```

## Основные части API


### RecoilRoot

Предоставляет контекст, из которого атомы получают значения. Должен быть предком любого компонента, в котором используются хуки `Recoil`. В приложении может быть несколько `RecoilRoot`: атомы будут иметь разные значения из каждого. Совпадающие значения внешнего `root` перезаписывают значения внутреннего.

#### Пропы

- `initializeState()` - опциональная функция, принимающая `MutableSnapshot` для инициализации состояния атома. Данная функция устанавливает состояние только для первоначального рендеринга и не может использоваться для обновления состояния или асинхронной инициализации. Для асинхронного обновления состояния следует использовать хуки `useSetRecoilState()` или `useRecoilCallback()`

`RecoilRoot` представляет независимого провайдера/хранилище состояния атома. *Обратите внимание*, что кэши, например, кэши селекторов могут распределяться между несколькими `root`.

#### Пример

```js
import { RecoilRoot } from 'recoil'

function AppRoot() {
  return (
    <RecoilRoot>
      <ComponentThatUsesRecoil />
    </RecoilRoot>
  )
}
```

### Atom

Атом представляет часть состояния. Функция `atom()` возвращает доступный для записи объект `RecoilState`:

```js
function atom({
  key: string,
  default: any,
  effects_UNSTABLE?: array,
  dangerouslyAllowMutability?: bool
})
```

- `key` - уникальная строка, используемая для идентификации атома. Данная строка должна быть уникальной по сравнению с другими атомами и селекторами в приложении
- `default` - начальное значение атома либо промис, либо другой атом или селектор, возвращающие такое значение
- `effects_UNSTABLE` - опциональный массив атомарных эффектов
- `dangerouslyAllowMutability` - позволяет мутировать объекты, находящиеся в атомах и не приводящие к изменению состояния

`Recoil` следит за изменениями состояния атома для уведомления подписанных на него компонентов о необходимости повторного рендеринга, поэтому для обновления состояния атома следует использовать указанные ниже хуки. Прямое мутирование объектов, хранящихся в атоме, может привести к пропуску уведомления, поэтому в режиме разработки `Recoil` замораживает (freeze) такие объекты.

Чаще всего для взаимодействия с атомами используются следующие хуки:

- `useRecoilState()` - используется для чтения и записи значений в атом. Данный хук неявно осуществляет подписку компонента на атом
- `useRecoilValue()` - используется для чтения значений из атома. Данный хук также осуществляет подписку компонента на атом
- `useSetRecoilState()` - используется для записи значений в атом
- `useResetRecoilState()` - используется для сброса атома к дефолтному значению

Для чтения значения из атома без подписки используется хук `useRecoilCallback()`.

Атом можно инициализировать статическим значением или промисом, или `RecoilValue`, представляющим значением аналогичного типа. Поскольку промис может находиться на стадии разрешения или дефолтный селектор может быть асинхронным, значение атома также может находиться на стадии разрешения или выбрасывать исключение. *Обратите внимание*, что мы не можем напрямую присваивать промис при определении атома. Для асинхронных функций следует использовать селекторы.

#### Пример

```js
import { atom, useRecoilState } from 'recoil'

const counter = atom({
  key: 'myCounter',
  default: 0,
})

function Counter() {
  const [count, setCount] = useRecoilState(counter)
  const incrementByOne = () => setCount(count + 1)

  return (
    <div>
      Значение счетчика: {count}
      <br />
      <button onClick={incrementByOne}>Увеличить</button>
    </div>
  )
}
```

### Selector

Селектор - это функция, возвращающая производное состояние. Эта функция является "чистой", она не имеет побочных эффектов и всегда возвращает одинаковое значение для одинакового набора передаваемых зависимых значений. Если указана только функция `get()`, селектор является доступным только для чтения и возвращает объект `RecoilValueReadOnly`. Если также указана функция `set()`, возвращается доступный для записи объект `RecoilState`.

```js
function selector({
  key: string,
  get: ({ get }) => {},
  set?: ({
    get,
    set,
    reset
  }, newValue) => {},
  dangerouslyAllowMutability?: bool
})
```

- `key` - уникальная строка для идентификации селектора. Должна быть стабильной между выполнениями, если используется для сохранения состояния
- `get` - функция, вычисляющая значение производного состояния. Может возвращать значение или асинхронный промис, а также другой атом или селектор, представляющие значения аналогичного типа. В качестве первого параметра ей передается объект со следующими свойствами:
  - `get` - функция, используемая для извлечения значений из другого атома/селектора. Все атомы/селекторы, переданные в функцию, будут неявно добавлены в список зависимостей данного селектора. При изменении любой зависимости, селектор повторно вычисляется
- `set` - при установке этого свойства селектор возвращает состояние, доступное для записи. В функцию передается объект с колбеками и новое входящее значение. Колбеки:
  - `get` - функция, используемая для извлечения значений из других атомов/селекторов. Данная функция не подписывает селектор на указанные атомы/селекторы
  - `set` - функция, используемая для установки значений внешнего состояния. Первый параметр - это состояние, второй - новое значение. Новым значением может быть функция обновления или объект `DefaultValue`  при сбросе селектора
- `dangerouslyAllowMutability` - позволяет мутировать объекты, находящиеся в атомах и не приводящие к изменению состояния

Селектор с простой статической зависимостью:

```js
const mySelector = selector({
  key: 'MySelector',
  get: ({ get }) => get(myAtom) * 100,
})
```

#### Динамические зависимости

Доступный только для чтения селектор имеет метод `get()`, который вычисляет значение селектора на основе зависимостей. При обновлении любой зависимости селектор вычисляется заново. Зависимости динамически определяются на основе атомов и селекторов, которые используются при вычислении селектора. На основе значений предыдущих зависимостей можно динамически использовать дополнительные зависимости. `Recoil` автоматически обновляет текущий граф потока данных, поэтому селектор подписывается на обновления только текущего набора зависимостей.

В следующем примере `mySelector` зависит от атома `toggleState`, а также от `selectorA` и `selectorB`, зависящих от состояния `toggleState`:

```js
const toggleState = atom({ key: 'Toggle', default: false })

const mySelector = selector({
  key: 'MySelector',
  get: ({ get }) => {
    const toggle = get(toggleState)
    if (toggle) {
      return get(selectorA)
    } else {
      return get(selectorB)
    }
  },
})
```

#### Селекторы, доступные для записи

Двунаправленный (bi-directional) селектор принимает входящее значение в качестве параметра и может использовать его для передачи изменений во внешний граф потока данных. Поскольку пользователь может как передать в селектор новое значение, так и сбросить селектор, входящим значением может быть значение, аналогичное значению, представляемому селектором, или объект `DefaultValue`, представляющий операцию сброса.

Данный селектор добавляет в атом дополнительное поле. Это поле передается через операции `set()` и `reset()` во внешний атом:

```js
const proxySelector = selector({
  key: 'ProxySelector',
  get: ({ get }) => ({...get(myAtom), extraField: 'привет'}),
  set: ({ set }, newValue) => set(myAtom, newValue),
})
```

Данный селектор преобразует данные, поэтому необходимо проверить, является ли входящее значение дефолтным:

```js
const transformSelector = selector({
  key: 'TransformSelector',
  get: ({ get }) => get(myAtom) * 100,
  set: ({ set }, newValue) =>
    set(myAtom, newValue instanceof DefaultValue ? newValue : newValue / 100),
})
```

#### Асинхронные селекторы

Для вычисления производного состояния селекторы также могут использовать асинхронные функции и возвращать промис в качестве результирующего значения:

```js
const myQuery = selector({
  key: 'MyQuery',
  get: async ({ get }) => {
    return await myAsyncQuery(get(queryParamState))
  }
})
```

#### Примеры

Синхронный:

```js
import { atom, selector, useRecoilState, DefaultValue } from 'recoil'

const tempFahrenheit = atom({
  key: 'tempFahrenheit',
  default: 32,
})

const tempCelsius = selector({
  key: 'tempCelsius',
  get: ({ get }) => ((get(tempFahrenheit) - 32) * 5) / 9,
  set: ({ set }, newValue) =>
    set(
      tempFahrenheit,
      newValue instanceof DefaultValue ? newValue : (newValue * 9) / 5 + 32
    ),
})

function TempCelsius() {
  const [tempF, setTempF] = useRecoilState(tempFahrenheit)
  const [tempC, setTempC] = useRecoilState(tempCelsius)
  const resetTemp = useResetRecoilState(tempCelsius)

  const addTenCelsius = () => setTempC(tempC + 10)
  const addTenFahrenheit = () => setTempF(tempF + 10)
  const reset = () => resetTemp()

  return (
    <div>
      Температура (по Целью): {tempC}
      <br />
      Температура (по Фаренгейту): {tempF}
      <br />
      <button onClick={addTenCelsius}>Добавить 10 градусов Цельсия</button>
      <br />
      <button onClick={addTenFahrenheit}>Добавить 10 градусов Фаренгейта</button>
      <br />
      <button onClick={reset}>>Сбросить значение</button>
    </div>
  )
}
```

Асинхронный:

```js
import { selector, useRecoilValue } from 'recoil'

const myQuery = selector({
  key: 'MyDBQuery',
  get: async () => {
    const response = await fetch(getMyRequestUrl())
    return response.json()
  },
})

function QueryResults() {
  const queryResults = useRecoilValue(myQuery)

  return (
    <div>
      {queryResults.foo}
    </div>
  )
}

function ResultsSection() {
  return (
    <React.Suspense fallback={<div>Загрузка...</div>}>
      <QueryResults />
    </React.Suspense>
  )
}
```

###  Loadable

Объект `Loadable` представляет текущее состояние атома или селектора. Это состояние может быть доступным значением, состоянием ошибки или стадией разрешения асинхронной операции. Интерфейс `Loadable`:

- `state` - текущее состояние атома или селектора. Возможные значения: `hasValue`, `hasError` или `loading`
- `contents` - значение `Loadable`. Если состоянием является `hasValue`, то `contents` является значением атома или селектора. Если состоянием является `hasError`, выбрасывается объект `Error`. Если состоянием является `loading`, можно использовать `toPromise()` для получения промиса значения

`Loadable` также содержит вспомогательные функции для получения текущего состояния. *Обратите внимание*, данный API является нестабильным:

- `getValue()` - метод для получения значения, отвечающего семантике `Suspense` и селекторов
- `toPromise()` - возвращает промис, разрешающийся при разрешении селектора. Если селектор является синхронным или уже разрешен, возвращается промис, который разрешается незамедлительно
- `valueMaybe()` - возвращает значение, если оно доступно, или `undefined`
- `valueOrThrow()` - возвращает доступное значение или выбрасывает исключение
- `map()` - принимает функцию для преобразования значения `Loadable` и возвращает новый `Loadable` с преобразованным значением. Функция преобразования принимает значение и возвращает новое значение

#### Пример

```js
function UserInfo({userID}) {
  const userNameLoadable = useRecoilValueLoadable(userNameQuery(userID))

  switch (userNameLoadable.state) {
    case 'hasValue':
      return <div>{userNameLoadable.contents}</div>
    case 'loading':
      return <div>Загрузка...</div>
    case 'hasError':
      throw userNameLoadable.contents
  }
}
```

### useRecoilState

Возвращает пару, где первый элемент - это значение состояния, а второй - сеттер для обновления этого значения. Сеттеру в качестве аргумента передается новое значение или функция обновления, получающая предыдущее значение в качестве параметра.

Данный хук неявно подписывает компонент на указанное состояние. Это означает, что компонент будет перерисовываться при любом изменении этого состояния.

```js
function useRecoilState(state) {}
```

- `state` - атом или доступный для записи селектор

Данный API похож на хук `useState()`, за исключением того, что он в качестве аргумента принимает состояние `Recoil` вместо дефолтного значения.

Этот хук рекомендуется использовать для чтения и записи значений состояния в компоненте.

#### Пример

```js
import { atom, selector, useRecoilState } from 'recoil'

const tempFahrenheit = atom({
  key: 'tempFahrenheit',
  default: 32,
})

const tempCelsius = selector({
  key: 'tempCelsius',
  get: ({ get }) => ((get(tempFahrenheit) - 32) * 5) / 9,
  set: ({ set }, newValue) => set(tempFahrenheit, (newValue * 9) / 5 + 32),
})

function TempCelsius() {
  const [tempF, setTempF] = useRecoilState(tempFahrenheit)
  const [tempC, setTempC] = useRecoilState(tempCelsius)

  const addTenCelsius = () => setTempC(tempC + 10)
  const addTenFahrenheit = () => setTempF(tempF + 10)

  return (
    <div>
      Температура (по Целью): {tempC}
      <br />
      Температура (по Фаренгейту): {tempF}
      <br />
      <button onClick={addTenCelsius}>Добавить 10 градусов Цельсия</button>
      <br />
      <button onClick={addTenFahrenheit}>Добавить 10 градусов Фаренгейта</button>
      <br />
      <button onClick={reset}>>Сбросить значение</button>
    </div>
  )
}
```

### useRecoilValue

Возвращает значение переданного состояния.

Данный хук неявно подписывает компонент на указанное состояние.

```js
function useRecoilValue(state) {}
```

- `state` - атом или селектор

Этот хук рекомендуется использовать для чтения значений состояния из компонента.

#### Пример

```js
import { atom, selector, useRecoilValue } from 'recoil'

const namesState = atom({
  key: 'namesState',
  default: ['', 'John', 'Alice', '', 'Bob'],
})

const filteredNamesState = selector({
  key: 'filteredNamesState',
  get: ({ get }) => get(namesState).filter((str) => str !== ''),
})

function NameDisplay() {
  const names = useRecoilValue(namesState)
  const filteredNames = useRecoilValue(filteredNamesState)

  return (
    <>
      Исходные имена: {names.join(',')}
      <br />
      Отфильтрованные имена: {filteredNames.join(',')}
    </>
  )
}
```

### useSetRecoilState

Возвращает сеттер для обновления значения доступного для записи состояния.

```js
function useSetRecoilState(state) {}
```

- `state` - доступное для записи состояние (атом или доступный для записи селектор)

Этот хук является рекомендуемым для обновления значения состояния. В отличие от `useRecoilState()`, он не подписывает компонент на указанное состояние.

#### Пример

```js
import { atom, useSetRecoilState } from 'recoil'

const namesState = atom({
  key: 'namesState',
  default: ['John', 'Alice', 'Bob'],
})

function FormContent({setNamesState}) {
  const [name, setName] = useState('')

  return (
    <>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setNamesState(names => [...names, name])}>Добавить имя</button>
    </>
)}

// Данный компонент будет отрендерен только при монтировании
function Form() {
  const setNamesState = useSetRecoilState(namesState)

  return <FormContent setNamesState={setNamesState} />
}
```

### useResetRecoilState

Возвращает функцию, сбрасывающую значение переданного состояния к дефолтному значению.

Данный хук не подписывает компонент на указанное состояние.

```js
function useResetRecoilState(state) {}
```

- `state` - доступное для записи состояние

#### Пример

```js
import { todoListState } from "../atoms/todoListState"

const TodoResetButton = () => {
  const resetList = useResetRecoilState(todoListState)

  return <button onClick={resetList}>Выполнить сброс</button>
}
```

### useRecoilStateLoadable

Данный хук предназначен для чтения и записи значений асинхронных селекторов. Он неявно подписывает компонент на указанное состояние.

В отличие от `useRecoilState()`, этот хук не возвращает ошибку или промис при чтении асинхронного селектора. Он возвращает объект `Loadable` для значения вместе с сеттером.

```js
function useRecoilStateLoadable(state) {}
```

- `state` - доступные для записи атом или селектор, которые могут иметь некоторые асинхронные операции. Статус возвращаемого `Loadable` зависит от статуса переданного селектора

#### Пример

```js
function UserInfo({ userID }) {
  const [userNameLoadable, setUserName] = useRecoilStateLoadable(userNameQuery(userID))

  switch (userNameLoadable.state) {
    case 'hasValue':
      return <div>{userNameLoadable.contents}</div>
    case 'loading':
      return <div>Загрузка...</div>
    case 'hasError':
      throw userNameLoadable.contents
  }
}
```

### useRecoilValueLoadable

Данный хук предназначен только для чтения значений асинхронных селекторов. Он неявно подписывает компонент на указанное состояние.

В отличие от `useRecoilValue()`, этот хук не возвращает ошибку или промис при чтении асинхронного селектора. Он возвращает объект `Loadable`.

```js
function useRecoilValueLoadable(state) {}
```

- `state` - доступные для чтения атом или селектор, которые могут иметь некоторые асинхронные операции. Статус возвращаемого `Loadable` зависит от статуса переданного селектора

#### Пример

```js
function UserInfo({userID}) {
  const userNameLoadable = useRecoilValueLoadable(userNameQuery(userID))
  switch (userNameLoadable.state) {
    case 'hasValue':
      return <div>{userNameLoadable.contents}</div>
    case 'loading':
      return <div>Загрузка...</div>
    case 'hasError':
      throw userNameLoadable.contents
  }
}
```

### isRecoilValue

Возвращает `true`, если переданное значение является атомом или селектором. В противном случае, возвращается `false`.

```js
const isRecoilValue = (value) => bool
```

#### Пример

```js
import { atom, isRecoilValue } from 'recoil'

const counter = atom({
  key: 'myCounter',
  default: 0,
})

const strCounter = selector({
  key: 'myCounterStr',
  get: ({ get }) => String(get(counter)),
})

isRecoilValue(counter) // true
isRecoilValue(strCounter) // true

isRecoilValue(5) // false
isRecoilValue({}) // false
```

### useRecoilCallback

Данный хук похож на `useCallback()`, но позволяет колбекам работать с состоянием `Recoil`. Он позволяет создавать колбеки, которые имеют доступ к `Snapshot` и возможность асинхронно обновлять состояние.

Случаи использования:

- Асинхронное чтение состояния без подписки компонента на атом или селектор
- Отложенное выполнение дорогого поиска
- Выполнение побочных эффектов, связанных с чтением или записью состояния
- Динамическое обновление атома или селектора, когда во время рендеринга мы не знаем, какой атом или селектор хотим обновить, поэтому не можем использовать `useSetRecoilState()`
- Предварительное получение данных перед рендерингом

```js
function useRecoilCAllback(callback, deps) {}
```

- `callback` - пользовательский колбек с функцией-оберткой, предоставляющей интерфейс колбека. Колбеки для обновления состояния помещаются в очередь для асинхронного обновления текущего состояния
- `deps` - опциональный набор зависимостей для мемоизации. Подобно `useCallback()`, колбек не мемоизируется по умолчанию, при каждом рендеринге возвращается новая функция. Если передать пустой массив, то всегда будет возвращаться один и тот же экземпляр функции. При передаче массива зависимостей, колбек повторно вычисляется при изменении любой из них.

Интерфейс колбека:

- `snapshot` - `Snapshot`, предоставляющий доступный только для чтения снимок состояния атома
- `gotoSnapshot` - внеочередное обновление глобального состояния для совпадения с указанным `Snapshot`
- `set` - внеочередная установка значения атома или селектора
- `reset` - сброс значения атома или селектора к дефолтному

#### Пример "ленивого" чтения состояния

```js
import { atom, useRecoilCallback } from 'recoil'

const itemsInCart = atom({
  key: 'itemsInCart',
  default: 0,
})

function CartInfoDebug() {
  const logCartItems = useRecoilCallback(({ snapshot }) => async () => {
    const numItemsInCart = await snapshot.getPromise(itemsInCart)
    console.log('Количество товаров в корзине: ', numItemsInCart)
  })

  return (
    <div>
      <button onClick={logCartItems}>Показать количество товаров в корзине</button>
    </div>
  )
}
```

## Утилиты

### atomFamily

Возвращает функцию, возвращающую доступный для чтения атом.

```js
function atomFamily({
  key: string,
  default: any,
  effects_UNSTABLE?: array | func,
  dangerouslyAllowMutability?: bool
}) {}
```

- `key` - уникальная строка для идентификации атома
- `default` - начальное значение атома. Это может быть обычное значение, `RecoilValue` или промис, представляющие дефолтное значение, или функция для получения такого значения. Колбек получает копию параметра, используемого при вызове функции `atomFamily()`
- `effects_UNSTABLE` - опциональный массив атомарных эффектов или функция для получения такого массива
- `dangerouslyAllowMutability` - позволяет мутировать объекты, находящиеся в атоме, но не обновляющие состояние

Атом представляет часть состояния. Атом создается и регистрируется для `RecoilRoot` приложения. Но что если состояние не является глобальным? Что если состояние связано с определенным элементом? Например, наше приложение может представлять собой инстурмент для прототипирования UI, где пользователь может динамически добавлять элементы, и каждый элемент имеет состояние, такое как его позиция на странице. В идеале, каждый элемент должен иметь собственный атом состояния. Это можно реализовать с помощью паттерна мемоизации самостоятельно. Но `Recoil` предоставляет готовое решение в виде утилиты `atomFamily()`. Она представляет коллекцию атомов. При вызове `atomFamily()` возвращается функция, предоставляющая атом `RecoilState` на основе переданных параметров.

`atomFamily()` связывает параметр с атомом. Ей передается ключ, который используется для генерации уникальных ключей всех атомов. Ключи атомов могут использоваться для их сохранения, поэтому они должны быть стабильными в процессе выполнения приложения. В отношении параметров применяется сравнение по значению, а не по ссылке. Это снимает ограничения на типы, которые могут использоваться в качестве параметров. `atomFamily()` принимает примитивы, массивы или объекты, которые сами могут содержать массивы, объекты и примитивы.

#### Пример

```js
const elementPositionStateFamily = atomFamily({
  key: 'ElementPosition',
  default: [0, 0],
})

function ElementListItem({elementID}) {
  const position = useRecoilValue(elementPositionStateFamily(elementID))
  return (
    <div>
      Элемент: {elementID}
      Позиция: {position}
    </div>
  )
}
```

`atomFamily()` принимает почти такие же параметры, что и `atom()`. Тем не менее, дефолтное значение может быть параметризовано. Это означает, что ей может передаваться функция, принимающая значение и возвращающая новое значение. Например:

```js
const myAtomFamily = atomFamily({
  key: 'MyAtom',
  default: param => defaultBasedOnParam(param),
})
```

Вместо `selector()` можно использовать `selectorFamily()`. Это позволяет получить доступ к значению параметра в дефолтном селекторе:

```js
const myAtomFamily = atomFamily({
  key: 'MyAtom',
  default: selectorFamily({
    key: 'MyAtom/Default',
    get: param => ({ get }) => {
      return computeDefaultUsingParam(param)
    },
  }),
})
```

#### Подписки

Одно из преимуществ использования данного паттерна состоит в возможности создания атома для каждого элемента вместо хранения одного атома с состоянием всех элементов. Это позволяет управлять индивидуальными подписками, когда повторно рендерится только компонент, подписанный на конкретный атом.

### selectorFamily

Возвращает функцию, возвращающую доступный только для чтения селектор `RecoilValueReadOnly` или доступный для записи селектор `RecoilState`.

`selectorFamily` - мощный паттерн, похожий на `selector()`, но позволяющий передавать параметры в колбеки `get()` и `set()`. Данная утилита возвращает функцию, которая может быть вызвана с пользовательскими параметрами, и возвращает селектор. Каждое уникальное значение параметра возвращает одинаковый мемоизированный экземпляр селектора.

```js
function selectorFamily({
  key: string,
  get: param => ({ get }) => {},
  set?: param => ({
    get,
    set,
    reset
  }, newValue) => {},
  dangerouslyAllowMutability?: bool
}) {}
```

- `key` - уникальная строка для идентификации селектора
- `get` - функция, которой передается объект с именованными колбеками, возвращающая значение селектора. Оборачивается в функцию, которой передается параметр из вызова функции `selectorFamily()`
- `set` - опциональная функция, генерирующая доступные для записи селекторы

`selectorFamily()` связывает параметр и селектор. Поскольку может возникнуть необходимость в использовании одних и тех параметров в разных селекторах, параметры сравниваются по значениям, а не по ссылке. Это снимает ограничения типов, которые могут использоваться для параметров.

#### Пример

```js
const myNumberState = atom({
  key: 'MyNumber',
  default: 2,
})

const myMultipliedState = selectorFamily({
  key: 'MyMultipliedNumber',
  get: (multiplier) => ({get}) => {
    return get(myNumberState) * multiplier
  },

  // опциональный set
  set: (multiplier) => ({set}, newValue) => {
    set(myNumberState, newValue / multiplier)
  },
})

function MyComponent() {
  // по умолчанию равняется 2
  const number = useRecoilValue(myNumberState)

  // по умолчанию равняется 200
  const multipliedNumber = useRecoilValue(myMultipliedState(100))

  return <div>...</div>
}
```

#### Пример асинхронного запроса

Семьи селекторов также полезны для передачи параметров в запросы. *Обратите внимание*, что селектор, используемый для абстрагирования запросов, должен быть "чистой" функцией:

```js
const myDataQuery = selectorFamily({
  key: 'MyDataQuery',
  get: (queryParameters) => async ({get}) => {
    const response = await asyncDataRequest(queryParameters)
    if (response.error) {
      throw response.error
    }
    return response.data
  },
})

function MyComponent() {
  const data = useRecoilValue(myDataQuery({userID: 132}))
  return <div>...</div>
}
```

#### Пример деструктуризации

```js
const formState = atom({
  key: 'formState',
  default: {
    field1: "1",
    field2: "2",
    field3: "3",
  },
})

const formFieldState = selectorFamily({
  key: 'FormField',
  get: field => ({ get }) => get(formState)[field],
  set: field => ({ set }, newValue) =>
    set(formState, prevState => {...prevState, [field]: newValue}),
})

const Component1 = () => {
  const [value, onChange] = useRecoilState(formFieldState('field1'))
  return (
    <>
      <input value={value} onChange={onChange} />
      <Component2 />
    </>
  )
}

const Component2 = () => {
  const [value, onChange] = useRecoilState(formFieldState('field2'))
  return (
    <input value={value} onChange={onChange} />
  )
}
```

### noWait

Помощник селектора, возвращающий `Loadable` для текущего состояния, предоставленного атомом или селектором.

Данный помощник может использоваться для получения текущего состояния потенциально асинхронной зависимости. При этом, возвращается только значение. Он похож на `useRecoilValueLoadable()`, за исключением того, что это селектор, а не хук. Поскольку `noWait()` возвращает селектор, он может использоваться другими селекторами и хуками.

#### Пример

```js
const myQuery = selector({
  key: 'MyQuery',
  get: ({ get }) => {
    const loadable = get(noWait(dbQuerySelector))

    return {
      hasValue: { data: loadable.contents },
      hasError: { error: loadable.contents },
      loading: { data: 'Загрузка...' },
    }[loadable.state]
  }
})
```

### waitForAll

Помощник, позволяющий производить одновременное вычисление нескольких асинхронных зависимостей.

Зависимости могут передаваться в виде массива кортежей или как именованные зависимости в объекте.

Поскольку данный помощник передается в качестве селектора, он может использоваться хуками `Recoil` в компонентах `React`, в качестве зависимости в селекторе `Recoil` и везде, где используется состояние `Recoil`.

#### Примеры

```js
function FriendsInfo() {
  const [friendA, friendB] = useRecoilValue(
    waitForAll([friendAState, friendBState])
  )
  return (
    <div>
      Имя первого друга: {friendA.name}
      Имя второго друга: {friendB.name}
    </div>
  )
}
```

```js
const friendsInfoQuery = selector({
  key: 'FriendsInfoQuery',
  get: ({ get }) => {
    const {friendList} = get(currentUserInfoQuery)
    const friends = get(waitForAll(
      friendList.map(friendID => userInfoQuery(friendID))
    ))
    return friends
  },
})
```

```js
const customerInfoQuery = selectorFamily({
  key: 'CustomerInfoQuery',
  get: id => ({ get }) => {
    const {info, invoices, payments} = get(waitForAll({
      info: customerInfoQuery(id),
      invoices: invoicesQuery(id),
      payments: paymentsQuery(id),
    }))

    return {
      name: info.name,
      transactions: [
        ...invoices,
        ...payments,
      ],
    }
  },
})
```

### waitForNone

Помощник, возвращающий набор `Loadable` для текущего состояния запрошенных зависимостей.

Зависимости могут передаваться в виде массива кортежей или как именованные зависимости в объекте.

`waitForNone()` похож на `waitForAll()`, за исключением того, что он незамедлительно возвращает `Loadable` для каждой зависимости вместо значений. Он также похож на `noWait()`, но позволяет запрашивать несколько зависимостей за раз.

Данный помощник может быть полезен для работы с частичными данными или для частичного обновления UI по мере того, как данные становятся доступными.

#### Пример частичной загрузки

В следующем примере мы рендерим диаграмму, состоящую из нескольких частей (слоев). Каждый слой выполняет потенциально дорогой запрос данных. Сама диаграмма рендерится моментально, для каждой части, которая находится в процессе загрузки, используются спиннеры, части независимо обновляются по мере загрузки. Если при загрузке какого-либо слоя будет выброшено исключение, то для данного слоя будет выведено сообщение об ошибке, рендеринг остальных частей продолжится:

```js
function MyChart({ layerQueries }) {
  const layerLoadables = useRecoilValue(waitForNone(layerQueries))

  return (
    <Chart>
      {layerLoadables.map((layerLoadable, i) => {
        switch (layerLoadable.state) {
          case 'hasValue':
            return <Layer key={i} data={layerLoadable.contents} />
          case 'hasError':
            return <LayerErrorBadge key={i} error={layerLoadable.contents} />
          case 'loading':
            return <LayerWithSpinner key={i} />
        }
      })}
    </Chart>
  )
}
```

### Snapshot

Объект `Snapshot` представляет иммутабельный снимок состояния атомов. Он предназначен для наблюдения, инспектирования и управления глобальным состоянием. Он может быть полезен для инструментов разработчика, синхронизации глобального состояния, истории навигации и т.д.

#### Получение снимков

##### Хуки

`Recoil` предоставляет следующие хуки для получения снимков на основе текущего состояния:

- `useRecoilCallback()` - асинхронный доступ к снимку
- `useRecoilSnapshot()` - синхронный доступ к снимку
- `useRecoilTransactionObserver_UNSTABLE()` - подписка на снимки всех изменений состояния

##### Создание снимка

Свежий снимок также можно получить с помощью фабрики `snapshot_UNSTABLE`, принимающей опциональную функцию инициализации. Это может использоваться для тестировангия или вычисления селекторов за пределами контекста `React`.

#### Чтение снимков

Снимки доступны только для чтения по сравнению с состоянием. Они могут использоваться для чтения состояния атома и вычисления производного состояния селектора. `getLoadable()` предоставляет `Loadable` с состоянием атома или селектора в снимке. `getPromise()` может использоваться для ожидания вычисления значения асинхронных селекторов, поэтому мы можем видеть, каким будет значение на основе статического состояния атома.

#### Пример

```js
function MyComponent() {
  const logState = useRecoilCallback(({snapshot}) => () => {
    console.log('Состояние: ', snapshot.getLoadable(myAtom).contents)

    const newSnapshot = snapshot.map(({set}) => set(myAtom, 42))
  })
}
```

#### Преобразование снимков

Может возникнуть ситуация, когда требуется мутировать снимок. Несмотря на то, что снимки являются иммутабельными, они обладают методами для пеобразования самих себя в новые иммутабельные снимки. Данные методы принимают колбек, которому передается `MutableSnapshot`, который изменяется с помощью колбека и становится новым снимком.

#### Переход к снимку

Для перехода к снимку из текущего состояния используется следующий хук:

- `useGotoRecoilSnapshot()` - обновляет текущее состояние для совпадения со снимком

#### Инструменты разработчика

Снимки предоставляют некоторые методы, которые могут быть полезными при отладке приложения, использующего `Recoil`. Данный API находится в разработке, поэтому помечен как `_UNSTABLE`.

#### Инициализация состояния

Компонент `RecoilRoot` и фабрика `snapshot_UNSTABLE()` принимают опциональный проп `initializeState` для инициализации начального состояния через `MutableSnapshot`. Это может быть полезным для загрузки сохраненного состояния, а также для обеспечения совместимости с рендерингом на стороне сервера:

```js
function MyApp() {
  function initializeState({set}) {
    set(myAtom, 'foo')
  }

  return (
    <RecoilRoot initializeState={initializeState}>
      ...
    </RecoilRoot>
  )
}
```