---
slug: jest-testing
title: Тестируем React-компоненты с помощью Jest и Testing Library
description: Туториал по тестированию React-компонентов с помощью Jest и Testing Library
authors: harryheman
tags: [react.js, reactjs, react, jest, testing library]
---

Привет, друзья!

В данном туториале мы будем тестировать компоненты на [React](https://ru.reactjs.org/) с помощью [Jest](https://jestjs.io/ru/) и [Testing Library](https://testing-library.com/).

Список основных задач, которые мы решим на протяжении туториала:

1. Создание шаблона `React-приложения` с помощью [Vite](https://vitejs.dev/).
2. Создание компонента для получения приветствия от сервера.
3. Установка и настройка `Jest`.
4. Установка и настройка `Testing Library`.
5. Тестирование компонента с помощью `Testing Library`:
   1. Используя стандартные возможности.
   2. С помощью кастомного рендера.
   3. С помощью кастомных запросов.
6. Тестирование компонента с помощью снимков `Jest`.

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-testing).

<!--truncate-->

## Создание шаблона

_Обратите внимание_: для работы с зависимостями я буду использовать [Yarn](https://yarnpkg.com/).

`Vite` - это продвинутый сборщик модулей (bundler) для `JavaScript-приложений`. Он более производительный и не менее кастомизируемый, чем [Webpack](https://webpack.js.org/).

`Vite CLI` позволяет создавать готовые к разработке проекты, в том числе, с помощью некоторых шаблонов.

Создаем шаблон `React-приложения`:

```bash
# react-testing - название проекта
# --template react - используемый шаблон
yarn vite create react-testing --template react
```

Переходим в созданную директорию и устанавливаем зависимости:

```bash
cd react-testing
yarn
```

Убедиться в работоспособности приложения можно, выполнив команду `yarn dev`.

Приводим структуру проекта к следующему виду:

```
- node_modules
- src
  - App.jsx
  - main.jsx
- .gitignore
- index.html
- package.json
- vite.config.js
- yarn.lock
```

`{ task: 'setup project', status: 'done' }`

## Создание компонента

Для обращения к `API` мы будем использовать [Axios](https://github.com/axios/axios):

```javascript
yarn add axios
```

Создаем в директории `src` файл `FetchGreeting.jsx` следующего содержания:

```javascript
import { useState } from 'react'
import axios from 'axios'

// пропом компонента является адрес конечной точки
// для получения приветствия от сервера
const FetchGreeting = ({ url }) => {
  // состояние приветствия
  const [greeting, setGreeting] = useState('')
  // состояние ошибки
  const [error, setError] = useState(null)
  // состояние нажатия кнопки
  const [btnClicked, setBtnClicked] = useState(false)

  // метод для получения приветствия от сервера
  const fetchGreeting = (url) =>
    axios
      .get(url)
      // если запрос выполнен успешно
      .then((res) => {
        const { data } = res
        const { greeting } = data
        setGreeting(greeting)
        setBtnClicked(true)
      })
      // если возникла ошибка
      .catch((e) => {
        setError(e)
      })

  // текст кнопки
  const btnText = btnClicked ? 'Готово' : 'Получить приветствие'

  return (
    <div>
      <button onClick={() => fetchGreeting(url)} disabled={btnClicked}>
        {btnText}
      </button>
      {/* если запрос выполнен успешно */}
      {greeting && <h1>{greeting}</h1>}
      {/* если возникла ошибка */}
      {error && <p role='alert'>Не удалось получить приветствие</p>}
    </div>
  )
}

export default FetchGreeting
```

`{ task: 'create component', status: 'done' }`

## Установка и настройка Jest

Устанавливаем `Jest`:

```bash
yarn add jest
```

По умолчанию средой для тестирования является [Node.js](https://nodejs.org/), поэтому нам потребуется еще один пакет:

```bash
yarn add jest-environment-jsdom
```

Создаем в корне проекта файл `jest.config.js` (настройки `Jest`) следующего содержания:

```javascript
module.exports = {
  // среда тестирования - браузер
  testEnvironment: 'jest-environment-jsdom',
}
```

Для транспиляции кода перед запуском тестов `Jest` использует [Babel](https://babeljs.io/). Поскольку мы будем работать с [JSX](https://ru.reactjs.org/docs/introducing-jsx.html) нам потребуется два "пресета":

```bash
yarn add @babel/preset-env @babel/preset-react
```

Создаем в корне проекта файл `babel.config.js` (настройки `Babel`) следующего содержания:

```javascript
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
}
```

Настройка `runtime: 'automatic'` добавляет `React` в глобальную область видимости, что позволяет не импортировать его явно в каждом файле.

Дефолтной директорией с тестами для `Jest` является `__tests__`. Создаем эту директорию в корне проекта.

Создаем в директории `__tests__` файл `fetch-greeting.test.jsx` следующего содержания:

```javascript
test.todo('получение приветствия')
```

Объекты `describe`, `test`, `expect` и другие импортируются в пространство модуля `Jest`. Почитать об этом можно [здесь](https://jestjs.io/ru/docs/api) и [здесь](https://jestjs.io/ru/docs/expect).

`test.todo(name: string)` - это своего рода заглушка для теста, который мы собираемся писать.

Добавляем в раздел `scripts` файла `package.json` команду для запуска тестов:

```json
"test": "jest"
```

Выполняем эту команду с помощью `yarn test`:

<img src="https://habrastorage.org/webt/8r/1p/zm/8r1pzmcimtjnlg4v-jpsnejdm3g.png" />
<br />

Получаем в терминале нашу "тудушку" и сообщение об успешном выполнении "теста".

Кажется, что можно приступать к тестированию компонента. Почти, есть один нюанс.

Дело в том, что `Jest` спроектирован для работы с `Node.js` и не поддерживает `ESM` из коробки. Более того, поддержка `ESM` является экспериментальной и в будущем может претерпеть некоторые изменения. Почитать об этом можно [здесь](https://jestjs.io/ru/docs/ecmascript-modules).

Для того, чтобы все работало, как ожидается, нужно сделать 2 вещи.

Можно определить в `package.json` тип кода как модуль (`"type": "module"`), но это сломает `Vite`. Можно изменить расширение файла с тестом на `.mjs`, но мне такой вариант не нравится. А можно сообщить `Jest` расширения файлов, которые следует обрабатывать как `ESM`:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  // !
  extensionsToTreatAsEsm: ['.jsx'],
}
```

Также необходимо каким-то образом передать `Jest` флаг `--experimental-vm-modules`. Существует несколько способов это сделать, но наиболее подходящим с точки зрения обеспечения совместимости с разными ОС является следующий:

1. Устанавливаем [cross-env](https://www.npmjs.com/package/cross-env) с помощью `yarn add cross-env`.
2. Редактируем команду для запуска тестов:

```json
"test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest"
```

`{ task: 'setup jest', status: 'done' }`

## Установка и настройка Testing Library

Устанавливаем обертку `Testing Library` для `React`:

```bash
yarn add @testing-library/react
```

Для обеспечения интеграции с `Jest` нам также потребуется следующий пакет:

```bash
yarn add @testing-library/jest-dom
```

Для тестирования отправки запроса на сервер и получения от него приветствия необходим фиктивный (mock) сервер. Одним из самых простых решений для этого является [msw](https://www.npmjs.com/package/msw):

```bash
yarn add msw
```

`{ task: 'setup testing library', status: 'done' }`

## Тестирование компонента с помощью Testing Library

### Стандартные возможности

Реализуем тестирование компонента с помощью стандартных возможностей, предоставляемых `Testing Library`.

Начнем с импорта зависимостей:

```javascript
// msw
import { rest } from 'msw'
import { setupServer } from 'msw/node'
// см. ниже
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
// см. ниже
import '@testing-library/jest-dom'
// компонент
import FetchGreeting from '../src/FetchGreeting'
```

Создаем фиктивный сервер:

```javascript
const server = setupServer(
  rest.get('/greeting', (req, res, ctx) =>
    res(ctx.json({ greeting: 'Привет!' }))
  )
)
```

В ответ на `GET HTTP-запрос` сервер будет возвращать объект с ключом `greeting` и значением `Привет!`.

Определяем глобальные хуки:

```javascript
// запускаем сервер перед выполнением тестов
beforeAll(() => server.listen())
// сбрасываем обработчики к дефолтной реализации после каждого теста
afterEach(() => server.resetHandlers())
// останавливаем сервер после всех тестов
afterAll(() => server.close())
```

Мы напишем 2 теста:

- для получения приветствия и его рендеринга;
- для обработки ошибки сервера.

Поскольку тестируется один и тот же функционал, имеет смысл сгруппировать тесты с помощью `describe`:

```javascript
describe('получение приветствия', () => {
  // todo
})
```

Начнем с теста для получения приветствия и его рендеринга:

```javascript
test('-> успешное получение и отображение приветствия', async function () {
  // рендерим компонент
  // https://testing-library.com/docs/react-testing-library/api/#render
  render(<FetchGreeting url='/greeting' />)

  // имитируем нажатие кнопки для отправки запроса
  // https://testing-library.com/docs/dom-testing-library/api-events#fireevent
  //
  // screen привязывает (bind) запросы к document.body
  // https://testing-library.com/docs/queries/about/#screen
  fireEvent.click(screen.getByText('Получить приветствие'))

  // ждем рендеринга заголовка
  // https://testing-library.com/docs/dom-testing-library/api-async/#waitfor
  await waitFor(() => screen.getByRole('heading'))

  // текстом заголовка должно быть `Привет!`
  expect(screen.getByRole('heading')).toHaveTextContent('Привет!')
  // текстом кнопки должно быть `Готово`
  expect(screen.getByRole('button')).toHaveTextContent('Готово')
  // кнопка должна быть заблокированной
  expect(screen.getByRole('button')).toBeDisabled()
})
```

О запросах типа `getByRole` можно почитать [здесь](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor), а список всех стандартных запросов можно найти [здесь](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries).

О кастомных сопоставлениях (matchers), которыми `@testing-library/jest-dom` расширяет объект `expect` из `Jest` можно почитать [здесь](https://github.com/testing-library/jest-dom#custom-matchers).

Перед тем, как приступать к реализации теста для обработки ошибки сервера установим еще один пакет:

```javascript
yarn add @testing-library/user-event
```

Данный пакет рекомендуется использовать для имитации пользовательских событий (типа нажатия кнопки) вместо `fireEvent`. Почитать об этом можно [здесь](https://testing-library.com/docs/ecosystem-user-event/).

```javascript
// `it` - синоним `test`
it('-> обработка ошибки сервера', async () => {
  // после этого сервер в ответ на запрос
  // будет возвращать ошибку со статус-кодом `500`
  server.use(rest.get('/greeting', (req, res, ctx) => res(ctx.status(500))))

  // рендерим компонент
  render(<FetchGreeting url='greeting' />)

  // имитируем нажатие кнопки
  // рекомендуемый подход
  // https://testing-library.com/docs/user-event/setup
  const user = userEvent.setup()
  // если не указать `await`, тогда `Testing Library`
  // не успеет обернуть обновление состояния компонента
  // в `act` и мы получим предупреждение в терминале
  await user.click(screen.getByText('Получить приветствие'))

  // ждем рендеринга сообщения об ошибке
  await waitFor(() => screen.getByRole('alert'))

  // текстом сообщения об ошибке должно быть `Не удалось получить приветствие`
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Не удалось получить приветствие'
  )
  // кнопка не должна быть заблокированной
  expect(screen.getByRole('button')).not.toBeDisabled()
})
```

Запускаем тесты с помощью команды `yarn test`:

<img src="https://habrastorage.org/webt/dl/jk/ja/dljkja7s6byv2soluupu587ovri.png" />
<br />

`{ task: 'default testing', status: 'done' }`

### Кастомный рендер

Предположим, что мы хотим распределить состояние приветствия между несколькими компонентами, например, с помощью провайдера.

Создаем в директории `src` файл `GreetingProvider.jsx` следующего содержания:

```javascript
import { createContext, useContext, useReducer } from 'react'

// начальное состояние
const initialState = {
  error: null,
  greeting: null
}

// константы
const SUCCESS = 'SUCCESS'
const ERROR = 'ERROR'

// редуктор
function greetingReducer(state, action) {
  switch (action.type) {
    case SUCCESS:
      return {
        error: null,
        greeting: action.payload
      }
    case ERROR:
      return {
        error: action.payload,
        greeting: null
      }
    default:
      return state
  }
}

// создатель операций
const createGreetingActions = (dispatch) => ({
  setSuccess(success) {
    dispatch({
      type: SUCCESS,
      payload: success
    })
  },
  setError(error) {
    dispatch({
      type: ERROR,
      payload: error
    })
  }
})

// контекст
const GreetingContext = createContext()

// провайдер
export const GreetingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(greetingReducer, initialState)

  const actions = createGreetingActions(dispatch)

  return (
    <GreetingContext.Provider value={{ state, actions }}>
      {children}
    </GreetingContext.Provider>
  )
}

// кастомный хук
export const useGreetingContext = () => useContext(GreetingContext)
```

Оборачиваем компонент `FetchGreeting` провайдером в файле `App.jsx`:

```jsx
import { GreetingProvider } from './GreetingProvider'
import FetchGreeting from './FetchGreeting'

function App() {
  return (
    <div className='App'>
      <GreetingProvider>
        <FetchGreeting url='/greeting' />
      </GreetingProvider>
    </div>
  )
}

export default App
```

Редактируем `FetchGreeting.jsx`:

```javascript
import { useState } from 'react'
import axios from 'axios'
import { useGreetingContext } from './GreetingProvider'

const FetchGreeting = ({ url }) => {
  // извлекаем состояние и операции из контекста
  const { state, actions } = useGreetingContext()
  const [btnClicked, setBtnClicked] = useState(false)

  const fetchGreeting = (url) =>
    axios
      .get(url)
      .then((res) => {
        const { data } = res
        const { greeting } = data
        // !
        actions.setSuccess(greeting)
        setBtnClicked(true)
      })
      .catch((e) => {
        // !
        actions.setError(e)
      })

  const btnText = btnClicked ? 'Готово' : 'Получить приветствие'

  return (
    <div>
      <button onClick={() => fetchGreeting(url)} disabled={btnClicked}>
        {btnText}
      </button>
      {/* ! */}
      {state.greeting && <h1 data-cy='heading'>{state.greeting}</h1>}
      {state.error && <p role='alert'>Не удалось получить приветствие</p>}
    </div>
  )
}

export default FetchGreeting
```

Для того, чтобы не оборачивать явно каждый тестируемый компонент в провайдеры, из которых он потребляет тот или иной контекст (состояние, тема, локализация и т.д.), предназначен [кастомный рендер](https://testing-library.com/docs/react-testing-library/setup#custom-render).

Создаем в корне проекта директорию `testing`. В этой директории создаем файл `test-utils.jsx` следующего содержания:

```javascript
import { render } from '@testing-library/react'
import { GreetingProvider } from '../src/GreetingProvider'

// все провайдеры приложения
const AllProviders = ({ children }) => (
  <GreetingProvider>{children}</GreetingProvider>
)

// кастомный рендер
const customRender = (ui, options) =>
  render(ui, {
    // обертка для компонента
    wrapper: AllProviders,
    ...options
  })

// повторно экспортируем `Testing Library`
export * from '@testing-library/react'
// перезаписываем метод `render`
export { customRender as render }
```

Для того, чтобы иметь возможность импортировать кастомный рендер просто из `test-utils` необходимо сделать 2 вещи:

1. Сообщить `Jest` названия директорий с модулями:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.jsx'],
  // !
  moduleDirectories: ['node_modules', 'testing']
}
```

2. Добавить синоним пути в файле `jsconfig.json` (создаем этот файл в корне проекта):

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "test-utils": [
        "./testing/test-utils"
      ]
    }
  }
}
```

Для `TypeScript-проекта` синонимы путей (и другие настройки) определяются в файле `tsconfig.json`.

Редактируем файл `fetch-greeting.test.jsx`:

```javascript
// импортируем стандартные утилиты `Testing Library` и кастомный рендер
import { render, fireEvent, waitFor, screen } from 'test-utils'
```

Запускаем тест с помощью `yarn test` и убеждаемся в том, что тесты по-прежнему выполняются успешно.

`{ task: 'testing with custom render', status: 'done' }`

### Кастомные запросы

Что если нам оказалось недостаточно стандартных запросов, предоставляемых `Testing Library`? Что если мы, например, хотим получать ссылку на `DOM-элемент` с помощью атрибута `data-cy`? Для этого предназначены [кастомные запросы](https://testing-library.com/docs/dom-testing-library/api-custom-queries).

Создаем в директории `testing` файл `custom-queries.js` следующего содержания:

```javascript
import { queryHelpers, buildQueries } from '@testing-library/react'

const queryAllByDataCy = (...args) =>
  queryHelpers.queryAllByAttribute('data-cy', ...args)

const getMultipleError = (c, dataCyValue) =>
  `Обнаружено несколько элементов с атрибутом data-cy: ${dataCyValue}`

const getMissingError = (c, dataCyValue) =>
  `Не обнаружен элемент с атрибутом data-cy: ${dataCyValue}`

// генерируем кастомные запросы
const [
  queryByDataCy,
  getAllByDataCy,
  getByDataCy,
  findAllByDataCy,
  findByDataCy
] = buildQueries(queryAllByDataCy, getMultipleError, getMissingError)

// и экспортируем их
export {
  queryByDataCy,
  queryAllByDataCy,
  getByDataCy,
  getAllByDataCy,
  findByDataCy,
  findAllByDataCy
}
```

Далее кастомные запросы можно внедрить в кастомный рендер:

```javascript
// test-utils.js
import { render, queries } from '@testing-library/react'
import * as customQueries from './custom-queries'

const customRender = (ui, options) =>
  render(ui, {
    wrapper: AllProviders,
    // !
    queries: { ...queries, ...customQueries },
    ...options
  })
```

Определяем атрибут `data-cy` у заголовка в компоненте `FetchGreeting`:

```javascript
{state.greeting && <h1 data-cy='heading'>{state.greeting}</h1>}
```

И получаем ссылку на этот элемент в тесте с помощью кастомного запроса:

```javascript
const { getByDataCy } = render(<FetchGreeting url='/greeting' />)

expect(getByDataCy('heading')).toHaveTextContent('Привет!')
```

Запускаем тест с помощью `yarn test`:

<img src="https://habrastorage.org/webt/vc/of/rb/vcofrb21ynb372ltcsffkjtzzko.png" />
<br />

И получаем ошибку.

Ни в документации `Testing Library`, ни в документации `Jest` данная ошибка не описывается. Как видим, она возникает в файле `node_modules/@testing-library/dom/dist/get-queries-for-element.js`:

```javascript
function getQueriesForElement(element, queries = defaultQueries, initialValue = {}) {
  return Object.keys(queries).reduce((helpers, key) => {
    // получаем запрос по ключу
    const fn = queries[key];
    // и передаем в запрос элемент в качестве аргумента
    // здесь возникает ошибка
    // `fn.bind не является функцией`
    helpers[key] = fn.bind(null, element);
    return helpers;
  }, initialValue);
}
```

Это наводит на мысль, что проблема заключается в наших кастомных запросах. Давайте на них взглянем:

```javascript
// test-utils.jsx
console.log(customQueries)
```

Запускаем тест:

<img src="https://habrastorage.org/webt/bb/kb/dc/bbkbdc5osyg_gs1rykx42yddikm.png" />
<br />

Видим ключ `__esModule` со значением `true`. Свойство `__esModule` функцией не является, поэтому при попытке вызова `bind` на нем выбрасывается исключение. Но откуда оно взялось в нашем модуле?

Коротко о главном:

- `test-utils.jsx` является модулем для тестирования;
- `Jest` автоматически создает "моковые" версии таких модулей - объекты заменяются, `API` сохраняется;
- перед созданием мока код модуля транспилируется с помощью `Babel`;
- `Jest` запускается в режиме поддержки `ESM`, поэтому `Babel` добавляет свойство `__esModule` в каждый мок.

Одним из самых простых способов решения данной проблемы является запрос оригинального модуля (без создания его моковой версии) с помощью метода [requireActual](https://jestjs.io/ru/docs/jest-object#jestrequireactualmodulename) объекта `jest`.

Для того, чтобы иметь возможность использовать этот объект в `ESM`, его следует импортировать из `@jest/globals`:

```bash
yarn add @jest/globals
```

```javascript
import { jest } from '@jest/globals'
// import * as customQueries from './custom-queries'
const customQueries = jest.requireActual('./custom-queries')
```

Запускаем тест. Теперь все работает, как ожидается.

`{ task: 'testing with custom queries', status: 'done' }`

## Тестирование компонента с помощью снимков Jest

Конечно, можно исследовать каждый `DOM-элемент` компонента по отдельности с помощью сопоставлений типа `toHaveTextContent`, но, согласитесь, что это не очень удобно. Легко можно пропустить какой-нибудь элемент или атрибут.

Для исследования текущего состояния всего `UI` за один раз предназначены [снимки](https://jestjs.io/ru/docs/snapshot-testing) (snapshots).

На самом деле, в нашем распоряжении уже имеется все необходимое для тестирования компонента с помощью снимков. Одним из значений, возвращаемых методом `render` является [container](https://testing-library.com/docs/react-testing-library/api/#container-1), который можно передать в метод `expect` и вызвать метод [toMatchSnapshot](https://jestjs.io/ru/docs/expect#tomatchsnapshotpropertymatchers-hint):

```javascript
describe('получение приветствия', () => {
  test('-> успешное получение и отображение приветствия', async function () {
    // получаем контейнер
    const { container, getByDataCy } = render(<FetchGreeting url='/greeting' />)
    // тестируем текущее состояние `UI` с помощью снимка
    expect(container).toMatchSnapshot()

    fireEvent.click(screen.getByText('Получить приветствие'))

    await waitFor(() => screen.getByRole('heading'))
    // состояние `UI` изменилось, поэтому нужен еще один снимок
    expect(container).toMatchSnapshot()

    expect(getByDataCy('heading')).toHaveTextContent('Привет!')
    expect(screen.getByRole('button')).toHaveTextContent('Готово')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('-> обработка ошибки сервера', async () => {
    server.use(rest.get('/greeting', (req, res, ctx) => res(ctx.status(500))))

    // получаем контейнер
    const { container } = render(<FetchGreeting url='greeting' />)
    // снимок 1
    expect(container).toMatchSnapshot()

    const user = userEvent.setup()
    await user.click(screen.getByText('Получить приветствие'))

    await waitFor(() => screen.getByRole('alert'))
    // снимок 2
    expect(container).toMatchSnapshot()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Не удалось получить приветствие'
    )
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
```

Запускаем тест:

<img src="https://habrastorage.org/webt/9f/wi/wj/9fwiwjq7u6kw65civz_rzvmovia.png" />
<br />

При первом выполнении теста, в котором используются снимки, `Jest` генерирует снимки и складывает их в директорию `__snapshots__` в директории с тестом. В нашем случае запуск теста привел к генерации файла `fetch-greeting.test.jsx.snap` следующего содержания:

```javascript
exports[`получение приветствия -> обработка ошибки сервера 1`] = `
<div>
  <div>
    <button>
      Получить приветствие
    </button>
  </div>
</div>
`;

exports[`получение приветствия -> обработка ошибки сервера 2`] = `
<div>
  <div>
    <button>
      Получить приветствие
    </button>
    <p
      role="alert"
    >
      Не удалось получить приветствие
    </p>
  </div>
</div>
`;

exports[`получение приветствия -> успешное получение и отображение приветствия 1`] = `
<div>
  <div>
    <button>
      Получить приветствие
    </button>
  </div>
</div>
`;

exports[`получение приветствия -> успешное получение и отображение приветствия 2`] = `
<div>
  <div>
    <button
      disabled=""
    >
      Готово
    </button>
    <h1
      data-cy="heading"
    >
      Привет!
    </h1>
  </div>
</div>
`;
```

Как видим, снимок правильно отражает все изменения состояния `UI` компонента.

Снова запускаем тест:

<img src="https://habrastorage.org/webt/fw/hx/ht/fwhxhtjtdorbjfxq2xq34dlczbi.png" />
<br />

`{ task: 'snapshot testing', status: 'done' }`

Парочка полезных советов:

- для обновления снимка следует передать флаг [--updateSnapshot](https://jestjs.io/ru/docs/cli#--updatesnapshot) или просто `-u` при вызове `Jest`: `yarn test -u`;
- для указания тестов для выполнения или снимков для обновления при вызове `Jest` можно передать флаг [--testPathPattern](https://jestjs.io/ru/docs/cli#--testpathpatternregex) со значением директории с тестами (в виде строки или регулярного выражения): `yarn test -u --testPathPattern=components/fetchGreeting`.

Для того, чтобы иметь возможность импортировать статику (изображения, шрифты, аудио, видео и т.д.) в тестируемых компонентах, необходимо реализовать [кастомный трансформер](https://jestjs.io/ru/docs/code-transformation) для `Jest`.

Создаем в директории `testing` файл `file-transformer.js` следующего содержания:

```javascript
// формат `CommonJS` в данном случае является обязательным
const path = require('path')

module.exports = {
  process: (sourceText, sourcePath, options) => ({
    code: `module.exports = ${JSON.stringify(path.basename(sourcePath))}`
  })
}
```

И настраиваем трансформацию в файле `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.jsx'],
  moduleDirectories: ['node_modules', 'testing'],
  // !
  transform: {
    // дефолтное значение, в случае кастомизации должно быть указано явно
    '\\.[jt]sx?$': 'babel-jest',
    // трансформация файлов
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/testing/file-transformer.js'
  }
}
```

Благодарю за внимание и happy coding!
