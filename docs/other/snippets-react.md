---
sidebar_position: 11
title: Сниппеты React
description: Примеры кода на React
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'snippets', 'snippet', 'examples', 'example', 'сниппеты', 'сниппет', 'примеры', 'пример']
---

# Сниппеты React

> WIP

# Инпут с динамической шириной

```js
import { useState, useEffect, useRef } from 'react'

export const FieldWithDynamicWidth = ({ username, setUsername }) => {
  const [isEdit, setIsEdit] = useState(false)
  const [inputWidth, setInputWidth] = useState(0)
  const inputRef = useRef()
  const hiddenRef = useRef()

  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEdit])

  useEffect(() => {
    if (hiddenRef.current) {
      const { width } = hiddenRef.current.getBoundingClientRect()
      setInputWidth(width)
    }
  }, [])

  function calculateWidth({ target: { value } }) {
    if (hiddenRef.current) {
      hiddenRef.current.textContent = value
      const { width } = hiddenRef.current.getBoundingClientRect()
      setInputWidth(width)
    }
  }

  function handleClick() {
    if (isEdit && inputRef.current) {
      setUsername(inputRef.current.value)
    }
    setIsEdit(!isEdit)
  }

  return (
    <div>
      <span ref={hiddenRef} className='visually-hidden'>
        {username}
      </span>
      {isEdit ? (
        <input
          type='text'
          ref={inputRef}
          defaultValue={username}
          onChange={calculateWidth}
          style={{ width: `${inputWidth}px` }}
        />
      ) : (
        <p>{username}</p>
      )}
      <button onClick={handleClick}>{isEdit ? 'Done' : 'Edit'}</button>
    </div>
  )
}
```

## Простое хранилище состояния

```tsx
import React, { createContext, useContext, useMemo, useState } from 'react'

type State = { [k: string]: any }
type InitialSetters = {
  [k: string]: (s: State, ...args: any[]) => void | Partial<State>
}
type ProxySetters = { [k: string]: (v: any) => void }
type Store = { state: State; setters: InitialSetters }
type Children = { children: React.ReactNode }

const createSetters = (
  setters: InitialSetters,
  setState: React.Dispatch<(prevState: State) => State>
) => {
  const _setters = {} as ProxySetters

  for (const key in setters) {
    _setters[key] = (...args) => {
      setState((state) => {
        const newState = setters[key](state, ...args)

        return { ...state, ...newState }
      })
    }
  }

  return _setters
}

export function createStore(store: Store) {
  const StateContext = createContext<State>(store.state)
  const SetterContext = createContext<ProxySetters>(store.setters)

  const Provider = ({ children }: Children) => {
    const [state, setState] = useState(store.state)
    const setters = useMemo(() => createSetters(store.setters, setState), [])

    return (
      <StateContext.Provider value={state}>
        <SetterContext.Provider value={setters}>
          {children}
        </SetterContext.Provider>
      </StateContext.Provider>
    )
  }

  const useStore = () => useContext(StateContext)
  const useSetter = () => useContext(SetterContext)

  return [Provider, useStore, useSetter] as const
}
```

```jsx
import React, { createContext, useContext, useMemo, useState } from 'react'

const createSetters = (
  setters,
  setState
) => {
  const _setters = {}

  for (const key in setters) {
    _setters[key] = (...args) => {
      setState((state) => {
        const newState = setters[key](state, ...args)

        return { ...state, ...newState }
      })
    }
  }

  return _setters
}

export function createStore(store) {
  const StateContext = createContext(store.state)
  const SetterContext = createContext(store.setters)

  const Provider = ({ children }) => {
    const [state, setState] = useState(store.state)
    const setters = useMemo(() => createSetters(store.setters, setState), [])

    return (
      <StateContext.Provider value={state}>
        <SetterContext.Provider value={setters}>
          {children}
        </SetterContext.Provider>
      </StateContext.Provider>
    )
  }

  const useStore = () => useContext(StateContext)
  const useSetter = () => useContext(SetterContext)

  return [Provider, useStore, useSetter]
}
```

# Простой слайдер

```js
import { Children, useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

const Dots = ({ slideCount, currentSlide }) => (
  <div className='dots'>
    {Array.from({ length: slideCount + 1 }).map((_, i) => (
      <div
        key={i}
        className={`dot ${i === currentSlide ? 'active' : ''}`}
      ></div>
    ))}
  </div>
)

const Controls = ({ prevSlide, nextSlide }) => (
  <div className='controls'>
    <button onClick={prevSlide} className='prev'>
      &lt;
    </button>
    <button onClick={nextSlide} className='next'>
      &gt;
    </button>
  </div>
)

export const Slider = ({ children }) => {
  const [slideCount, setSlideCount] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [renderingElement, setRenderingElement] = useState()
  const slideRef = useRef()

  useEffect(() => {
    setSlideCount(Children.count(children) - 1)
  }, [children])

  useEffect(() => {
    slideCount
      ? setRenderingElement(children[currentSlide])
      : setRenderingElement(children)

    gsap.fromTo(
      slideRef.current,
      {
        opacity: 0
      },
      {
        opacity: 1
      }
    )
  }, [slideCount, currentSlide])

  useEffect(() => {
    const onKeyDown = ({ key }) => {
      switch (key) {
        case 'ArrowLeft':
          prevSlide()
          break
        case 'ArrowRight':
          nextSlide()
          break
        default:
          return
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const prevSlide = () => {
    !currentSlide
      ? setCurrentSlide(slideCount)
      : setCurrentSlide(currentSlide - 1)

    gsap.fromTo(
      slideRef.current,
      {
        x: -100,
        y: -100,
        rotate: -20
      },
      {
        x: 0,
        y: 0,
        rotate: 0
      }
    )
  }

  const nextSlide = () => {
    currentSlide === slideCount
      ? setCurrentSlide(0)
      : setCurrentSlide(currentSlide + 1)

    gsap.fromTo(
      slideRef.current,
      {
        x: 100,
        y: -100,
        rotate: 20
      },
      {
        x: 0,
        y: 0,
        rotate: 0
      }
    )
  }

  const renderingElementClassName = renderingElement?.props?.className
    ? renderingElement.props.className
    : ''

  return (
    <div className='slider'>
      <div className={`slide ${renderingElementClassName}`} ref={slideRef}>
        {renderingElement}
      </div>
      <div>
        <Dots slideCount={slideCount} currentSlide={currentSlide} />
        <Controls prevSlide={prevSlide} nextSlide={nextSlide} />
      </div>
    </div>
  )
}
```

```scss
.slider {
  position: relative;

  .slide {
    width: 320px;
    height: 320px;
    border-radius: 8px;

    &.red {
      background-color: $danger;
    }
    &.green {
      background-color: $success;
    }
    &.blue {
      background-color: $primary;
    }
  }

  .dots {
    @include flex-center;
    margin: 0.25rem 0;
    height: $size;

    .dot {
      @include flex-center;
      width: $size;
      height: $size;

      &::before {
        content: '';
        display: block;
        width: 80%;
        height: 80%;
        background-color: $light;
        filter: brightness(90%);
        border-radius: 50%;
        transition: 0.2s;
      }

      &.active::before {
        width: 100%;
        height: 100%;
      }
    }
  }

  .controls {
    @include flex-center;
    margin: 0.5rem 0;

    button {
      @include flex-center;
      position: absolute;
      top: calc(50% - 0.5rem - $size);
      transform: translateY(-50%);
      width: $size;
      height: $size;
      background: none;
      border: none;
      outline: none;
      color: $light;
      filter: brightness(80%);
      font-size: 3rem;
      cursor: pointer;
      user-select: none;

      &.prev {
        left: -$size * 2;
      }
      &.next {
        right: -$size * 2;
      }
    }
  }
}
```

## Компонент клавиатуры

```js
import { useState } from 'react'
import shallow from 'zustand/shallow'
import useStore from 's'

const keyboardTypes = {
  ru: [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
  ],

  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ],
  sym: [
    ['.', ',', '/', '\\', '|', '?', '!', '@', '#', '$'],
    ['%', '^', '&', '*', '(', ')', '[', ']', '{', '}'],
    [';', ':', '+', '-', '=', '_', "'", '"', '`', '~']
  ],
  num: [
    [0, 1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}

const generateKeyboard = (type, shift) => (
  <div className='symbols'>
    {keyboardTypes[type].map((r, i) => (
      <div key={i} className='row'>
        {r.map((i) => (
          <button key={i} className='key'>
            {shift && typeof i === 'string' ? i.toUpperCase() : i}
          </button>
        ))}
      </div>
    ))}
  </div>
)

const Controls = ({ type }) => (
  <div className='controls'>
    <div className='row'>
      <button className='text-invisible key shift'>Shift</button>
      <button className='text-invisible space'>Space</button>
      <button className='text-invisible key remove'>Remove</button>
    </div>
    <div className='row'>
      <button className='fixed-width'>{type === 'ru' ? 'EN' : 'RU'}</button>
      <button className='fixed-width'>{type === 'num' ? 'ABC' : '123'}</button>
      <button className='fixed-width'>{type === 'sym' ? 'ABC' : ':-)'}</button>
      <button className='fixed-width'>Enter</button>
    </div>
  </div>
)

export const Keyboard = ({ onEnter }) => {
  const { text, setText } = useStore(
    ({ text, setText }) => ({ text, setText }),
    shallow
  )
  const [keyboardType, setKeyboardType] = useState('ru')
  const [shift, setShift] = useState(false)

  const onClick = (e) => {
    if (e.target.localName !== 'button') return
    const { textContent } = e.target
    switch (textContent) {
      case 'EN':
      case 'RU':
        setKeyboardType(keyboardType === 'ru' ? 'en' : 'ru')
        break
      case '123':
        setKeyboardType('num')
        break
      case ':-)':
        setKeyboardType('sym')
        break
      case 'ABC':
        setKeyboardType('ru')
        break
      case 'Shift':
        setShift(!shift)
        break
      case 'Space':
        setText(text + ' ')
        break
      case 'Remove':
        setText(text.slice(0, -1))
        break
      case 'Enter':
        if (typeof onEnter === 'function') {
          onEnter()
        }
        break
      default:
        setText(text + textContent)
    }
  }

  return (
    <div className='keyboard' onClick={onClick}>
      {generateKeyboard(keyboardType, shift)}
      <Controls type={keyboardType} />
    </div>
  )
}
```

```scss
.keyboard {
  .row {
    @include flex-center;
    margin: 0.25rem;

    button {
      @include flex-center;
      margin: 0 0.25rem;
      padding: 0.25rem;
      background: none;
      border: 1px solid $dark;
      border-radius: 4px;
      transition: 0.2s;
      cursor: pointer;
      user-select: none;

      &.key {
        width: $size * 1.5;
        height: $size * 1.5;
        border-radius: 50%;
      }

      &:active {
        background-color: $dark;
        color: $light;
        border-color: $light;
      }
    }
  }

  .controls {
    .row {
      margin: 1rem 0;

      .text-invisible {
        font-size: 0;
      }

      .fixed-width {
        width: 50px;
      }

      .shift::before {
        content: '⬆';
      }

      .remove::before {
        content: '⬅';
      }

      .space {
        width: 40%;
        line-height: 1rem;
      }

      .enter::before {
        content: '⤴';
      }
    }
  }
}
```
