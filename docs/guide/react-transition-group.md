---
sidebar_position: 11
title: Руководство по React Transition Group
description: Руководство по React Transition Group
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'react transition group', 'react-transition-group', 'transition', 'animation', 'guide', 'руководство', 'переход', 'анимация']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'react transition group', 'react-transition-group', 'transition', 'animation', 'guide', 'руководство', 'переход', 'анимация']
---

# React Transition Group

> [React Transition Group](https://reactcommunity.org/react-transition-group/) предоставляет простые компоненты для легкой реализации переходов (transitions) при рендеринге компонентов. `React Transition Group` не является библиотекой для анимации, вместо этого, он обрабатывает стадии перехода, управляет классами, группирует элементы и манипулирует [DOM](https://ru.wikipedia.org/wiki/Document_Object_Model) наиболее эффективным образом, облегчая реализацию визуальных переходов.

## Установка

```bash
yarn add react-transition-group
# или
npm i react-transition-group
```

## Компоненты

### Transition

Компонент `Transition` позволяет описывать переход компонента из одного состояния в другое в течение времени с помощью простого декларативного синтаксиса. Он, обычно, используется для анимирования монтирования и размонтирования компонентов, но также может использоваться для описания других переходных состояний.

_Обратите внимание_: `Transition` - это платформонезависимый базовый компонент. В случае с CSS-переходами лучше использовать `CSSTransition`. Он наследует все возможности `Transition`, а также содержит дополнительный функционал для реализации CSS-переходов.

По умолчанию `Transition` не меняет поведение компонента, за рендеринг которого он отвечает, он лишь следит за состояниями "входа" (enter) и "выхода" (exit) этого компонента. Осмысление названных состояний и применение эффектов - это задача разработчика. Например, мы можем добавлять стили при входе и выходе компонента следующим образом:

```jsx
import { Transition } from 'react-transition-group'

const duration = 300

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
}

const Fade = ({ open }) => (
  <Transition in={open} timeout={duration}>
    {(state) => (
      <div
        style={{
          ...defaultStyle,
          ...transitionStyles[state],
        }}
      >
        Аз есмь появление/исчезновение!
      </div>
    )}
  </Transition>
)
```

Существует 4 основных состояния перехода:

- `entering`
- `entered`
- `exiting`
- `exited`

Эти состояния переключаются с помощью пропа `in`. При значении данного пропа, равном `true`, начинается вхождение компонента. На этой стадии компонент переходит к состоянию `entering`, а после завершения перехода к состоянию `entered`. Рассмотрим пример:

```jsx
function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Transition in={open} timeout={500}>
        {state => (
          // ...
        )}
      </Transition>
      <button onClick={() => setOpen(true)}>
        Нажмите для начала вхождения компонента
      </button>
    </div>
  )
}
```

При нажатии кнопки компонент перейдет к состоянию `entering` и будет находиться в этом состоянии на протяжении 500 мс (значение `timeout`), после чего перейдет в состояние `entered`.

При значении `in`, равном `false`, происходит тоже самое, только состояние меняется от `exiting` до `exited`.

#### Пропы

- `nodeRef` - ссылка на DOM-элемент, который "нуждается" в переходе. При использовании данного пропа, `node` не передается в колбеки (`onEnter` и др.), поскольку пользователь уже имеет прямой доступ к узлу. При изменении пропа `key` компонента `Transition` в `TransitionGroup`, в `Transition` должен быть передан новый `nodeRef`

- `children` - вместо React-элемента может быть использован функциональный компонент. Функция вызывается с текущим статусом перехода (`entering`, `entered`, `exiting`, `exited`), что может быть использовано для применения к компоненту пропов, зависящих от контекста:

```jsx
<Transition in={open} timeout={150}>
  {(state) => <MyComponent className={`fade fade-${state}`} />}
</Transition>
```

- `in` - переключает состояния компонента

- `mountOnEnter` - по умолчанию дочерний компонент монтируется вместе с родительским `Transition`. Для того, чтобы монтировать компонент "лениво" при первом `in={true}`, следует установить `mountOnEnter`. После первого вхождения, компонент останется смонтированным, если не определено `unmountOnExit`

- `unmountOnExit` - по умолчанию дочерний компонент остается смонтированным при достижении состояния `exited`. Установка `unmountOnExit` означает, что компонент будет размонтирован после выхода

- `appear` - по умолчанию вхождение элемента при первом монтировании не анимируется, независимо от значения `in`. Для изменения этого поведения, следует установить `appear` и `in`в значение `true`

_Обратите внимание_: это не добавляет особых состояний, например, `appearing/appeared`, это добавляет лишь дополнительный переход вхождения. Тем не менее, в компоненте `CSSTransition` переход первого вхождения компонента представлен классами `.appear-*`, что предоставляет возможность их особой стилизации

- `enter` - включает/отключает переходы входа

- `exit` - включает/отключает переходы выхода

- `timeout` - продолжительность перехода в мс. Требуется, если не передан `addEndListener`. Можно определять один `timeout` для всех переходов:

```jsx
timeout={500}
```

или для каждого перехода в отдельности:

```jsx
timeout={{
  appear: 500,
  enter: 300,
  exit: 500
}}
```

- `appear` - по умолчанию имеет такое же значение, что и `enter`
- `enter` - по умочланию имеет значение `0`
- `exit` - по умолчанию имеет значение `0`

- `addEndListener` - добавляет пользовательский обработчик окончания перехода. Вызывается с соответствующим узлом DOM и колбеком `done`. Позволяет реализовать более сложную логику окончания перехода. В этом случае `timeout` используется в качестве запасного варианта

_Обратите внимание_: при передаче пропа `nodeRef`, `addEndListener` не получает аргумента `node`:

```jsx
addEndListener={(node, done) => {
  // Используем CSS-событие `transitionend` в качестве индикатора окончания перехода
  node.addEventListener('transitionend', done, false)
}}
```

- `onEnter` - колбек, вызываемый перед применением статуса `entering`. Колбек получает дополнительный параметр `isAppearing` в качестве индикатора вхождения при первоначальном монтировании: `onEnter={(node, isAppearing) => {}}`. При наличии `nodeRef`, `node` не передается

- `onEntering` - колбек, вызываемый после применения статуса `entering`: `onEntering={(node, isAppearing) => {}}`

- `onEntered` - колбек, вызываемый после применения статуса `entered`: `onEntered={(node, isAppearing) => {}}`

- `onExit` - колбек, вызываемый перед применением статуса `exiting`: `onExit={(node) => {}}`

- `onExiting` - колбек, вызываемый после применения статуса `exiting`: `onExiting={(node) => {}}`

- `onExited` - колбек, вызываемый после применения статуса `exited`: `onExited={(node) => {}}`

### CSSTransition

Данный компонент следует использовать при реализации переходов и анимации с помощью CSS. Он расширяет возможности `Transition` и наследует все его пропы.

`CSSTransition` применяет CSS-классы для состояний `appear`, `enter` и `exit`. Сначала применяется первый класс, например, `className-enter`, где `className` - произвольное название класса, указанное в пропе `classNames`, затем класс `*-active`, например, `enter-active`, свидетельствующий о начале перехода, после завершения перехода для фиксации состояния применяется класс `*-done`, например, `enter-done`.

```jsx
function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <CSSTransition in={open} timeout={200} classNames='my-node'>
        <div>{'Я буду получать классы my-node-*'}</div>
      </CSSTransition>
    </div>
  )
}
```

`CSSTransition` запускает принудительную перерисовку, между `enter` и `enter-active`. Это позволяет выполнять переход между указанными состояниями, несмотря на то, что они добавляются почти одновременно. В частности, это делает возможным анимирование появления компонента.

```css
.my-node-enter {
  opacity: 0;
}

.my-node-enter-active {
  opacity: 1;
  transition: opacity 200ms;
}

.my-node-exit {
  opacity: 1;
}

.my-node-exit-active {
  opacity: 0;
  transition: opacity 200ms;
}
```

Классы `*-active` представляют стили, которые будут анимироваться, поэтому свойство `transition` должно определяться только в них, в противном случае переход может быть неожиданным! Обычно, это не вызывает проблем при симметричности переходов, т.е. когда `*-enter-active` и `*-exit` являются одинаковыми, как в приведенном выше примере, но в более сложных случаях это становится критически важным.

_Обратите внимание_: при использовании пропа `appear`, убедитесь в определении стилей для классов `*-appear`.

#### Пример

```jsx
import { useState, useRef } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'
import { CSSTransition } from 'react-transition-group'

import './styles.css'

function Example() {
  const [showButton, setShowButton] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const ref = useRef()

  return (
    <Container className='pt-4'>
      {showButton && (
        <Button onClick={() => setShowMessage(true)}>Показать сообщение</Button>
      )}
      <CSSTransition
        in={showMessage}
        timeout={300}
        classNames='alert'
        unmountOnExit
        onEnter={() => setShowButton(false)}
        onExited={() => setShowButton(true)}
        nodeRef={ref}
      >
        <Alert variant='primary' style={{ maxWidth: '480px' }} ref={ref}>
          <Alert.Heading>Анимированное сообщение</Alert.Heading>
          <p>Данное сообщение анимируется с помощью переходов</p>
          <Button onClick={() => setShowMessage(false)}>Закрыть</Button>
        </Alert>
      </CSSTransition>
    </Container>
  )
}

export default Example
```

```css
.alert-enter {
  opacity: 0;
  transform: scale(0.9);
}

.alert-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

.alert-exit {
  opacity: 1;
}

.alert-exit-active {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 300ms, transform 300ms;
}
```

#### Пропы

- `classNames` - названия CSS-классов, применяемых при появлении, вхождении, выходе компонента, а также при завершении перехода. Может быть указано одно название, к которому через дефис будут добавляться соответствующие классы. Например, если указано `classNames="fade`:
  - fade-appear, fade-appear-active, fade-appear-done
  - fade-enter, fade-enter-active, fade-enter-done
  - fade-exit, fade-exit-active, fade-exit-done

Несколько слов о том, как применяются эти классы:

1. Они объединяются с существующими классами компонента, так что если вы хотите определить некоторые базовые стили, то можете использовать `className`, не опасаясь, что базовые стили будут перезаписаны.
2. Если компонент монтируется с `in={false}`, никакие классы к нему не применяются (включая `*-exit-done`).
3. `fade-appear-done` и `fade-enter-done` применяются одновременно. Это позволяет определять различное поведение при завершении появления и обычного вхождения с помощью таких селекторов, как `.fade-enter-done:not(.fade-appear-done)`. В противном случае, вы можете использовать `fade-enter-done` для обработки обоих случаев.

Каждое название класса может быть определено отдельно:

```jsx
classNames={{
  appear: 'my-appear',
  appearActive: 'my-active-appear',
  appearDone: 'my-done-appear',
  enter: 'my-enter',
  enterActive: 'my-active-enter',
  enterDone: 'my-done-enter',
  exit: 'my-exit',
  exitActive: 'my-active-exit',
  exitDone: 'my-done-exit'
}}
```

Если вы хотите установить эти классы с помощью CSS-модулей:

```jsx
import styles from './styles.css'
```

возможно, вам следует использовать `camelCase`, чтобы впоследствии иметь возможность распаковать свойства с помощью spread-оператора:

```jsx
classNames={{ ...styles }}
```

- `onEnter` - колбек, вызываемый после применения `enter` или `appear`

- `onEntering` - колбек, вызываемый после применения `enter-active` или `appear-active`

- `onEntered` - колбек, вызываемый после удаления `enter` или `appear` и добавления `done`

- `onExit` - колбек, вызываемый после применения `exit`

- `onExiting` - колбек, вызываемый после применения `exit-active`

- `onExited` - колбек, вызываемый после удаления `exit` и применения `exit-done`

### SwitchTransition

Данный компонент используется для управления рендерингом между переходами состояния. В зависимости от выбранного режима и дочернего ключа, которым является компонент `Transition` или `CSSTransition`, `SwitchTransition` выполняет согласованный переход между ними.

Если выбран режим `out-in`, `SwitchTransition` ждет удаления старого потомка перед добавлением нового. Если выбран режим `in-out`, `SwitchTransition` добавляет нового потомка, ждет его вхождения и только после этого удаляет старого потомка.

_Обратите внимание_: если вы хотите, чтобы удаление старого потомка и добавление нового происходило одновременно, используйте компонент `TransitionGroup`.

```jsx
function App() {
  const [state, setState] = useState(false)

  return (
    <SwitchTransition>
      <CSSTransition
        key={state ? 'Пока' : 'Привет'}
        addEndListener={(node, done) =>
          node.addEventListener('transitionend', done, false)
        }
        classNames='fade'
      >
        <button>{state ? 'Пока' : 'Привет'}</button>
      </CSSTransition>
    </SwitchTransition>
  )
}
```

```css
.fade-enter {
  opacity: 0;
}

.fade-exit {
  opacity: 1;
}

.fade-enter-active {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
}

.fade-enter-active,
.fade-exit-active {
  transition: opacity 500ms;
}
```

#### Пример

```jsx
import { useState, useRef } from 'react'
import { Button, Form } from 'react-bootstrap'
import { SwitchTransition, CSSTransition } from 'react-transition-group'

import './styles.css'

const modes = ['out-in', 'in-out']

function Example() {
  const [mode, setMode] = useState(modes[0])
  const [state, setState] = useState(true)
  const ref = useRef()

  return (
    <>
      <div className='mb-3'>Режим:</div>
      <div className='mb-5 d-flex justify-content-center'>
        {modes.map((m) => (
          <Form.Check
            className='m-2'
            key={m}
            label={m}
            id={`mode=msContentScript${m}`}
            type='radio'
            name='mode'
            checked={mode === m}
            value={m}
            onChange={(e) => {
              setMode(e.target.value)
            }}
          />
        ))}
      </div>
      <div>
        <SwitchTransition mode={mode}>
          <CSSTransition
            key={state}
            timeout={500}
            classNames='fade'
            nodeRef={ref}
          >
            <div className='mb-3' ref={ref}>
              <Button onClick={() => setState((state) => !state)}>
                {state ? 'Привет' : 'Пока'}
              </Button>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </>
  )
}

export default Example
```

```css
body {
  padding: 2rem;
  font-family: sans-serif;
  text-align: center;
}

.fade-enter .btn {
  opacity: 0;
  transform: translateX(-100%);
}

.fade-enter-active .btn {
  opacity: 1;
  transform: translateX(0%);
}

.fade-exit .btn {
  opacity: 1;
  transform: translateX(0%);
}

.fade-exit-active .btn {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-active .btn,
.fade-exit-active .btn {
  transition: opacity 500ms, transform 500ms;
}
```

#### Пропы

- `mode` - режим перехода;
- `children` - компонент `Transition` или `CSSTransition`.

### TransitionGroup

Данный компонент управляет набором "переходящих" компонентов (`Transition` и `CSSTransition`) в списке. Он является машиной состояния (state machine) для управления монтированием и размонтированием компонентов в течение времени.

В приведенном ниже примере при удалении и добавлении задач в список, происходит автоматическое переключение пропа `in` в `TransitionGroup`.

_Обратите внимание_: `TransitionGroup` не определяет анимацию. Анимирование элемента списка зависит от переходного (переходящего) компонента. Это означает, что мы можем смешивать и объединять анимации разных элементов.

#### Пример

```jsx
import { useState } from 'react'
import { Container, ListGroup, Button } from 'react-bootstrap'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { nanoid } from 'nanoid'

import './styles.css'

function Example() {
  const [items, setItems] = useState([
    { id: '1', text: 'Eat' },
    { id: '2', text: 'Code' },
    { id: '3', text: 'Sleep' },
    { id: '4', text: 'Repeat' },
  ])

  return (
    <Container className='mt-4'>
      <ListGroup className='mb-4' style={{ maxWidth: '480px' }}>
        <TransitionGroup>
          {items.map(({ id, text }) => (
            <CSSTransition key={id} timeout={500} classNames='item'>
              <ListGroup.Item>
                <Button
                  style={{ marginRight: '1rem' }}
                  variant='danger'
                  size='sm'
                  onClick={() => {
                    setItems((items) => items.filter((item) => item.id !== id))
                  }}
                >
                  &times;
                </Button>
                {text}
              </ListGroup.Item>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </ListGroup>
      <Button
        onClick={() => {
          const text = prompt('Введите тект задачи')
          if (text) {
            setItems((items) => [...items, { id: nanoid(5), text }])
          }
        }}
      >
        Добавить элемент
      </Button>
    </Container>
  )
}

export default Example
```

```css
.item-enter {
  opacity: 0;
}

.item-enter-active {
  opacity: 1;
  transition: opacity 500ms ease-in;
}

.item-exit {
  opacity: 1;
}

.item-exit-active {
  opacity: 0;
  transition: opacity 500ms ease-in;
}
```

#### Пропы

- `component` - `TransitionGroup` по умолчанию рендерит `div`. Вы можете указать другой элемент или `null`, если хотите избежать рендеринга лишнего элемента

- `children` - набор компонентов `Transition`, проп `in` которых меняется при их вхождении и выходе. Данный компонент, обычно, используется в качестве обертки для нескольких компонентов, но может использоваться и для одного компонента. В этом случае изменение пропа `key` дочернего компонента при измменении его контента заставит `TransitionGroup` выполнить переход

- `appear` - удобный проп для управления анимацией появления всех потомков. Обратите внимание, что определение данного пропа перезапишет соответствующие настройки дочерних компонентов

- `enter` - проп для управления анимацией вхождения всех потомков

- `exit` - проп для управления анимацией выхода всех потомков

- `childFactory` - иногда может потребоваться обновить потомка после его выхода. Обычно, это делается с помощью `cloneElement`, однако, компонент может удаляться после выхода, что сделает его недоступным для потребителя. Для обновления "вышедшего" компонента можно использовать `childFactory` в качестве обертки для каждого выходящего потомка

```jsx
<TransitionGroup
  childFactory={
    (child,
    {
      classNames: 'newTransition',
      timeout: newTimeout,
    })
  }
>
  <CSSTransition key={newkey}>{/* ... */}</CSSTransition>
</TransitionGroup>
```

## Использование с [React Router](./react-router)

В случае с React Router, следует использовать `CSSTransition` для управления пропом `in` каждого маршрута. Самым сложным является анимирование выхода, поскольку маршруты меняются незамедлительно. Нам нужен способ сохранения старого маршрута в течение времени перехода. К счастью, проп `children` компонента `Route` может принимать функцию, которая не должна противоречить пропу `render`. В отличие от пропа `render`, функция из пропа `children` запускается только при совпадении маршрута. React Router передает объект, содержащий объект `match`, который существует при совпадении маршрута, в противном случае, он имеет значение `null`. Это позволяет нам управлять пропом `in` компонента `CSSTransition`.

_Обратите внимание_: при использовании React Transition Group с React Router старайтесь избегать использования компонента `Switch`, поскольку он рендерит только совпавший `Route`. Это сделает невозможным реализацию перехода выхода, поскольку существующий маршрут не будет совпадать с текущим URL и колбек `children` не запустится.

### Пример

```jsx
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import { Container, Navbar, Nav } from 'react-bootstrap'

import './styles.css'

const Home = () => (
  <>
    <h1>Home</h1>
    <p>Welcome to the Home Page</p>
  </>
)

const About = () => (
  <>
    <h1>About</h1>
    <p>This is the About Page</p>
  </>
)

const Contact = () => (
  <>
    <h1>Contact</h1>
    <p>This is the Contact Page</p>
  </>
)

const routes = [
  { path: '/', name: 'Home', Component: Home },
  { path: '/about', name: 'About', Component: About },
  { path: '/contact', name: 'Contact', Component: Contact },
]

const Example = () => (
  <Router>
    <Navbar bg='light'>
      <Nav className='mx-auto'>
        {routes.map(({ path, name }) => (
          <Nav.Link
            key={path}
            as={NavLink}
            to={path}
            activeClassName='active'
            exact
          >
            {name}
          </Nav.Link>
        ))}
      </Nav>
    </Navbar>
    <Container className='container'>
      {routes.map(({ path, Component }) => (
        <Route key={path} path={path} exact>
          {({ match }) => (
            <CSSTransition
              in={match !== null}
              timeout={300}
              classNames='page'
              unmountOnExit
            >
              <div className='page'>
                <Component />
              </div>
            </CSSTransition>
          )}
        </Route>
      ))}
    </Container>
  </Router>
)

export default Example
```

```css
.container {
  position: relative;
}

.page {
  position: absolute;
  left: 15px;
  right: 15px;
}

.page-enter {
  opacity: 0;
  transform: scale(1.1);
}

.page-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: scale(1);
}

.page-exit-active {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 300ms, transform 300ms;
}
```
