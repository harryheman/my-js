---
sidebar_position: 13
title: Шпаргалка по React + Typescript
description: Шпаргалка по React + Typescript
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'typescript', 'ts', 'cheatsheet', 'шпаргалка']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'typescript', 'ts', 'cheatsheet', 'шпаргалка']
---

# React + Typescript

> [Источник](https://github.com/typescript-cheatsheets/react).

## Импорт React

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
```

Если использовать флаг `--allowSyntheticDefaultImports` или добавить `"allowSyntheticImports": true` в `tsconfig.json`, тогда можно использовать более привычный импорт:

```tsx
import React from 'react'
import ReactDOM from 'react-dom'
```

## Функциональные компоненты

Функциональные компоненты - это функции, принимающие параметр `props` и возвращающие JSX.

```tsx
type AppProps = { message: string }
const App = ({ message }: AppProps) => <p>{message}</p>
```

## Хуки

Хуки поддерживаются в `@types/react`, начиная с версии `16.8`.

### useState

Вывод `TypeScript` относительно типов значений, возвращаемых `useState`, в большинстве случаев работает правильно:

```tsx
const [state, setState] = useState(false)
// Типом `state` является логическое значение,
// `setState` принимает только такие значения
```

В случае инициализации хука нулевым значением, следует явно определить тип с помощью альтернативных типов (union types):

```tsx
const [user, setUser] = useState<IUser | null>(null)

// позже
setUser(newUser)
```

### useReducer

Для определения типов операций редуктора можно использовать исключающие альтернативные типы (discriminated union types). Также необходимо определить тип возвращаемого редуктора:

```tsx
const initialState = { count: 0 }

type ACTION_TYPE =
  | { type: 'increment', payload: number }
  | { type: 'decrement', payload: string }

function reducer(state: typeof initialState, action: ACTION_TYPE) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.payload }
    case 'decrement':
      return { count: state.count - Number(action.payload) }
    default:
      throw new Error()
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <>
      Значение счетчика: {state.count}
      <button onClick={() => dispatch({ type: 'decrement', payload: '5' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'inrement', payload: 5 })}>
        +
      </button>
    </>
  )

}
```

`Redux` предоставляет утилиту для определения типа редуктора:

```tsx
import { Reducer } from 'redux'

export function reducer: Reducer<S, A>{}
```

### useEffect

Хук `useEffect` всегда должен возвращать функцию очистки (cleanup function) или `undefined`. Об этом легко забыть, используя стрелочные функции:

```tsx
function DelayedEffect(props: { ms: number }) {
  const { ms } = props

  useEffect(() =>
    setTimeout(() => {
      // ...
    }, ms),
  [ms])
  // setTimeout неявно возвращает число,
  // поскольку мы забыли обернуть тело
  // стрелочной функции в фигурные скобки
  return null
}
```

Для того, чтобы убедиться, что из функции ничего не возвращается, можно использовать ключевое слово `void`.

### useRef

Для создании переменной для хранения ссылки (ref) без начального значения (null) существует три варианта:

```tsx
const ref1 = useRef<HTMLElement>(null!)
const ref2 = useRef<HTMLElement>(null)
const ref3 = useRef<HTMLElement | null>(null)
```

Первый вариант: отключение проверки на `null` для `ref1.current`, предназначен для передачи во встроенный атрибут `ref`, которым управляет `React` (`React` автоматически устанавливает значение `current`).

`!` - это оператор ненулевого утверждения (non-null assertion operator). Он утверждает, что любое выражение перед ним не является `null` или `undefined`. `useRef<HTMLElement>(null!)` означает, что мы инициализируем ссылку значением `null`, но сообщаем `TypeScript`, что оно не является нулевым:

```tsx
function MyComponent() {
  const ref1 = useRef<HTMLDivElement>(null!)
  useEffect(() => {
    doSomethingWith(ref1.current)
    // `TypeScript` не будет осуществлять проверку на `null` - ref1 && ref1.current
  })
  return <div ref={ref1}>...</div>
}
```

Во втором случае типом возвращаемого значения будет `RefObject` вместо `MutableRefObject`. Это означает, что попытка присвоения значения `ref2.current` закончится тем, что будет выброшено исключение `TypeError`.

В третьем случае `ref3.current` будет изменяемым, что можно использовать для создания "переменных экземпляра" (instance variables). Такими переменными мы управляем самостоятельно:

```tsx
function TextInputWithFocusButton() {
  // инициализируем с помощью `null`, но сообщаем `TypeScript`, что ищем HTMLInputElement
  const inputRef = useRef<HTMLInputElement>(null)

  const onClick = () => {
    // строгая проверка на `null` вынуждает нас убедиться, что `inputRef` и `inputRef.current` существуют
    // если `current` существует, значит, его типом является HTMLInputElement,
    // следовательно, у него есть метод `focus()`
    if (inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <>
      {/* разумеется, inputRef можно использовать только с инпутами */}
      <input ref={inputRef} type="text" />
      <button onClick={onClick}>Установить фокус на поле для ввода текста</button>
    </>
  )
}
```

### Пользовательские хуки

В случае, когда пользовательский хук возвращает массив, мы вряд ли захотим, чтобы `TypeScript` делал вывод относительно типов возвращаемых значений, поскольку таким выводом будут альтернативные типы (union) (мы же, скорее всего, хотим, чтобы каждое из значений имело собственный тип). Поэтому следует использовать фиксацию типов в виде константы (const assetion):

```tsx
export function useLoading() {
  const [isLoading, setState] = useState(false)
  const load = (aPromise: Promise<any>) => {
    setState(true)
    return aPromise.finally(() => setState(false))
  }
  return [isLoading, load] as const // [boolean, typeof load] вместо (boolean | typeof load)[]
}
```

Таким образом, при деструктуризации мы будем получать правильный тип на основе позиции значения.

В качестве альтернативы можно вручную определить типы, возвращаемые функцией:

```tsx
export function useLoading() {
  const [isLoading, setState] = useState(false)
  const load = (aPromise: Promise<any>) => {
    setState(true)
    return aPromise.finally(() => setState(false))
  }
  return [isLoading, load] as [
    boolean,
    (aPromise: Promise<any>) => Promise<any>
  ]
}
```

Утилита для создания кортежей (tuples) для типов:

```tsx
function tuplify<T extends any[]>(...elements: T) {
  return elements
}

function useArray() {
  const num = useRef(3).current
  const fn = useRef(() => {}).current
  return [num, fn] // типом является (number | (() => void))[]
}

function useTuple() {
  const num = useRef(3).current
  const fn = useRef(() => {}).current
  return tuplify(num, fn) // типом является [number, () => void]
}
```

## Типизация пропов компонентов

### Примеры основных типов пропов

Список типов, часто используемых в `React+TS` приложениях:

```tsx
type AppProps = {
  message: string
  count: number
  disabled: boolean
  // массив типа
  names: string[]
  // альтерантивные (union) строки
  status: 'idle' | 'loading' | 'success' | 'error'
  // любой объект, свойства которого не используются (заменитель, placeholder)
  obj: object
  obj2: {} // почти то же самое, что `object`, в точности то же самое, что `Object`
  obj3: {
    id: string
    title: string
  }
  // массив объектов
  objArr: {
    id: string
    title: string
  }[]
  // объект-словарь с любым количеством свойств одинакового типа
  dict1: {
    [key: string]: MyType
  }
  dict2: Record<string, MyType> // эквивалент dict1
  // любая функция, которая не вызывается (не рекомендуется)
  onSomething: Function
  // функция, которая ничего не принимает и не возвращает
  onClick: () => void
  //  функция с именованными пропами
  onChange: (id: number) => void
  // альтернативный синтаксис типа функции, принимающей событие
  onClick(event: React.MouseEvent<HTMLButtonElement>): void
  // опциональный проп
  optional?: MyType
}
```

### Полезные примеры типизации пропов

Применяются в отношении компонентов, принимающих другие компоненты в качестве пропов:

```tsx
export declare interface AppProps {
  children1: JSX.Element // плохо, не подходит для массивов
  children2: JSX.Element | JSX.Element[] // средне, не подходит для строк
  children3: React.ReactChildren // несмотря на название, совсем не подходящий тип, это утилита
  children4: React.ReactChild[] // неплохо, принимает массив потомков
  children: React.ReactNode // самый лучший вариант, принимает все (см. крайние случаи ниже)
  functionChildren: (name: string) => React.ReactNode // рекомендуемая функция для типа пропа для рендеринга потомка
  style?: React.CSSProperties // для пропов стилей
  onChange?: React.FormEventHandler<HTMLInputElement> // события формы, типом общего параметра является `event.target`
  props: Props & React.ComponentPropsWithoutRef<'button'> // для представления всех пропов элемента кнопки без передачи ее ссылок
  props2: Props & React.ComponentPropsWithRef<MyButtonWithForwardRef> // для представления всех пропов `MyButtonForwardedRef` и передачи ее ссылок
}
```

#### Крайние случаи `React.ReactNode`

Выполнение данного кода завершится ошибкой:

```tsx
type Props = {
  children: React.ReactNode
}

function Comp({ children }: Props) {
  return <div>{children}</div>
}
function App() {
  return <Comp>{{}}</Comp> // Ошибка выполнения: объекты не являются валидными потомками React
}
```

Это происходит потому, что `ReactNode` включает `ReactFragment`, разрешающий тип `{}`, который является слишком широким. Исправление указанной неточности поломает много библиотек, поэтому просто учитывайте этот факт.

`ReactNode` - это не то, что возвращает `React.createElement`. `React.createElement` всегда возвращает объект, соответствующий интерфейсу `JSX.Element`, а `React.ReactNode` - это набор всех возможных значений, возвращаемых компонентом.

- `JSX.Element` - значение, возвращаемое `React.createElement`
- `React.ReactNode` - значение, возвращаемое компонентом

## Типы или интерфейсы

Для определения типов пропов и состояния можно использовать как типы, так и интерфейсы. Вопрос в том, что лучше использовать?

Общее правило гласит: используйте интерфейсы до тех пор, пока вам не понадобятся типы.

Развернутый ответ на поставленный вопрос:

- всегда используйте `interface` для определения публичных API при разработке библиотеки или определения сторонних типов окружения, поскольку это позволяет потребителям при необходимости расширять их через объединение определений (declaration merging), например, при отсутствии определений типов
- используйте `type` для пропов и состояния `React` для большей согласованности и по причине того, что типы являются более строгими

Типы полезны при определении альтернативных типов (например, `type MyType = TypeA | TypeB`), интерфейсы лучше подходят для определения словарей и их реализации (`implements`) или расширения (`extend`).

### Таблица сравнения типов и интерфейсов

Аспект|Тип|Интерфейс
---|---|---
Может описывать функции|Да|Да
Может описывать конструкторы|Да|Да
Может описывать кортежи|Да|Да
Может расширяться с помощью интерфейсов|Иногда|Да
Может расширяться с помощью классов|Нет|Да
Может быть реализован с помощью классов|Иногда|Да
Может пересекаться (intersect) с другими типами/интерфейсами|Да|Иногда
Может объединяться с другими типами/интерфейсами|Да|Нет
Может использоваться для создания связанных (mapped) типов|Да|Нет
Может связываться с помощью связанных типов|Да|Да
Имеет расширенное представление в сообщениях об ошибках|Да|Нет
Может быть дополненным (augmented)|Нет|Да
Может быть рекурсивным|Иногда|Нет

## Формы и события

Если производительность не является проблемой, а, обычно, так и есть, то самым легким способом определить тип события формы является автоматическое предположение типа (type inference) и определение типа на основе контекста (contextual typing):

```tsx
<button
  onClick={(e) => {
    /* `e` будет иметь правильный тип */
  }}
>
  Button
</button>
```

Отдельное определение обработчика `onChange`:

```tsx
const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
  setState({ text: e.target.value })
}

// или
const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  setState({ text: e.currentTarget.value })
}
```

### Определение типа `onSubmit` с неуправляемыми компонентами в форме

Если нам не важен тип `event`, можно использовать `React.SyntheticEvent`. Если нам нужен доступ к именованным полям для ввода, можно использовать расширение (widening) типов:

```tsx
<form
  ref={formRef}
  onSubmit={(e: React.SyntheticEvent) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      email: { value: string }
      password: { value: string }
    }
    const email = target.email.value
    const password = target.password.value
    // и т.д.
  }}
>
  <div>
    <label>
      Email:
      <input type="email" name="email" />
    </label>
  </div>
  <div>
    <label>
      Пароль:
      <input type="password" name="password" />
    </label>
  </div>
  <div>
    <input type="submit" value="Войти" />
  </div>
</form>
```

При разработке сложных форм лучше использовать `React Hook Form` или `Formik`, которые написаны на TypeScript.

## Контекст

### Общий пример

```tsx
import { createContext, useState, useContext } from 'react'

interface IAppContext {
  title: string
  author: string
  url: string
}

const AppContext = createContext<IAppContext | null>(null)

// Провайдер
const initialValue: IAppContext = {
  title: 'Использование контекста React в TypeScript-приложениях',
  author: 'Harry Heman',
  url: 'http://example.com'
}

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialValue)

  return (
    <AppContext.Provider value={[state, setState]}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)

// Потребление контекста
export const Post = () => {
  const [post, setPost] = useAppContext()

  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.author}</p>
      <span>{post.url}</span>
    </article>
  )
}
```

### Расширенный пример

Использование `React.createContext` с пустым объектом в качестве начального значения:

```tsx
interface IAppContext {
  // установка типа состояния для обработки
  name: string | null
}
// установка пустого объекта в качестве начального значения
const AppContext = createContext({} as IAppContext)
// установка провайдера контекста...
```

Использование `React.createContext` и геттеров контекста для создания `createCtx` без `defaultValue`, что отключает проверку на `undefined`:

```tsx
import { createContext, useContext } from 'react'

const currentUserContext = createContext<string | undefined>(undefined)

function Greet() {
  const currentUser = useContext(currentUserContext)
  return <h4>ПРИВЕТ, {currentUser!.toUpperCase()}!</h4>
}

const App = () => (
  <currentUserContext.Provider value='Harry'>
    <Greet />
  </currentUserContext.Provider>
)
```

*Обратите внимание*: аргумент явного типа (`!`) нужен нам из-за отсутствия начального значения.

Как еще можно решить эту проблему?

1. Можно присвоить ненулевое значение:

```tsx
const currentUserContext = createContext<string>(undefined!)
```

Это быстрое и легкое решение, но мы жертвуем безопасностью типов и, если мы забудем передать значение в провайдер, будет выброшено исключение.

2. Можно реализовать вспомогательную функцию `createCtx`, защищающую от доступа к контексту, не имеющему значения. В этом случае, нам не нужно передавать начальное значение и осуществлять проверку на `undefined`:

```tsx
import { createContext, useContext } from 'react'

/**
 * Вспомогательная функция для создания контекста, которому не требуется начальное значение
 * и проверка на `undefined`
*/
function createCtx<A extends {} | null> {
  const ctx = createContext<A | undefined>(undefined)
  function useCtx() {
    const c = useContext(ctx)
    if (c === undefined)
      throw new Error('useCtx должна находиться внутри провайдера с каким-либо значением')
    return c
  }
  return [useCtx, ctx.Provider] as const // `as const` "превращает" массив в кортеж (tuple)
}

// Использование
// теперь нам нужно определить только тип
export const [useCurrentUserName, CurrentUserProvider] = createCtx<string>()

function Greet() {
  const currentUser = useCurrentUserName()
  return <h4>ПРИВЕТ, {currentUser.toUpperCase()}!</h4>
}

const App = () => (
  <CurrentUserProvider value='Harry'>
    <Greet />
  </CurrentUserProvider>
)
```

3. Можно пойти еще дальше и использовать геттеры контекста:

```tsx
/**
 * Вспомогательная функция для создания контекста, которому не требуется начальное значение
 * и проверка на `undefined`
*/
function createCtx<A extends {} | null> {
  const ctx = createContext<A | undefined>(undefined)
  function useCtx() {
    const c = useContext(ctx)
    if (c === undefined)
      throw new Error('useCtx должна находиться внутри провайдера с каким-либо значением')
    return c
  }
  return [useCtx, ctx.Provider] as const // `as const` "превращает" массив в кортеж
}

// использование
export const [useCtx, SettingProvider] = createCtx<string>() // определяем тип без начального значения
export function App() {
  const key = useLocalStorage('someKey') // получаем ключ из локального хранилища
  return (
    <SettingProvider value={key}>
      <MyComponent>
    </SettingProvider>
  )
}

export function MyComponent() {
  const key = useCtx() // можем использовать без проверки на `null`
  return <div>{key}</div>
}
```

4. Использование `createContext` и `useContext` для создания `createCtx` с сеттерами контекста:

```tsx
export function createCtx<A>(defaultValue: A) {
  type UpdateType = React.Dispatch<
    React.SetStateAction<typeof defaultValue>
  >
  const defaultUpdate: UpdateType = () => defaultValue
  const ctx = createContext({
    state: defaultValue,
    update: defaultUpdate
  })
  function Provider(props: React.PropsWithChildren<{}>) {
    const [state, update] = useState(defaultValue)
    return <ctx.Provider value={{ state, update }} {...props} />
  }
  return [ctx, Provider] as const // или [typeof ctx, typeof Provider]
}

// использование
const [ctx, TextProvider] = createCtx('someText')
export const TextContext = ctx
export const App = () => (
  <TextProvider>
    <MyComponent />
  </TextProvider>
)
export function MyComponent() {
  const { state, update } = createContext(TextContext)
  return (
    <label>
      {state}
      <input type="text" onChange={(e) => update(e.target.value)} />
    </label>
  )
}
```

5. Версия на основе `useReducer`:

```tsx
export function createCtx<StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType,
) {
  const defaultDispatch: React.Dispatch<ActionType> = () => initialState // на самом деле, мы никогда это не используем
  const ctx = React.createContext({
    state: initialState,
    dispatch: defaultDispatch
  })
  function Provider(props: React.PropsWithChildren<{}>) {
    const [state, dispatch] = React.useReducer<React.Reducer<StateType, ActionType>>(reducer, initialState)
    return <ctx.Provider value={{ state, dispatch }} {...props} />
  }
  return [ctx, Provider] as const
}
// использование
const initialState = { count: 0 }
type AppState = typeof initialState
type Action =
  | { type: 'increment' }
  | { type: 'add', payload: number }
  | { type: 'sub', payload: number }
  | { type: 'decrement' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'add':
      return { count: state.count + action.payload }
    case 'sub':
      return { count: state.count - action.payload }
    default:
      throw new Error()
  }
}
const [ctx, CountProvider] = createCtx(reducer, initialState)
export const CountContext = ctx

// пример использования на уровне приложения
export const App = () => (
  <CountProvider>
    <Counter />
  </CountProvider>
)

// пример использования внутри компонента
function Counter() {
  const { state, dispatch } = React.useContext(CountContext)
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'add', payload: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'minus', payload: 5 })}>+5</button>
    </div>
  )
}
```

## Порталы

Использование `ReactDOM.createPortal`:

```tsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// предположим, что в нашем HTML-файле имеется `div` с `id` 'modal-root'
const modalRoot = document.getElementById('modal-root') as HTMLElement

export const Modal: React.FC<{}> = ({ children }) => {
  const el = useRef(document.createElement('div'))

  useEffect(() => {
    const current = el.current

    modalRoot!.appendChild(current)
    return () => void modalRoot!.remove()
  }, [])

  return createPortal(children, el.current)
}
```

Пример использования данного компонента:

```tsx
function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      // это можно поместить в статический HTML-файл
      <div id="modal-root"></div>
      {showModal && (
        <Modal>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100vh",
              width: "100vh",
              background: "rgba(0,0,0,0.1)",
              zIndex: 1,
            }}
          >
            Аз есмь модальное окно!
            <button
              style={{ background: "papyawhip" }}
              onClick={() => setShowModal(false)}
            >
              Закрыть
            </button>
          </div>
        </Modal>
      )}
      <button onClick={() => setShowModal(true)}>Показать</button>
    </div>
  )
}
```

## Предохранители

### Использование `react-error-boundary`

`react-error-boundary` - это легковесный пакет, готовый к использованию компонент со встроенной поддержкой TypeScript. Он также позволяет избежать создания классовых компонентов, которые сейчас не очень популярны в экосистеме `React`.

### Реализация собственного компонента

Разумеется, всегда можно реализовать собственный предохранитель:

```tsx
import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    // Обновляем состояние для отображения резервного контента при следующем рендеринге
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error: ", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Что-то пошло не так</h1>
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

## Решение проблем: типы

### Альтернативные типы (union types) и предохранители типов (type guards)

Альтернативные типы решают одни проблемы (`count: number | null`), но создают другие. Если `A` и `B` - объекты, тогда `A | B` означает не `ни A, ни B`, но `A или B, или оба`. Данную задачу можно решить так:

```tsx
interface Admin {
  role: string
}
interface User {
  email: string
}

// Первый способ: использовать ключевое слово `in`
function redirect(user: Admin | User) {
  if ('role' in user) {
    routeToAdminPage(user.role)
  } else {
    routeToHomePage(user.email)
  }
}

// Второй способ: ручная проверка типа
function isAdmin(user: Admin | User): user is Admin {
  return (user as any).role !== undefined
}
```

Второй способ также известен как пользовательская проверка типа и может быть очень полезным с точки зрения повышения читаемости кода. Сам TS использует данный способ для уточнения типов с помощью `typeof` и `instanceof`.

### Опциональные пропы

Опциональные пропы помечаются с помощью вопросительного знака (`message?: string`). Также можно использовать `!` для утверждения, что нечто не является неопределенным, но делать это не рекомендуется.

### Перечисления

Следует избегать использования перечислений, если это возможно, поскольку они имеют несколько задокументированных проблем, с которыми согласна команда `TypeScript`. Лучше использовать объединение типов:

```tsx
export declare type Position = 'left' | 'right' | 'top' | 'bottom'
```

Если вы все же хотите использовать перечисления, помните, что их типом по умолчанию является число. Пример создания и использования перечисления строк:

```tsx
export enum ButtonSizes {
  default = 'default'
  small = 'small'
  large = 'large'
}

// использование
export const PrimaryButton = (
  props: Props & React.HTMLProps<HTMLBUttonElement>
) => <Button size={ButtonSizes.default} {...props} />
```

### Утверждение типа (type assertion)

Иногда мы знаем о типе значения больше, чем `TS`. В этом случае, можно утвердить тип значения с помощью ключевого слова `as`: `message as SpecialMessageType`.

*Обратите внимание*: мы не можем утверждать что угодно, утверждение служит только для уточнения типа. Это не то же самое, что "кастинг" (casting) типов.

Также можно утвердить ненулевой тип при доступе к свойству:

```tsx
element.parentNode!.removeChild(element)
myFunction(document.getElementById(dialog.id!))
const userId!: string
```

Приведенным примерам лучше предпочесть проверку на `null`.

### Имитация номинальных типов (simulating nominal types)

Структурная проверка типов `TypeScript` является очень полезной до тех пор, пока не становится неудобной. Мы можем имитировать номинальные типы с помощью брендирования типов (type branding):

```tsx
type OrderId = string & { readonly brand: unique symbol }
type UserId = string & { readonly brand: unique symbol }
type ID = OrderId | UserId
```

Также можно воспользоваться паттерном парных объектов:

```tsx
function OrderId(id: string) {
  return id as OrderId
}
function UserId(id: string) {
  return id as UserId
}
```

После этого `TS` не позволит использовать неправильный ID в неподходящем для этого месте:

```tsx
function queryForUser(id: UserId) {
  // ...
}
queryForUSer(OrderId('123')) // Error: Argument of type 'OrderId' is not assignable to parameter of type 'UserId'
```

В будущем для брендирования можно будет использовать ключевое слово `unique`.

### Пересечение типов (intersection types)

Добавление двух типов может быть полезным, например, в случае, когда компонент отражает пропы нативного элемента вроде `button`:

```tsx
export interface PrimaryButtonProps {
  label: string
}
export const PrimaryButton = (
  props: PrimaryButtonProps & React.BUttonHTMLAttributes<HTMLButtonElement>
) => {
  // ...
  return <button {...props}>{props.label}</button>
}
```

Для создания переиспользуемого набора пропов для одинаковых компонентов также можно использовать пересечение типов:

```tsx
type BaseProps = {
  className?: string
  style?: React.CSSProperties
  name: string // используется в обоих случаях
}
type DogProps = {
  tailsCount: number
}
type HumanProps = {
  handsCount: number
}
export const Human: React.FC<BaseProps & HumanProps> = // ...
export const Dog: React.FC<BaseProps & DogProps> = // ...
```

Не путайте пересечение типов (intersection, "и") с альтернативными типами (union, "или").

### Типы функций перегрузки (overloading function types)

Когда дело касается функций, часто требуется перегрузка вместо альтернативы. Обычно, функции реализуются так:

```tsx
type FunctionType1 = (x: string, y: number) => number
```

Однако, это не позволяет сделать перегрузку. Для перегрузки определения типов функции помещаются друг за другом:

```tsx
function pickCard(x: { suit: string, card: number }[]: number)
function pickCard(x: number): { suit: string, card: number }
function pickCard(x): any {
  // реализация комбинированной сигнатуры
}
```

Но, если реализация функции отсутствует, и мы просто пишем файл определений `.d.ts`, то нам это не поможет. В этом случае можно ограничиться обычным определением типа функции. Помните, что для `TypeScript` функция - это `вызываемый объект без ключей`:

```tsx
type pickCard = {
  (x: { suit: string; card: number }[]): number
  (x: number): { suit: string; card: number }
  // в данном случае комбинированную форму реализовывать не нужно
}
```

### Предположительные типы (inferred types)

Полагаться на `TS` при определении типов - это здорово до тех пор, пока предложенный тип не понадобится где-нибудь еще. В этом случае, приходится делать шаг назад, явно определять тип/интерфейс и экспортировать его для повторного использования.

К счастью, `typeof` позволяет этого избежать:

```tsx
const [state, setState] = useState({
  foo: 1,
  bar: 2
}) // предположительный тип: { foo: number, bar: number }

const someMethod = (obj: typeof state) => {
  setState(obj) // все работает
}
```

### Частичные типы (partial types)

Работа с частью состояния и пропов является обычным делом в `React`. Использование общего типа `Partial` также позволяет избежать явного определения типов:

```tsx
const [state, setState] = useState({
  foo: 1,
  bar: 2
})

const partialStateUpdate = (obj: Partial<typeof state>) => {
  setState({...state, ...obj})
}

// позже
partialStateUpdate({ foo: 2 }) // работает
```

### Нужные мне типы не были экспортированы

Вот как это решается:

- Захватываем (grabbing) типы пропов компонента: используем `React.ComponentProps` и `typeof`, и, опционально, `Omit` (опускаем) пересекающиеся (overlapping) типы:

```tsx
import { Button } from 'lib' // ButtonProps не были экспортированы!
type ButtonProps = React.ComponentProps<typeof Button>
type AlertButtonProps = Omit<ButtonProps, 'onClick'> // модифицируем
const AlertButton: React.FC<AlertButtonProps> = (props) => (
  <Button onClick={() => alert('Привет')} {...props} />
)
```

- Захватываем возвращаемый тип функции: используем `ReturnType`:

```tsx
// внутри какой-то библиотеки - возвращаемый тип { baz: number } предполагается, но не экспортируется
function foo(bar: string) {
  return { baz: 1 }
}

// в нашем приложении
type FooReturn = ReturnType<typeof foo> // { baz: number }
```

В действительности, можно захватывать все, что является публичным:

```tsx
function foo() {
  return {
    a: 1,
    b: 2,
    subInstArr: [
      {
        c: 3,
        d: 4
      }
    ]
  }
}

type InstType = ReturnType<typeof foo>
type SubInstArr = InstType["subInstArr"]
type SubIsntType = SubInstArr[0]

let baz: SubIsntType = {
  c: 5,
  d: 6 // проверка типа проходит успешно
}

type SubIsntType2 = ReturnType<typeof foo>["subInstArr"][0]
let baz2: SubIsntType2 = {
  c: 5,
  d: 6 // проверка типа проходит успешно
}
```

- `TypeScript` предоставляет утилиту `Parameters` для извлечения параметров функции
- Для дальнейшей кастомизации применяется ключевое слово `infer`, но требуется четкое понимание того, для чего и как оно используется.

### Нужных мне типов не существует

Что может быть хуже модулей, из которых не экспортируются типы? Только модули без типов.

Перед тем, как продолжить убедитесь, что проверили наличие типов в <a href="https://github.com/DefinitelyTyped/DefinitelyTyped">DefinitelyTyped</a> или <a href="https://www.typescriptlang.org/dt/search?search=">TypeSearch</a>.

Существует несколько способов решения данной проблемы.

#### Вешаем на все `any`

Способ для ленивых заключается в создании файла с определениями типов, например, `typedec.d.ts`. Убедитесь, что он доступен для `TS`, т.е. указан в свойстве `include` файла `tsconfig.json`:

```tsx
{
  "include": [
    "src" // файл src/typedec.d.ts разрешается автоматически
  ]
}
```

Внутри этого файла добавляем `declare` и название модуля без типов, например, `my-untyped-module`:

```tsx
declare module 'my-untyped-module'
```

Этой строки достаточно, чтобы компилятор TypeScript работал без ошибок. Еще один способ "хакнуть" типы состоит в использовании `*` вместо названия модуля - все существующие и будущие модули без типов будут иметь тип `any`.

Такое решение подходит для небольшого количества модулей без типов. Однако, рано или поздно придется определять отсутствующие типы самостоятельно. И вот как это делается.

#### Автоматическая генерация типов

Можно использовать флаги `--allowJs` и `--declaration`, чтобы посмотреть на предложение `TS` относительно отсутствующих типов.

Если это не сработает, воспользуйтесь <a href="https://github.com/Microsoft/dts-gen">`dts-gen`</a> - утилитой, использующей форму объекта, полученую во время выполнения, для аккуратной типизации всех доступных свойств. Названный инструмент довольно хорошо справляется со своей задачей, но он пока не поддерживает использование JSDoc-комментариев для популяции дополнительных типов.

```bash
yarn global add dts-gen
dts-gen -m <module-name>
```

Существуют и другие похожие инструменты.

#### Типизация экспортированных хуков

Типизация хуков напоминает типизацию чистых функций.

Приведенные ниже примеры работают при соблюдении двух условий:

- У нас имеется файл с определениями типов
- У нас есть доступ к исходному коду - особенно к коду, экспортирующему функцию, которую мы собираемся использовать. В большинстве случаев речь идет о файле `index.js`. Обычно, нам требуется минимум два определения типов (один для входящих пропов (input prop) и один для возвращаемого значения (return prop)) для полноценного определения хука. Предположим, что типизируемый хук имеет такую сигнатуру:

```tsx
const useUntypedHook = (props) => {
  // здесь происходит что-то интересное
  return {
    // возвращаемое значение
  }
}
```

Тогда определение типа будет иметь следующий синтаксис:

```tsx
declare module 'use-untyped-hook' {
  export interface InputProps {} // определение типов для пропов
  export interface ReturnProps {} // определение типов для возвращаемых пропов
  export default function useUntypedHook(
    prop: InputProps
    // ...
  ): ReturnProps
}
```

#### Пример типизации хука

Хук (часть, которая нас интересует):

```js
const useDarkMode = (
  initialValue = false, // экспортируемый входящий проп
  {
    // экспортируемые входящие пропы
    element,
    classNameDark,
    classNameLight,
    onChange,
    storageKey = 'darkMode',
    storageProvider,
    global
  } = {}
) => {
  // ...
  return {
    // экспортируемые возвращаемые пропы
    value: state,
    enable: useCallback(() => setState(true), [setState]),
    disable: useCallback(() => setState(false), [setState]),
    toggle: useCallback(() => setState((current) => !current), [setState])
  }
}
export default useDarkMode
```

Определение типов:

```tsx
declare module 'use-dark-mode' {
  /**
  * Объект с настройками позволяет определять различные аспекты `useDarkMode`
  */
  export interface DarkModeConfig {
    classNameDark?: string // Название класса для установки "темного режима". По умолчанию - "dark-mode"
    classNameLight?: string // Название класса для установки "светлого" режима. По умолчанию - "light-mode"
    element?: HTMLElement // Элемент, к которому применяются классы. По умолчанию - `document.body`
    onChange?: (val?: boolean) => void // Перезаписывает дефолтный обработчик смены классов кастомным колбеком
    storageKey?: string // Определяет ключ для `localStorage`. По умолчанию - "dark-mode". Установка значения в `null` отключает запись в хранилище
    storageProvider?: WindowLocalStorage // Провайдер хранилища. По умолчанию - `localStorage`
    global?: Window // Глобальный объект. По умолчанию - `window`
  }

  /**
  * Объект, возвращаемый из вызова `useDarkMode`
  */
  export interface DarkMode {
    readonly value: boolean
    enable: () => void
    disable: () => void
    toggle: () => void
  }

  export default function useDarkMode(
    initialState?: boolean,
    config?: DarkModeConfig
  ): DarkMode
}
```

## Решение проблем: операторы

- `typeof` и `instanceof`: используются для уточнения типов
- `keyof`: получение ключей объекта
- `O[K]`: поиск свойства
- `[K in O]`: маппированные (связанные) типы
- `+`, `-`, `readonly`, `?`: модификаторы дополнения, исключения, доступности только для чтения и опциональности
- `x ? Y : Z`: условные типы для общих типов, синонимов типов, типов параметров функции
- `!`: ненулевое утверждение для обнуляемых типов
- `=`: общий тип дефолтного параметра для общих типов
- `as`: утверждение типа
- `is`: предохранитель для типов, возвращаемых функцией

Пожалуй, самой сложной темой являются условные типы.

## Решение проблем: утилиты

- `ConstructorParameters`: кортеж типов параметров конструктора класса
- `Exclude`: исключение одного типа из другого
- `Extract`: выбор (извлечение) подтипа для присвоения другому типу
- `InstanceType`: тип экземляра, который мы получаем при вызове конструктора класса с помощью ключевого слова `new`
- `NonNullable`: исключение из типа значений `null` и `undefined`
- `Parameters`: кортеж типов параметров функции
- `Partial`: делает все свойства объекта опциональными
- `Readonly`: делает все свойства объекта доступными только для чтения
- `ReadonlyArray`: создает иммутабульный массив определенного типа
- `Pick`: подтип типа объекта с подмножеством его ключей
- `Record`: карта со ссылками между ключом типа и его значением
- `Required`: делает все свойства объекта обязательными
- `ReturnType`: тип, возвращаемый функцией

## Решение проблем: tsconfig.json

[Опции компилятора](https://www.typescriptlang.org/docs/handbook/compiler-options.html). [Полный список настроек](https://www.typescriptlang.org/tsconfig). Пример настроек для приложений (не подходит для библиотек):

```tsx
{
  "compilerOptions": {
    "incremental": true,
    "outDir": "build/lib",
    "target": "es5",
    "module": "esnext",
    "lib": ["dom", "esnext"],
    "sourceMap": true,
    "importHelpers": true,
    "declaration": true,
    "rootDir": "src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": false,
    "jsx": "react",
    "moduleResolution": "node",
    "baseUrl": "src",
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "suppressImplicitAnyIndexErrors": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "scripts"]
}
```

Некоторые важные настройки:

- `esModuleInterop` - отключает импорт пространства имен (`import * as foo from 'foo'`) и включает более привычный импорт в стиле CJS/AMD/UMD (`import bar from 'bar'`)
- `strict`: `strictPropertyInitialization` - требует инициализации полей класса или явного определения того, что они могут иметь значение `undefined`. Данная проблема может быть решена с помощью утверждения об окончательном присвоении (definite assignment assertion)
- `typeRoots`: `['./typings', './node_modules/@types']` - позволяет указать директорию `typings` в качестве источника типов для `TS`

## Решение проблем: исправление багов в официальных определениях

Если вы столкнулись с проблемой в официальных определениях типов библиотеки, можно копировать данную библиотеку, исправить проблему и указать TypeScript использовать локальную версию библиотеки с помощью поля `paths` в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "mobx-react": ["../typings/modules/mobx-react"]
    }
  }
}
```

Если вам нужно добавить интерфейс или отсутствующего члена в существующий интерфейс, копировать весь пакет с типами не нужно. Достаточно использовать объединение определений:

```tsx
my-typings.ts
declare module 'plotly.js' {
  interface PlotlyHTMLElement {
    removeAllListeners(): void
  }
}

// MyComponent.tsx
import { PlotlyHTMLElement } from 'plotly.js'

const f = (e: PlotlyHTMLElement) => {
  e.removeAllListeners()
}
```

Для быстрого старта можно импортировать модуль как `any`:

```tsx
// my-typings.ts
declare module 'plotly.js'
```

Поскольку нам не нужно явно импортировать такие определения, их часто называют "объявлениями внешних модулей". Такие объявления можно определять в `.ts` файлах (без импорта/эскпорта) или в `.d.ts` файлах в любом месте проекта.

Также можно определять внешние переменные и внешние определения типов:

```tsx
// тип внешней утилиты
type ToArray<T> = T extends unknown[] ? T : T[]
// внешняя переменная
declare let process: {
  env: {
    NODE_ENV: "development" | "production"
  }
}
process = {
  env: {
    NODE_ENV: "production"
  }
}
```
