---
sidebar_position: 3
---

# React, Jest, Redux и лучшие практики по React

[Источник](https://github.com/learning-zone/react-interview-questions)&nbsp;&nbsp;👀

# Шпаргалка по React

## Компоненты

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {
  render () {
    return (
      <div className='message-box'>
        Привет, {this.props.name}
      </div>
      )
  }
}
const el = document.body
ReactDOM.render(<Hello name='Иван' />, el)
```

## Компоненты без состояния

```javascript
// Компонент без состояния
const Headline = () => {
  return <h1>Шапргалка по React</h1>
}

// Компонент, получающий пропы
const Greetings = (props) => {
  return <p>Тебе это понравится, {props.name}.</p>
}

// Компонент должен возвращать единственный элемент
const Intro = () => {
  return (
    <div>
     <Headline />
     <p>Добро пожаловать в React!</p>
     <Greetings name="Иван" />
    </div>
  )
}

ReactDOM.render(
 <Intro />,
 document.getElementById('root')
);
```

## Свойства

```javascript
<Video fullscreen={true} autoplay={false} />

render () {
  this.props.fullscreen;

  // Используем `this.props` для доступа к пропам, переданным в компонент
  const { fullscreen, autoplay } = this.props;
}
```

## Состояние

```javascript
constructor(props) {
  super(props)
  this.state = { username: undefined }
}

this.setState({ username: 'Иван' })

render () {
  this.state.username;

  // Используем `this.state` для управления динамическими данными
  const { username } = this.state
}
```

## Потомки

```javascript
<AlertBox>
  <h1>У вас имеются непрочитанные сообщения</h1>
</AlertBox>

class AlertBox extends Component {
  render () {
    return (

      // Потомки передаются в виде пропа `children`
      <div className='alert-box'>
         {this.props.children}
      </div>
    )
  }
}
```

## Вложенность

```javascript
import React, { Component, Fragment } from 'react';

class Info extends Component {
  render () {
    const { avatar, username } = this.props

    return (
      <Fragment>
        <UserAvatar src={avatar} />
        <UserProfile username={username} />
      </Fragment>
    )
  }
}
```

## Функциональные компоненты

До появления хуков функциональные компоненты не могли иметь состояния. Они получали пропы от родительского компонента в качестве первого параметра.

```javascript
function MyComponent ({ name }) {

  return (
    <div className='message-box'>
      Привет, {name}
    </div>
  )
}
```

## Чистые компоненты

Оптимизированная с точки зрения производительности версия `React.Component`.

```javascript
import React, { PureComponent } from 'react';

class MessageBox extends PureComponent {
  ···
}
```

## Монтирование

Устанавливаем начальное состосние в `constructor()`. Добавляем обработчики событий, таймеры и т.п. в `componentDidMount()`, затем удаляем их в `componentWillUnmount()`.

```javascript
constructor (props)	   // Перед рендерингом
componentWillMount()	 // Не рекомендуется использовать
render()	             // Рендеринг
componentDidMount()	   // После рендеринга (DOM доступен)
componentWillUnmount() // Перед удалением из DOM
componentDidCatch()	   // Перехват ошибок
```

## Обновление

Вызывается при изменении состояния или пропов. Не вызывается при первом рендеринге.

```javascript
componentDidUpdate (prevProps, prevState, snapshot)  // При использовании `setState()` не забывайте сравнивать пропы
shouldComponentUpdate (newProps, newState)  // Если возвращается `false`, повторный рандеринг не выполняется
render()  // Рендеринг
componentDidUpdate (prevProps, prevState)  // Выполнение операций с DOM
```

## Хук состояния

```javascript
import React, { useState } from 'react';

function Example() {
  // Хук `useState()` возвращает начальное состояние (`count`) и функцию для его обновления (`setCount`) - геттер и сеттер
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Вы нажали {count} раз</p>
      <button onClick={() => setCount(count + 1)}>
        Нажми на меня
      </button>
    </div>
  );
}
```

## Хук эффекта

Хук `useEffect()` представлет собой сочетание методов жизненного цикла  `componentDidMount()`, `componentDidUpdate()` и `componentWillUnmount()`.

```javascript
import React, { useState, useEffect } from 'react';

function Example() {

  const [count, setCount] = useState(0);

  // Аналогично `componentDidMount()` и `componentDidUpdate()`
  useEffect(() => {
    // Обновляем заголовок документа с помощью браузерного API
    document.title = `Вы нажали ${count} раз`;
  }, [count]);

  return (
    <div>
      <p>Вы нажали {count} раз</p>
      <button onClick={() => setCount(count + 1)}>
        Нажми на меня
      </button>
    </div>
  );
}
```

## Ссылки

Позволяют получить доступ к узлам DOM.

```javascript
class MyComponent extends Component {

  render () {
    return (
      <div>
        <input ref={el => this.input = el} />
      </div>
    )
  }

  componentDidMount () {
    this.input.focus()
  }
}
```

## События

Передаем функции в атрибуты вроде `onChange()`.

```javascript
class MyComponent extends Component {

  render () {
    <input type="text"
        value={this.state.value}
        onChange={event => this.onChange(event)} />
  }

  onChange (event) {
    this.setState({ value: event.target.value })
  }
}
```

## Передача пропов

Передаем `src="..."` в субкомпонент.

```javascript
<VideoPlayer src="video.mp4" />

class VideoPlayer extends Component {
  render () {
    return <VideoEmbed {...this.props} />
  }
}
```

## Стилизация

Встроенные стили

```javascript
const style = { height: 10 }
return <div style={style}></div>
return <div style={{ margin: 0, padding: 0 }}></div>
```

## Условия

```javascript
<Fragment>
  {showMyComponent
    ? <MyComponent />
    : <OtherComponent />}
</Fragment>
```

## Списки

```javascript
class TodoList extends Component {

  render () {
    const { items } = this.props

    return <ul>
      {items.map(item =>
        <TodoItem item={item} key={item.key} />)}
    </ul>
  }
}
```

## Короткие вычисления

```javascript
<Fragment>
  {showPopup && <Popup />}
  ...
</Fragment>
```

## Фрагменты и массивы

```javascript
// Массивы
render () {
  // Не забывайте про ключи
  return [
    <li key="A">Первый элемент</li>,
    <li key="B">Второй элемент</li>
  ]
}

// Фрагменты
render () {
  // Фрагментам не нужны ключи
  return (
    <Fragment>
      <li>Первый элемент</li>
      <li>Второй элемент</li>
    </Fragment>
  )
}
```

## Ошибки

Перехватываем ошибки в `componentDidCatch()`.

```javascript
class MyComponent extends Component {
  ···
  componentDidCatch (error, info) {
    this.setState({ error })
  }
}
```

## Порталы

Позволяют рендерить `this.props.children` в любом узле DOM.

```javascript
render () {
  return React.createPortal(
    this.props.children,
    document.getElementById('menu')
  )
}
```

## Гидратация

Используем `ReactDOM.hydrate()` вместо `ReactDOM.render()`, если рендерим статическую разметку, полученную от сервера.

```javascript
const el = document.getElementById('app')
ReactDOM.hydrate(<App />, el)
```

## PropTypes

Проверка типов.

```javascript
import PropTypes from 'prop-types';
```

|Свойство             |Описание      |
|---------------------|--------------|
|any                  |Что угодно    |
|string               |Строка        |
|number               |Число         |
|func                 |Функция       |
|bool                 |True или false|
|oneOf(any)           |Тип Enum      |
|oneOfType(type array)|Тип Union     |
|array                |Массив        |
|arrayOf(…)	          |Массив типов  |
|object               |Объект        |
|objectOf(…)          |Объект типов  |
|instanceOf(…)        |Экземлпяр     |
|shape(…)             |Форма         |
|element              |React-элемент |
|node                 |Узел DOM      |
|(···).isRequired     |Обязательный  |


## Базовые типы

```javascript
MyComponent.propTypes = {
  email:      PropTypes.string,
  seats:      PropTypes.number,
  callback:   PropTypes.func,
  isClosed:   PropTypes.bool,
  any:        PropTypes.any
}
```

## Обязательные типы

```javascript
MyCo.propTypes = {
  name:  PropTypes.string.isRequired
}
```

## Элементы

```javascript
MyCo.propTypes = {
  // React-элемент
  element: PropTypes.element,

  // Число, строка, элемент или массив
  node: PropTypes.node
}
```

## Перечисления (один из)

```javascript
MyCo.propTypes = {
  direction: PropTypes.oneOf([
    'левый', 'правый'
  ])
}
```

## Пользовательские типы

```javascript
MyCo.propTypes = {
  customProp: (props, key, componentName) => {
    if (!/matchme/.test(props[key])) {
      return new Error('Валидация провалена!')
    }
  }
}
```

## Массивы и объекты

Используем `.arrayOf()`, `.objectOf()`, `.instanceOf()`, `.shape()`.

```javascript
MyCo.propTypes = {
  list: PropTypes.array,
  ages: PropTypes.arrayOf(PropTypes.number),
  user: PropTypes.object,
  user: PropTypes.objectOf(PropTypes.number),
  message: PropTypes.instanceOf(Message)
}
MyCo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    age:  PropTypes.number
  })
}
```

# Шпаргалка по Jest

## Базовая структура теста

```js
describe('Выбор цвета', () => {
  beforeAll(() => {
    /* Запускается перед всеми тестами */
  })
  afterAll(() => {
    /* Запускается после всех тестов */
  })
  beforeEach(() => {
    /* Запускается перед каждым тестом */
  })
  afterEach(() => {
    /* Запускается после каждого теста */
  })

  test('Выбираем цвет', () => {
    const actual = fn(['Alice', 'Bob', 'John'])
    expect(actual).toEqual(['Pink Alice', 'Pink Bob', 'Pink John'])
  })
})
```

## Поиск совпадений

[Использование поиска совпадений](http://jestjs.io/docs/en/using-matchers), [официальная документация](https://facebook.github.io/jest/docs/expect.html)

### Базовый поиск совпадений

```js
expect(42).toBe(42) // Строгое равенство (===)
expect(42).not.toBe(3) // Строгое неравенство (!==)
expect([1, 2]).toEqual([1, 2]) // Глубокое сравнение
expect({ a: undefined, b: 2 }).toEqual({ b: 2 }) // Глубокое сравнение
expect({ a: undefined, b: 2 }).not.toStrictEqual({ b: 2 }) // Строгое сравнение
```

### Определение истинности

```js
// Совпадает с истинными значениями
expect('foo').toBeTruthy()
// Совпадает с ложными значениями
expect('').toBeFalsy()
// Совпадает только с `null`
expect(null).toBeNull()
// Совпадает только с `undefined`
expect(undefined).toBeUndefined()
// Значение должно быть определено
expect(7).toBeDefined()
// Совпадает с `true` или `false`
expect(true).toEqual(expect.any(Boolean))
```

### Числа

```js
expect(2).toBeGreaterThan(1)
expect(1).toBeGreaterThanOrEqual(1)
expect(1).toBeLessThan(2)
expect(1).toBeLessThanOrEqual(1)
expect(0.2 + 0.1).toBeCloseTo(0.3, 5)
expect(NaN).toEqual(expect.any(Number))
```

### Строки

```js
expect('длинная строка').toMatch('стр')
expect('строка').toEqual(expect.any(String))
expect('кофе').toMatch(/ф/)
expect('пицца').not.toMatch('кофе')
expect(['пицца', 'кофе']).toEqual([expect.stringContaining('цц'), expect.stringMatching(/ф/)])
```

### Массивы

```js
expect([]).toEqual(expect.any(Array))
expect(['Alice', 'Bob', 'John']).toHaveLength(3)
expect(['Alice', 'Bob', 'John']).toContain('Alice')
expect([{ a: 1 }, { a: 2 }]).toContainEqual({ a: 1 })
expect(['Alice', 'Bob', 'John']).toEqual(expect.arrayContaining(['Alice', 'Bob']))
```

### Объекты

```js
expect({ a: 1 }).toHaveProperty('a')
expect({ a: 1 }).toHaveProperty('a', 1)
expect({ a: { b: 1 } }).toHaveProperty('a.b')
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 })
expect({ a: 1, b: 2 }).toMatchObject({
  a: expect.any(Number),
  b: expect.any(Number)
})
expect([{ a: 1 }, { b: 2 }]).toEqual([
  expect.objectContaining({ a: expect.any(Number) }),
  expect.anything()
])
```

### Исключения

```js
// const fn = () => { throw new Error('Упс!') }
expect(fn).toThrow()
expect(fn).toThrow('Упс')
expect(fn).toThrowErrorMatchingSnapshot()
```

### Снимки

```js
expect(node).toMatchSnapshot()
expect(user).toMatchSnapshot({
  date: expect.any(Date)
})
expect(user).toMatchInlineSnapshot()
```

### Функция для создания "моков" (фикций)

```js
// const fn = jest.fn()
// const fn = jest.fn().mockName('Единорог') - именованная фикция
expect(fn).toBeCalled() // Функция была вызвана
expect(fn).not.toBeCalled() // Функция *не была* вызвана
expect(fn).toHaveBeenCalledTimes(1) // Функция была вызвана один раз
expect(fn).toBeCalledWith(arg1, arg2) // Любой вызов функции сопровождался указанными аргументами
expect(fn).toHaveBeenLastCalledWith(arg1, arg2) // При последнем вызове функции, ей были переданы указанные аргументы
expect(fn).toHaveBeenNthCalledWith(args) // Определенный вызов функции сопровождался указанными аргументами
expect(fn).toHaveReturnedTimes(2) // Функция возвращает значения без ошибок
expect(fn).toHaveReturnedWith(value) // Функция возвращает указанное значение
expect(fn).toHaveLastReturnedWith(value) // Последний вызов функции вернул указанное значение
expect(fn).toHaveNthReturnedWith(value) // Определенный вызов функции вернул указанное значение
expect(fn.mock.calls).toEqual([['first', 'call', 'args'], ['second', 'call', 'args']]) // Несколько вызовов
expect(fn.mock.calls[0][0]).toBe(2) // fn.mock.calls[0][0] — первый аргумент первого вызова
```

<details>
  <summary>"Алиасы" (синонимы)</summary>

- `toBeCalled` → `toHaveBeenCalled`
- `toBeCalledWith` → `toHaveBeenCalledWith`
- `lastCalledWith` → `toHaveBeenLastCalledWith`
- `nthCalledWith` → `toHaveBeenNthCalledWith`
- `toReturnTimes` → `toHaveReturnedTimes`
- `toReturnWith` → `toHaveReturnedWith`
- `lastReturnedWith` → `toHaveLastReturnedWith`
- `nthReturnedWith` → `toHaveNthReturnedWith`

</details>

### Примеси

```js
expect(new A()).toBeInstanceOf(A)
expect(() => {}).toEqual(expect.any(Function))
expect('пицца').toEqual(expect.anything())
```

### Поиск совпадений с промисами

```js
test('Разрешенным значением должен быть "лимон"', () => {
  expect.assertions(1)
  // Не забудьте добавить оператор `return`
  return expect(Promise.resolve('лимон')).resolves.toBe('лимон')
  return expect(Promise.reject('осьминог')).rejects.toBeDefined()
  return expect(Promise.reject(Error('пицца'))).rejects.toThrow()
})
```

Или с помощью `async/await`:

```js
test('Разрешенным значением должен быть "лимон"', async () => {
  expect.assertions(2)
  await expect(Promise.resolve('лимон')).resolves.toBe('лимон')
  await expect(Promise.resolve('лимон')).resolves.not.toBe('осьминог')
})
```

[Официальная документация](https://facebook.github.io/jest/docs/en/expect.html#resolves)

## Асинхронные тесты

Смотрите [больше примеров](https://facebook.github.io/jest/docs/en/tutorial-async.html) в официальной документации Jest.

Хорошей практикой считается определение количества ожидаемых утверждений (assertions) в асинхронных тестах, тест провалится, если утверждения не будут вызваны.

```js
test('Асинхронный тест', () => {
  expect.assertions(3) // В процессе тестирования вызывается ровно три утверждения
  // или
  expect.hasAssertions() // В процессе тестирования вызывается по крайней мере одно утверждение

  // Далее следуют асинхронные тесты
})
```
Обратите внимание, что вы также можете делать это в файле, за пределами любых `describe` и `test`:

```js
beforeEach(expect.hasAssertions)
```

Это обеспечит присутствие хотя бы одного утверждения в процессе тестирования. Это также подходит для случаев, когда ожидается конкретное число утверждений - `expect.assertions(3)`.

### async/await

```js
test('Асинхронный тест', async () => {
  expect.assertions(1)
  const result = await runAsyncOperation()
  expect(result).toBe(true)
})
```

### Промисы

```js
test('Асинхронный тест', () => {
  expect.assertions(1)
  return runAsyncOperation().then(result => {
    expect(result).toBe(true)
  })
})
```

### Коллбек `done()`

Утверждение должно быть обернуто в блок `try/catch`, иначе Jest будет игнорировать ошибки:

```js
test('Асинхронный тест', done => {
  expect.assertions(1)
  runAsyncOperation()
  setTimeout(() => {
    try {
      const result = getAsyncOperationResult()
      expect(result).toBe(true)
      done()
    } catch (err) {
      done.fail(err)
    }
  })
})
```

## Фикции

### Функции для создания фикций

```js
test('Вызов коллбека', () => {
  const callback = jest.fn()
  fn(callback)
  expect(callback).toBeCalled()
  expect(callback.mock.calls[0][1].baz).toBe('пицца') // Второй аргумент первого вызова
  // Отслеживаем первый и последний аргументы, но игнорируем второй
  expect(callback).toHaveBeenLastCalledWith('мясо', expect.anything(), 'маргарита');
})
```

Вы также можете использовать снимки:

```js
test('Вызов коллбека', () => {
  const callback = jest.fn().mockName('Единорог')
  fn(callback)
  expect(callback).toMatchSnapshot()
  // ->
  // [MockFunction Единорог] {
  //   "calls": Array [
  // ...
})
```

И передавать реализацию в функцию `jest.fn()`:

```js
const callback = jest.fn(() => true)
```

[Читать подробнее](https://facebook.github.io/jest/docs/mock-function-api.html)

### Возвращение, разрешение и отклонение значений

Ваши фикции могут возвращать значения:

```js
const callback = jest.fn().mockReturnValue(true);
const callbackOnce = jest.fn().mockReturnValueOnce(true);
```

Или разрешать значения:

```js
const promise = jest.fn().mockResolvedValue(true);
const promiseOnce = jest.fn().mockResolvedValueOnce(true);
```

Они даже могут отклонять значения:

```js
const failedPromise = jest.fn().mockRejectedValue("Роскосмос, у нас случилась оказия");
const failedPromiseOnce = jest.fn().mockRejectedValueOnce("Роскосмос, у нас случилась оказия");
```

Вы можете комбинировать названные подходы:

```js
const callback = jest.fn()
  .mockReturnValueOnce(false)
  .mockReturnValue(true);

// ->
//  вызов 1: false
//  вызов 2+: true
```

### Создание фиктивных модулей с помощью метода `jest.mock()`

```js
jest.mock('lodash/memoize', () => a => a) // Должна присутствовать реальная функция lodash/memoize
jest.mock('lodash/memoize', () => a => a, { virtual: true }) // Реальная функция lodash/memoize может отсутствовать
```

[Читать подробнее](https://facebook.github.io/jest/docs/jest-object.html#jestmockmodulename-factory-options)

Обратите внимание, при использовании `babel-jest` вызовы `jest.mock()` будут подниматься в начало блока кода. Используйте `jest.doMock()` для предотвращения подобного поведения.

### Создание фиктивных модулей в отдельных файлах

1.  Создаем файл, например, `__mocks__/lodash/memoize.js`:

    ```js
    module.exports = a => a
    ```

2.  Добавлем его в тест:

    ```js
    jest.mock('lodash/memoize')
    ```

[Читать подробнее](https://facebook.github.io/jest/docs/manual-mocks.html)

### Методы объектов фикций

```js
const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
expect(console.log.mock.calls).toEqual([['dope'], ['nope']])
spy.mockRestore()
```

```js
const spy = jest.spyOn(ajax, 'request').mockImplementation(() => Promise.resolve({ success: true }))
expect(spy).toHaveBeenCalled()
spy.mockRestore()
```

### Геттеры и сеттеры фикций

Новая версия:

```js
const location = {}
const getTitle = jest.spyOn(location, 'title', 'get').mockImplementation(() => 'пицца')
const setTitle = jest.spyOn(location, 'title', 'set').mockImplementation(() => {})
```

Старая версия:

```js
const getTitle = jest.fn(() => 'пицца')
const setTitle = jest.fn()
const location = {}
Object.defineProperty(location, 'title', {
  get: getTitle,
  set: setTitle
})
```

### Очистка и восстановление фикций

Для одной фикции:

```js
fn.mockClear() // Удаляет дату использования фикции (fn.mock.calls, fn.mock.instances)
fn.mockReset() // Удаляет любые возвращенные значения или реализации фикции
fn.mockRestore() // Сбрасывает и восстанавливает первоначальную реализацию
```

Обратите внимание: `mockRestore()` работает только применительно к фикциям, созданным с помощью `jest.spyOn()`.

Для всех фикций:

```js
jest.clearAllMocks()
jest.resetAllMocks()
jest.restoreAllMocks()
```

### Получение доступа к исходному модулю при использовании "моков"

```js
jest.mock('fs')
const fs = require('fs') // Модуль с "моком"
const fs = require.requireActual('fs') // Исходный модуль
```

### Фиктивные таймеры

Позволяет писать синхронные тесты для кода, в котором используются нативные таймеры (`setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`).

```js
// Разрешаем использование фиктивных таймеров
jest.useFakeTimers()

test('Убить время', () => {
  const callback = jest.fn()

  // Запускаем код, в котором используются `setTimeout()` или `setInterval()`
  const actual = someFunctionThatUseTimers(callback)

  // Перематываем до выполнения всех таймеров
  jest.runAllTimers()

  // Синхронно проверяем результаты
  expect(callback).toHaveBeenCalledTimes(1)
})
```

Или настраиваем таймеры по времени с помощью [advanceTimersByTime()](https://jestjs.io/docs/en/timer-mocks#advance-timers-by-time):

```js
// Разрешаем использование фиктивных таймеров
jest.useFakeTimers()

test('Убить время', () => {
  const callback = jest.fn()

  //  Запускаем код, в котором используются `setTimeout()` или `setInterval()`
  const actual = someFunctionThatUseTimers(callback)

  // Перематываем на 250 мс
  jest.advanceTimersByTime(250)

  // Синхронно проверяем результаты
  expect(callback).toHaveBeenCalledTimes(1)
})
```

В особых случаях используется [jest.runOnlyPendingTimers()](https://jestjs.io/docs/en/timer-mocks#run-pending-timers).

Обратите внимание: `jest.useFakeTimers()` следует вызывать только для использования других методов фиктивных таймеров.

## Тестирование, основанное на данных

Запускаем одни и те же тесты с разными данными:

```js
test.each([[3, 2, 1], [1, 2, 3], [2, 1, 3]])('.add(%s, %s)', (a, b, expected) => {
  expect(a + b).toBe(expected)
})
```

Или с помощью шаблонных литералов:

```js
test.each`
  a    | b    | expected
  ${3} | ${2} | ${1}
  ${1} | ${2} | ${3}
  ${2} | ${1} | ${3}
`('Возвращает $expected при сложении $a и $b', ({ a, b, expected }) => {
  expect(a + b).toBe(expected)
})
```

Или на уровне `describe`:

```js
describe.each([['mobile'], ['tablet'], ['desktop']])('проверка выполнения за %s', (viewport) => {
  test('отображение загруженной страницы', () => {
    //
  })
})
```

[describe.each()](https://jestjs.io/docs/en/api.html#describeeachtablename-fn-timeout), [test.each()](https://jestjs.io/docs/en/api.html#testeachtablename-fn-timeout)

## Пропуск тестов

Не запускать указанные тесты:

```js
describe.skip('makePoniesPink'...
tests.skip('сделать каждого пони розовым'...
```

Запускать только указанные тесты:

```js
describe.only('makePoniesPink'...
tests.only('сделать каждого пони розовым'...
```

## Тестирование модулей с побочными эффектами

Node.js и Jest will кэшируют запрашиваемые (`require`) модули. Для тестирования модулей с побочными эффектами необходимо очищать реестр модулей между тестами:

```js
const modulePath = '../module-to-test'

afterEach(() => {
  jest.resetModules()
})

test('первый тест', () => {
  // Подготовка условия для первого теста
  const result = require(modulePath)
  expect(result).toMatchSnapshot()
})

test('второй тест', () => {
  // Подготовка условия для первого теста
  const fn = () => require(modulePath)
  expect(fn).toThrow()
})
```

# Шпаргалка по Redux

## Создание хранилища

Хранилище создается с помощью редуктора, принимающего текущее состояние и возвращающего новое состояние на основе полученной операции.

```js
import { createStore } from 'redux'

// Редуктор
function counter (state = { value: 0 }, action) {
  switch (action.type) {
  case 'INCREMENT':
    return { value: state.value + 1 }
  case 'DECREMENT':
    return { value: state.value - 1 }
  default:
    return state
  }
}

const store = createStore(counter)

// Опционально, в качестве второго аргумента можно передать начальное состояние - `initialState`
const store = createStore(counter, { value: 0 })
```

## Использование хранилища

Для того, чтобы измененить состояние хранилища, необходимо отправить операцию в редуктор:

```js
let store = createStore(counter)

// Отправляем операции; это приводит к изменению состояния
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })

// Получаем текущее состояние
store.getState()

// Регистрируем изменения
store.subscribe(() => { ... })
```

## Провайдер

Компонент `<Provider>` делает хранилище доступным для компонентов. Компонент подключается к хранилищу с помощью метода `connect()`:

```js
import { Provider } from 'react-redux'

React.render(
  <Provider store={store}>
    <App />
  </Provider>, mountNode)
```

## Привязка (mapping) состояния

```js
import { connect } from 'react-redux'

// Функциональный компонент
function App ({ message, onMessageClick }) {
  return (
    <div onClick={() => onMessageClick('Привет!')}>
      {message}
    </div>
  )
}

// Привязываем `state` к `props`:
function mapState (state) {
  return { message: state.message }
}

// Привязываем `dispatch` к `props`:
function mapDispatch (dispatch) {
  return {
    onMessageClick (message) {
      dispatch({ type: 'click', message })
    }
  }
}

// Подключаем их
export default connect(mapState, mapDispatch)(App)
```

## Объединение редукторов

```js
const reducer = combineReducers({
  counter, user, store
})
```

## Посредники

Посредники (middlewares) - это декораторы для `dispatch()`, позволяющие принимать операции и выполнять определяемые ими задачи:

```js
// Бесполезный посредник
const logger = store => dispatch => action { dispatch(action) }

const logger = store => {
  // Данная функция запускается в `createStore()`
  // и возвращает декоратор для `dispatch()`

  return dispatch => {
    // Также запускается в `createStore()`
    // и возвращает новую функцию `dispatch()`

    return action => {
      // Запускается при каждом выполнении `dispatch()`
    }
  }
}
```

## Применение посредников

```js
const enhancer = applyMiddleware(logger, thunk, ...)

const store = createStore(reducer, {}, enhancer)
```

# Лучшие практики по использованию React

1. Названия компонентов должны начинаться с большой буквы.

2. Компоненты должны быть маленькими и отвечать за выполнение одной задачи.

3. Компоненты должны иметь небольшое описание.

```js
/**
*
* Author: {...}
* Description: {...}
* Dependencies: {...}
*
**/
const SampleComponent = () => {

  return (
    <div>
      Пример компонента
    </div>
  );
}

export default SampleComponent;
```

4. В коде должен использоваться синтаксис ES6.

5. Названия переменных и функций, которые не являются константами и конструкторами, соответственно, и которые состоят из нескольких слов, должны быть в стиле *lowerCamelCased*.

6. Предопределенные константы именуются в верхнем регистре, слова разделяются нижним подчеркиванием - *UPPER_UNDERSCORED*.

7. При проверке типа переменной, название типа указывается в кавычках (не оборачивается в фигурные скобки), а для сравнения используется оператор строго равенства:

```js
if (typeof myVariable === 'string') {
  // ...
}
```

8. В простых случаях вместо оператора `if/else` должен использоваться тернарный оператор:

```js
// if/else
if (condition) {
    //...
} else {
    //...
}

// тернарный оператор
const myVariable = condition ? exprIfTrue : exprIfFalse
```

9. Вместо контейнеров следует использовать фрагменты:

```js
//...

render() {
  return (
    <Fragment>
      <p>Какой-то текст.</p>
      <h2>Заголовок</h2>
      <p>Еще текст.</p>
      <h2>Другой заголовок</h2>
      <p>И снова текст.</p>
    </Fragment>
  );
}
```

Сокращенный вариант:

```js
//...

render() {
  return (
    <>
      <p>Какой-то текст.</p>
      <h2>Заголовок</h2>
      <p>Еще текст.</p>
      <h2>Другой заголовок</h2>
      <p>И снова текст.</p>
    </>
  );
}
```

10. Все файлы, относящиеся к одному компоненту, должны находиться в одной директории

11. Следует отдавать предпочтение функциональным компонентам.

12. В качестве обработчиков событий не следует использовать анонимные функции.

13. Следует избегать использования встроенных стилей.

14. Чтобы скрыть компонент, нужно вернуть `null` при его рендеринге.

15. Компоненты высшего порядка должны использоваться только для решения проблем взаимодействия компонентов между собой.

16. Индексы элементов массива не должны использоваться в качестве ключей (`keys`).

17. В JSX вместо тернарного оператора могут использоваться короткие вычисления:

```js
const sampleComponent = () => {
  return isTrue ? <p>Истина</p> : null
};

const sampleComponent = () => {
  return isTrue && <p>Истина</p>
};
```
