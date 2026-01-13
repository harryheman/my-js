---
sidebar_position: 6
title: Размышления о React
description: Мысли о том, как следует писать код на React
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'best practices', 'recommendations', 'лучшие практики', 'рекомендации', 'советы']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'best practices', 'recommendations', 'лучшие практики', 'рекомендации', 'советы']
---

# Размышления о React

> [Источник](https://github.com/mithi/react-philosophies)

## Необходимый минимум

### Когда машина умнее тебя

1. Выполняй статический анализ кода с помощью [`ESLint`](https://eslint.org/). Используй плагин [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) для перехвата ошибок, связанных с неправильным использованием хуков.

_Установка_

```bash
npm i -D eslint-plugin-react-hooks

# or
yarn add -D eslint-plugin-react-hooks
```

_Настройки `eslint`_

```json
{
  "extends": [
    // ...
    "plugin:react-hooks/recommended"
  ]
}
```

Или:

```json
{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

При использовании [`create-react-app`](https://create-react-app.dev/) данный плагин включается в проект автоматически.

- [Feedback for 'exhaustive-deps' lint rule](https://github.com/facebook/react/issues/14920)

2. Включай [строгий режим](https://reactjs.org/docs/strict-mode.html). На дворе 2022 год, в конце концов.

```js
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
```

3. [Не обманывай `React` о зависимостях](https://overreacted.io/a-complete-guide-to-useeffect/#two-ways-to-be-honest-about-dependencies). Исправляй предупреждения/ошибки, связанные с зависимостями, возникающие при использовании хуков `useEffect`, `useCallback` и `useMemo`. Для обеспечения актуальности колбеков без выполнения лишних ререндеров можно использовать [такой паттерн](https://epicreact.dev/the-latest-ref-pattern-in-react).

4. [Не забывай добавлять ключи](https://epicreact.dev/why-react-needs-a-key-prop) при использовании [`map`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/map) для рендеринга списка элементов.

5. [Используй хуки только на верхнем уровне](https://reactjs.org/docs/hooks-rules.html). Не вызывай их в циклах, условиях и вложенных функциях.

6. Разберись с тем, что означает предупреждение [`Can't perform state update on unmounted component`](https://github.com/facebook/react/pull/22114) (невозможно обновить состояние размонтированного компонента).

7. Избегай появления [белого экрана смерти](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react) путем использования [предохранителей](https://reactjs.org/docs/error-boundaries.html) на разных уровнях приложения. Предохранители можно также использовать для отправки сообщений в сервис мониторинга ошибок, такой как [`Sentry`](https://sentry.io/) - [статья о том, как это сделать](https://brandondail.com/posts/fault-tolerance-react).

8. Если в консоли инструментов разработчика в браузере имеются предупреждения или ошибки, на это есть причина!

9. Не забывай про [`tree-shaking`](https://webpack.js.org/guides/tree-shaking/) (тряску дерева).

10.  [`Prettier`](https://prettier.io/) (или похожие инструменты) избавляет от необходимости заботиться о единообразном форматировании кода за счет автоматизации этого процесса.

11.  [`TypeScript`](https://www.typescriptlang.org/) сделает твою жизнь намного проще.

12. Для открытых проектов настоятельно рекомендую использовать [`Code Climate`](https://codeclimate.com/quality/). Автоматическое обнаружение "дурно пахнущего" кода мотивирует на борьбу с техническим долгом.

13. [`Next.js`](https://nextjs.org/) - отличный метафреймворк.

### Код - это необходимое зло

> "Лучший код - это его отсутствие. Каждая новая строка кода, которую ты написал, это код, который кому-то придется отлаживать, код, который кому-то придется читать и понимать, код, который кому-то придется поддерживать." Jeff Atwood

> "Одним из самых продуктивных дней в моей жизни был день, когда я просто удалил 1000 строк кода." Eric S. Raymond

- [Пиши меньше кода](https://svelte.dev/blog/write-less-code)
- [Код - это зло](https://github.com/sapegin/washingcode-book/blob/master/manuscript/Code_is_evil.md)

__TL;DR__

1. Думай перед добавлением новой зависимости.
2. Пиши код в стиле, характерном для `React`.
3. Не умничай! [YAGNI](https://ru.wikipedia.org/wiki/YAGNI)

__Думай перед добавлением новой зависимости.__

Чем больше зависимостей в проекте, тем большее количество кода загружается браузером. Спроси себя, действительно ли ты используешь возможности, предоставляемые конкретной библиотекой?

_Возможно, тебе это не нужно_

1. Действительно ли тебе нужен [`Redux`](https://redux.js.org/)? Может быть. Но не забывай, что `React` - сам по себе [отличный инструмент для управления состоянием](https://kentcdodds.com/blog/application-state-management-with-react).

2. Действительно ли тебе нужен [`Apollo Client`](https://www.apollographql.com/docs/react/)? `Apollo Client` предоставляет большое количество прикольных "фич". Однако его использование существенно увеличивает размер сборки. Если в приложении используются фичи, которые не являются уникальными для `Apollo Client`, попробуй заменить его на такие библиотеки, как [`SWR`](https://github.com/vercel/swr) или `react-query`(https://react-query.tanstack.com/comparison) (или обойтись вообще без библиотек).

3. [`Axios`](https://github.com/axios/axios)? `axios` - отличная библиотека, возможности которой нелегко реализовать с помощью нативного [`fetch`](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch). Но если единственной причиной использования `axios` является более привлекательный интерфейс, реализуй обертку над `fetch` - [статья о том, как это сделать](https://habr.com/ru/company/timeweb/blog/571252/).

4. [`Lodash`](https://lodash.com/)/[`Underscore`](https://underscorejs.org/)? [Вам не нужен `lodash`/`underscore`](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore).

5. [`Moment.js`](https://momentjs.com/)? [Вам не нужен `momentjs`](https://github.com/you-dont-need/You-Dont-Need-Momentjs).

6. Возможно, для "темизации" (режим `light`/`dark`) тебе не нужен контекст. Попробуй использовать для этого [`переменные CSS`](https://epicreact.dev/css-variables/).

7. Возможно, тебе не нужен `JavaScript`. Современный `CSS` - очень мощный инструмент. [Вам не нужен `JavaScript`](https://github.com/you-dont-need/You-Dont-Need-JavaScript).

__Пиши код в стиле, характерном для `React`.__

1. Избегай [сложных условий](https://github.com/sapegin/washingcode-book/blob/master/manuscript/Avoid_conditions.md) и используй короткие вычисления (оператор `&&`).
2. Вместо традиционных циклов (`for`, `for in`, `for of` и т.д.) используй цепочки из встроенных функций высшего порядка (`map`, `filter`, `reduce`, `find`, `some` и др.). Но не забывай, что в некоторых случаях традиционные циклы могут быть более производительными.

__Не умничай!__

> "Что произойдет с моим софтом в будущем? Возможно, случится то и это. Давайте сразу это реализуем, раз уж мы все равно разрабатываем эту часть приложения. Это позволит предвосхитить дальнейшее развитие проекта".

Никогда так не делай! Реализуй только те вещи, которые нужны в данный момент. Не считай себя Нострадамусом.

- [Yagni](https://martinfowler.com/bliki/Yagni.html)
- [You Aren't Gonna Need It](https://wiki.c2.com/?YouArentGonnaNeedIt)

### Код, над которым ты работал, должен стать лучше, чем был

Если ты встретил код, который "дурно пахнет", исправь его. Если исправить его сложно или на это нет времени, хотя бы пометь его комментарием (`FIXME` или `TODO`) с краткой характеристикой проблемы. Пусть все об этом знают. Это покажет другим, что тебе не все равно, а также добросовестное отношение к тому, что ты делаешь.

Примеры "дурно пахнущего" кода:

- ❌&nbsp; методы или функции принимают большое количество аргументов
- ❌&nbsp; сложные логические проверки
- ❌&nbsp; длинные строки кода, помещенные в одну строку
- ❌&nbsp; синтаксически идентичный дублирующийся код (такой код может иметь разное форматирование)
- ❌&nbsp; функции или методы, выполняющие много задач
- ❌&nbsp; классы или компоненты, включающие много функций или методов
- ❌&nbsp; сложная логика в одной функции или методе
- ❌&nbsp; функции или методы с большим количеством инструкций `return`
- ❌&nbsp; код с одинаковой структурой (названия переменных могут отличаться)

"Дурно пахнущий" код не обязательно означает, что такой код нужно менять. Это лишь означает, что, скорее всего, ты мог бы реализовать аналогичный функционал лучше.

### Ты можешь сделать лучше

- `setState` (из `useState`) и `dispatch` (из `useReducer`) не нужно помещать в массив зависимостей таких хуков, как `useEffect` и `useCallback`, поскольку `React` гарантирует их стабильность.

```js
// ❌
const decrement = useCallback(() => setCount(count - 1), [count, setCount])
const decrement = useCallback(() => setCount(count - 1), [count])

// ✅
const decrement = useCallback(() => setCount((c) => c - 1), [])
```

- если `useMemo` или `useCallback` не имеют зависимостей, скорее всего, ты неправильно их используешь

```js
// ❌
const MyComponent = (props) => {
  const fnToCall = useCallback((str) => `hello ${str || 'world'}`, [])
  const aConstant = useMemo(() => ({ x: 1, y: 3 }), [])

  // ...
}

// ✅
const A_CONSTANT = { x: 1, y: 3 }
const fnToCall = (str) => `hello ${str || 'world'}`
const MyComponent = (props) => {
  // ...
}
```

- оборачивай кастомный контекст в хук: это не только сделает интерфейс лучше, но и позволит ограничиться одним импортом

```js
// ❌
import { useContext } from 'react'
import { SomeContext } from './context'

export default function App() {
  const somethingFromContext = useContext(SomeContext)
  // ...
}

// ✅
export function useSomeContext() {
  const context = useContext(SomeContext)
  if (!context) {
    throw new Error('useSomeContext может использоваться только внутри SomeProvider')
  }
}

import { useSomeContext } from './context'

export default function App() {
  const somethingFromContext = useSomeContext()

  // ...
}
```

- думай о том, как компонент будет использоваться, перед тем, как писать код

## Дизайн для счастья

> "Любой дурак может писать код, который понимает компьютер. Хорошие программисты пишут код, который понимают люди." Martin Fowler

> "Соотношение времени, которое мы тратим на чтение кода, и времени, которое мы тратим на написание кода, составляет 10 к 1. Мы постоянно читаем старый код перед тем, как писать новый. Поэтому если ты хочешь быстро писать код, быстро выполнять задачи, если хочешь, чтобы писать код было легко, пиши такой код, который будет легко читать." Robert C. Martin

__TL;DR__

1. Избегай сложного состояния за счет удаления лишнего.
2. Передавай банан, а не гориллу, держащую банан, вместе с джунглями (старайся передавать примитивы в качестве пропов).
3. Компоненты должны быть маленькими и простыми - принцип единственной ответственности!
4. Дублирование лучше плохой абстракции (избегай преждевременных / неуместных обобщений).
5. Решай проблему передачи пропов за счет композиции. `Context` не единственное решение проблемы распределения состояния.
6. Разделяй большие `useEffect` на несколько небольших.

- [Myths about useEffect](https://epicreact.dev/myths-about-useeffect/)

7. Извлекай логику в хуки и вспомогательные функции.
8. Большой компонент лучше разделить на `logical` и `presentational` компоненты (не обязательно, зависит от ситуации).
9. Старайся, чтобы в зависимостях `useEffect`, `useCallback` и `useMemo` находились только примитивы.
10. Зависимостей этих хуков не должно быть слишком много.
11. Вместе нескольких `useState` лучше использовать один `useReducer`, особенно в случае, когда некоторые значения состояния зависят от других значений или предыдущего состояния.
12. `Context` не должен быть глобальным для всего приложения. Он должен находиться максимально близко к компонентам, потребляющим контекст. Такая техника называется "размещением совместного состояния" (state collocation).

### Избегай ненужных состояний

__Пример 1__

_Задача_

Отобразить следующую информацию о треугольнике:

- длину каждой стороны
- гипотенузу
- периметр
- площадь

Треугольник - это объект `{ a: number, b: number }` из `API`. `a` и `b` - две короткие стороны правильного треугольника.

_Плохое решение_

```tsx
const Triangle = () => {
  const [triangleInfo, setTriangleInfo] = useState<{a: number, b: number} | null>(null)
  const [hypotenuse, setHypotenuse] = useState<number | null>(null)
  const [perimeter, setPerimeter] = useState<number | null>(null)
  const [area, setArea] = useState<number | null>(null)

  useEffect(() => {
    fetchTriangle().then((t) => setTriangleInfo(t))
  }, [])

  useEffect(() => {
    if (!triangleInfo) return

    const { a, b } = triangleInfo
    const h = computeHypotenuse(a, b)
    setHypotenuse(h)
    const _area = computeArea(a, b)
    setArea(newArea)
    const p = computePerimeter(a, b, h)
    setPerimeter(p)
  }, [triangleInfo])

  if (!triangleInfo) return null

  // рендеринг
}
```

_Решение получше_

```tsx
const Triangle = () => {
  const [triangleInfo, setTriangleInfo] = useState<{a: number, b: number} | null>(null)

  useEffect(() => {
    fetchTriangle().then((t) => setTriangle(t))
  }, [])

  if (!triangleInfo) return null

  const { a, b } = triangleInfo
  const h = computeHypotenuse(a, b)
  const area = computeArea(a, b)
  const p = computePerimeter(a, b, h)

  // рендеринг
}
```

__Пример 2__

_Задача_

Разработать компонент, который будет делать следующее:

- получать список уникальных точек от `API`
- предоставлять кнопку для сортировки точек по `x` или `y` (по возрастанию)
- предоставлять кнопку для изменения `maxDistance` (каждый раз увеличивая его значение на `10`, начальным значением должно быть `100`)
- отображать только те точки, которые находятся не дальше `maxDistance` от центра (`0, 0`)
- предположим, что список включает всего 100 точек, поэтому о производительности можно не беспокоиться (в случае большого количества элементов, можно мемоизировать некоторые вычисления с помощью `useMemo()`)

_Плохое решение_

```tsx
type SortBy = 'x' | 'y'
const toggle = (current: SortBy): SortBy => current === 'x' ? 'y' : 'x'

const Points = () => {
  const [points, setPoints] = useState<{x: number, y: number}[]>([])
  const [filteredPoints, setFilteredPoints] = useState<{x: number, y: number}[]>([])
  const [sortedPoints, setSortedPoints] = useState<{x: number, y: number}[]>([])
  const [maxDistance, setMaxDistance] = useState<number>(100)
  const [sortBy, setSortBy] = useState<SortBy>('x')

  useEffect(() => {
    fetchPoints().then((r) => setPoints(r))
  }, [])

  useEffect(() => {
    const sorted = sortPoints(points, sortBy)
    setSortedPoints(sorted)
  }, [points, sortBy])

  useEffect(() => {
    const filtered = sortedPoints.filter((p) => getDistance(p.x, p.y) < maxDistance)
    setFilteredPoints(filtered)
  }, [sortedPoints, maxDistance])

  const otherSortBy = toggle(sortBy)
  const pointsToDisplay = filteredPoints.map((p) => <li key={`${p.x}-${p.y}`}>({p.x}, {p.y})</li>)

  return (
    <>
      <button onClick={() => setSortBy(otherSortBy)}>
        Сортировать по {otherSortBy}
      <button>
      <button onClick={() => setMaxDistance(maxDistance + 10)}>
        Увеличить максимальную дистанцию
      <button>
      <p>Отображаются точки, которые находятся ближе, чем {maxDistance} от центра (0, 0).<br />
      Точки отсортированы по: {sortBy} (по возрастанию)</p>
      <ol>{pointToDisplay}</ol>
    </>
  )
}
```

_Решение получше_

```tsx
// здесь также можно использовать `useReducer()`
type SortBy = 'x' | 'y'
const toggle = (current: SortBy): SortBy => current === 'x' ? : 'y' : 'x'

const Points = () => {
  const [points, setPoints] = useState<{x: number, y: number}[]>([])
  const [maxDistance, setMaxDistance] = useState<number>(100)
  const [sortBy, setSortBy] = useState<SortBy>('x')

  useEffect(() => {
    fetchPoints().then((r) => setPoints(r))
  }, [])

  const otherSortBy = toggle(sortBy)
  const filteredPoints = points.filter((p) => getDistance(p.x, p.y) < maxDistance)
  const pointToDisplay = sortPoints(filteredPoints, sortBy).map((p) => <li key={`${p.x}|${p.y}`}>({p.x}, {p.y})</li>)

  return (
    <>
      <button onClick={() => setSortBy(otherSortBy)}>
        Сортировать по {otherSortBy}
      <button>
      <button onClick={() => setMaxDistance(maxDistance + 10)}>
        Увеличить максимальную дистанцию
      <button>
      <p>Отображаются точки, которые находятся ближе, чем {maxDistance} от центра (0, 0).<br />
      Точки отсортированы по: {sortBy} (по возрастанию)</p>
      <ol>{pointToDisplay}</ol>
    </>
  )
}
```

### Передавай банан

> "Хотел банан, а получил гориллу, держащую банан, вместе с джунглями." Joe Armstrong

В качестве пропов должны передаваться примитивы (по-возможности).

Это сделает компоненты менее зависимыми друг от друга, степень зависимости компонентов будет ниже. Слабая связанность облегчает изменение, замену и удаление одних компонентов без необходимости серьезной модификации других.

__Пример__

_Задача_

Создать компонент `MemberCard`, включающий 2 компонента: `Summary` и `SeeMore`. `MemberCard` принимает проп `id`. `MemberCard` использует хук `useMember` для получения следующей информации на основе `id`:

```tsx
type Member = {
  id: string
  firstName: string
  lastName: string
  title: string
  imgUrl: string
  webUrl: string
  age: number
  bio: string
  // еще 100 полей
}
```

Компонент `SeeMore` должен отображать `age` и `bio` из `member`, а также предоставлять кнопку для отображения/скрытия этой информации.

Компонент `Summary` должен рендерить изображение `member`. Также он должен отображать `title`, `firstName` и `lastName`. Клик по имени `member` должен перенаправлять на его профиль. `Summary` также может иметь дополнительный функционал.

_Плохое решение_

```tsx
const Summary = ({ member }: { member: Member }) => {
  return (
    <>
      <img src={member.imgUrl} />
      <a href={member.webUrl} >
        {member.title}. {member.firstName} {member.lastName}
      </a>
    </>
  )
}

const SeeMore = ({ member }: { member: Member }) => {
  const [seeMore, setSeeMore] = useState<boolean>(false)
  return (
    <>
      <button onClick={() => setSeeMore(!seeMore)}>
        {seeMore ? "Скрыть" : "Показать"}
      </button>
      {seeMore && <>Возраст: {member.age} | Биография: {member.bio}</>}
    </>
  )
}

const MemberCard = ({ id }: { id: string }) => {
  const member = useMember(id)
  return <><Summary member={member} /><SeeMore member={member} /></>
}
```

_Решение получше_

```tsx
const Summary = ({ imgUrl, webUrl, header }: { imgUrl: string, webUrl: string, header: string }) => {
  return (
    <>
      <img src={imgUrl} />
      <a href={webUrl}>{header}</a>
    </>
  )
}

const SeeMore = ({ componentToShow }: { componentToShow: ReactNode }) => {
  const [seeMore, setSeeMore] = useState<boolean>(false)
  return (
    <>
      <button onClick={() => setSeeMore(!seeMore)}>
        {seeMore ? "Скрыть" : "Показать"}
      </button>
      {seeMore && <>{componentToShow}</>}
    </>
  )
}

const MemberCard = ({ id }: { id: string }) => {
  const { title, firstName, lastName, webUrl, imgUrl, age, bio } = useMember(id)
  const header = `${title}. ${firstName} ${lastName}`
  return (
    <>
      <Summary {...{ imgUrl, webUrl, header }} />
      <SeeMore componentToShow={<>Возраст: {age} | Биография: {bio}</>} />
    </>
  )
}
```

### Компоненты должны быть маленькими и простыми

__Что означает принцип единственной ответственности (single responsibility principle)?__

Это означает, что компонент должен решать только одну задачу.

Компонент, который решает несколько задач, сложно использовать повторно. Например, когда нам требуется лишь часть функционала такого компонента. Скорее всего, код такого компонента будет сложным и запутанным. Компоненты, которые решают одну задачу, изолированы от остального приложения, что позволяет произвольно комбинировать компоненты и переиспользовать их без дублирования.

Как понять, что компонент отвечает данному критерию?

> Попробуй описать компонент одним предложением. Если компонент решает одну задачу, у тебя получится это сделать. Если же тебе приходится использовать союзы "и" или "или", тогда компонент, скорее всего, нарушает принцип единственной ответственности.

Исследуй состояние компонента, его пропы и хуки, которые в нем используются, а также переменные и методы, которые определяются в компоненте (их не должно быть слишком много). Нужны ли все эти вещи для решения компонентом поставленной перед ним задачи? Если какие-то вещи не нужны, перенеси их в другое место или раздели компонент на части.

__Пример__

_Задача_

"Нарисовать" несколько кнопок для покупки товаров определенных категорий. Например, пользователь может выбрать сумки, стулья или еду.

Функционал должен быть примерно следующим:

- нажатие каждой кнопки приводит к открытию модального окна, где можно выбирать и "сохранять" товары
- при бронировании товара рядом с соответствующей кнопкой должна отображаться галочка
- пользователь должен иметь возможность редактировать заказ (добавлять или удалять товары) даже после бронирования
- при наведении на кнопку курсора должен отображаться компонент `WavingHand`
- кнопка должна блокироваться при отсутствии товаров определенной категории
- при наведении курсора на заблокированную кнопку должна отображаться подсказка `Недоступно`
- фон заблокированной кнопки должен быть `gray`
- фон "забронированной" кнопки должен быть `green`
- фон обычной кнопки должен быть `red`
- кнопка для каждой категории должна иметь уникальную подпись и иконку

_Плохое решение_

```tsx
type ShopCategoryTileProps = {
  isBooked: boolean
  icon: ReactNode
  label: string
  componentInsideModal?: ReactNode
  items?: { name: string, quantity: number }[]
}

const ShopCategoryTile = ({
  icon,
  label,
  items
  componentInsideModal,
}: ShopCategoryTileProps ) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [hover, setHover] = useState(false)
  const disabled = !items || items.length  === 0

  return (
    <>
      <Tooltip title="Недоступно" show={disabled}>
        <StyledButton
          className={disabled ? "gray" : isBooked ? "green" : "red" }
          disabled={disabled}
          onClick={() => disabled ? null : setOpenDialog(true) }
          onMouseEnter={() => disabled ? null : setHover(true)}
          onMouseLeave={() => disabled ? null : setHover(false)}
        >
          {icon}
          <StyledLabel>{label}<StyledLabel/>
          {!disabled && isBooked && <FaCheckCircle/>}
          {!disabled && hover && <WavingHand />}
        </StyledButton>
      </Tooltip>
      {componentInsideModal &&
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          {componentInsideModal}
        </Dialog>
      }
    </>
  )
}
```

_Решение получше_

```tsx
// разделяем компонент на части
const DisabledShopCategoryTile = ({ icon, label }: { icon: ReactNode, label: string }) => (
  <Tooltip title="Недоступно">
    <StyledButton disabled={true} className="gray">
      {icon}
      <StyledLabel>{label}</StyledLabel>
    </StyledButton>
  </Tooltip>
)

type ShopCategoryTileProps = {
  icon: ReactNode
  label: string
  isBooked: boolean
  componentInsideModal: ReactNode
}

const ShopCategoryTile = ({
  icon,
  label,
  isBooked,
  componentInsideModal,
}: ShopCategoryTileProps ) => {
  const [opened, setOpened] = useState(false)
  const [hovered, setHovered] = useState(false)
  const open = useCallback(() => setOpenDialog(!opened), [])
  const hover = useCallback(() => setHover(!hovered), [])

  return (
    <>
      <StyledButton
        disabled={false}
        className={isBooked ? "green" : "red"}
        onClick={open}
        onMouseEnter={hover}
        onMouseLeave={hover}
      >
        {icon}
        <StyledLabel>{label}<StyledLabel/>
        {isBooked && <FaCheckCircle/>}
        {hovered && <WavingHand />}
      </StyledButton>
      {opened &&
        <Dialog onClose={open}>
          {componentInsideModal}
        </Dialog>
      }
    </>
  )
}
```

_Еще одно плохое решение из одного реального проекта_

```tsx
const ShopCategoryTile = ({
  item,
  offers,
}: {
  item: ItemMap;
  offers?: Offer;
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { items } = useContext(OrderingFormContext)
  const [openDialog, setOpenDialog] = useState(false)
  const [hover, setHover] = useState(false)
  const isBooked =
    !item.disabled && !!items?.some((a: Item) => a.itemGroup === item.group)
  const isDisabled = item.disabled || !offers
  const RenderComponent = item.component

  useEffect(() => {
    if (openDialog && !location.pathname.includes("item")) {
      setOpenDialog(false)
    }
  }, [location.pathname]);
  const handleClose = useCallback(() => {
    setOpenDialog(false)
    history.goBack()
  }, [])

  return (
    <GridStyled
      xs={6}
      sm={3}
      md={2}
      item
      booked={isBooked}
      disabled={isDisabled}
    >
      <Tooltip
        title="Недоступно"
        placement="top"
        disableFocusListener={!isDisabled}
        disableHoverListener={!isDisabled}
        disableTouchListener={!isDisabled}
      >
        <PaperStyled
          disabled={isDisabled}
          elevation={isDisabled ? 0 : hover ? 6 : 2}
        >
          <Wrapper
            onClick={() => {
              if (isDisabled) {
                return;
              }
              dispatch(push(ORDER__PATH));
              setOpenDialog(true);
            }}
            disabled={isDisabled}
            onMouseEnter={() => !isDisabled && setHover(true)}
            onMouseLeave={() => !isDisabled && setHover(false)}
          >
            {item.icon}
            <Typography variant="button">{item.label}</Typography>
            <CheckIconWrapper>
              {isBooked && <FaCheckCircle size="26" />}
            </CheckIconWrapper>
          </Wrapper>
        </PaperStyled>
      </Tooltip>
      <Dialog fullScreen open={openDialog} onClose={handleClose}>
        {RenderComponent && (
          <RenderComponent item={item} offer={offers} onClose={handleClose} />
        )}
      </Dialog>
    </GridStyled>
  )
}
```

### Дублирование лучше плохой абстракции

Избегайте преждевременной / неуместной генерализации. Если реализация простой фичи требует написания большого количества кода, изучите другие способы ее реализации. Советую взглянуть на [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction).

- [AHA Programming](https://kentcdodds.com/blog/aha-programming)

## Советы по производительности

> "Преждевременная оптимизация - корень зла." Tony Hoare

> "Одно точное измерение лучше тысячи экспертных мнений." Grace Hopper

__TL;DR__

1. Если тебе кажется, что что-то работает медленно, убедись в этом с помощью специальных инструментов, например, [профилировщика инструментов React-разработчика](https://ru.reactjs.org/docs/profiler.html).
2. Используй `useMemo()` только для "дорогих" вычислений.
3. Используй `memo()`, `useMemo()` и `useCallback()` для предотвращение повторного рендеринга. При этом, количество зависимостей должно быть небольшим, а сами зависимости, преимущественно, должны быть примитивами.
4. Убедись, что `memo()`, `useMemo()` и `useCallback()` решают задачу (действительно ли они предотвращают ререндеринг?).
5. Почини медленный рендеринг перед тем, как чинить ререндеринг.
6. Размещай состояние максимально близко к компонентам, которые его используют. Это облегчит изучение кода и сделает приложение быстрее.
7. `Context` должен быть логически отделен от остальной части приложения. Через провайдер должно передаваться минимально возможное количество значений. Это объясняется тем, что компоненты, потребляющие контекст, будут подвергаться повторному рендерингу при изменении любого значения, содержащегося в контексте, даже если они не используют это значение (эту проблему можно решить с помощью `useMemo()`).
8. Контекст можно оптимизировать посредством разделения `state` и `dispatch`.
9. Разберись с [ленивой загрузкой](https://ru.reactjs.org/docs/concurrent-mode-suspense.html) и [разделением кода](https://ru.reactjs.org/docs/code-splitting.html).
10. "Виртуализируй" списки (с помощью [`react-virtual`](https://github.com/tannerlinsley/react-virtual) или похожих решений).
11. Меньший размер сборки, как правило, означает более быстрое приложение.
12. Какую библиотеку для работы с формами использовать? Никакую. Но если очень хочется, то советую взглянуть на [`react-hook-form`](https://react-hook-form.com/).

- [State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- [Profile a React App for Performance](https://kentcdodds.com/blog/profile-a-react-app-for-performance)
- [How to optimize your context value](https://kentcdodds.com/blog/how-to-optimize-your-context-value)
- [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [One React mistake that's slowing you down](https://epicreact.dev/one-react-mistake-thats-slowing-you-down/)
- [One simple trick to optimize React re-renders](https://kentcdodds.com/blog/optimize-react-re-renders)
