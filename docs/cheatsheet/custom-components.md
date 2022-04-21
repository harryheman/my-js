---
sidebar_position: 16
title: Примеры кастомных компонентов React
description: Примеры кастомных компонентов React
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'custom components', 'components', 'component', 'cheatsheet', 'шпаргалка', 'кастомные компоненты', 'пользовательские компоненты', 'компоненты', 'компонент']
---

# React Custom Components

## Accordion

```js
import { useState } from 'react'

import styles from './Accordion.module.css'

const AccordionItem = ({ item, open, onClick }) => (
  <details open={open} className={styles.item} onClick={onClick}>
    <summary className={styles.title}>{item.title}</summary>
    <p className={styles.content}>{item.content}</p>
  </details>
)

export const Accordion = ({ defaultIndex = 1, onClick, children }) => {
  const [index, setIndex] = useState(defaultIndex)

  const changeItem = (e, i) => {
    // disable details default click handling
    e.preventDefault()
    if (typeof onClick === 'function') onClick(i)
    if (i !== index) setIndex(i)
  }

  return (
    <div className={styles.accordion}>
      {children.map((item, i) => (
        <AccordionItem
          key={i}
          open={i === index}
          item={item}
          onClick={(e) => changeItem(e, i)}
        />
      ))}
    </div>
  )
}
```

## Carousel

```js
import { useEffect, useState } from 'react'

import styles from './Carousel.module.css'

const Item = ({ src, active }) => {
  return (
    <img
      src={src}
      alt=''
      className={active ? `${styles.item} ${styles.active}` : styles.item}
    />
  )
}

export const Carousel = ({ items }) => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timerId = setInterval(() => {
      setActive((active + 1) % items.length)
    }, 3000)
    return () => clearInterval(timerId)
  })

  return (
    <div className={styles.carousel}>
      {items.map((src, i) => (
        <Item key={i} src={src} active={active === i} />
      ))}
    </div>
  )
}
```

## FileDrop

```js
import { useState, useEffect, useRef } from 'react'

import styles from './File.module.css'

export const FileDrop = ({ onDrop, onChange }) => {
  const [drag, setDrag] = useState(false)
  const [filename, setFilename] = useState('')
  const dropRef = useRef()
  const inputRef = useRef()

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const handleChange = ({ target }) => {
    if (typeof onChange === 'function') onChange(target.files[0])
    setFilename(target.files[0].name)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e) => {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setDrag(true)
  }

  const handleDragOut = () => {
    setDrag(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDrag(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (typeof onDrop === 'function') onDrop(e.dataTransfer.files[0])
      setFilename(e.dataTransfer.files[0].name)
      e.dataTransfer.clearData()
    }
  }

  useEffect(() => {
    let div = dropRef.current
    div.addEventListener('dragenter', handleDragIn)
    div.addEventListener('dragleave', handleDragOut)
    div.addEventListener('dragover', handleDrag)
    div.addEventListener('drop', handleDrop)
    return () => {
      div.removeEventListener('dragenter', handleDragIn)
      div.removeEventListener('dragleave', handleDragOut)
      div.removeEventListener('dragover', handleDrag)
      div.removeEventListener('drop', handleDrop)
    }
  })

  return (
    <div className={styles.wrapper}>
      <div
        ref={dropRef}
        className={
          drag
            ? `${styles.file} ${styles.drag}`
            : filename
              ? `${styles.file} ${styles.ready}`
              : styles.file
        }
        onClick={handleClick}
      >
        {filename && !drag ? (
          <p>{filename}</p>
        ) : (
          <>
            <p className={styles.info}>Drop or Click</p>
            <span className={styles.plus}>+</span>
            <input
              type='file'
              ref={inputRef}
              onChange={handleChange}
              className={styles.input}
            />
          </>
        )}
      </div>
    </div>
  )
}
```

## Loader

```js
import { loader, circle } from './Loader.module.css'
export const Loader = ({ size, color }) => (
  <svg
    className={loader}
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke={color ? color : 'currentColor'}
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle className={circle} cx='12' cy='12' r='10' />
  </svg>
)
```

## MailTo

```js
export const MailTo = ({ email, subject, body, children }) => {
  let params = subject || body ? '?' : ''
  if (subject) params += `subject=${encodeURIComponent(subject)}`
  if (body) params += `${subject ? '&' : ''}body=${encodeURIComponent(body)}`

  return <a href={`mailto:${email}${params}`}>{children}</a>
}
```

## Modal

```js
import { useState, useEffect, useRef } from 'react'

import styles from './Modal.module.css'

function useStyle(prop, $ = document.body) {
  const [value, setValue] = useState(getComputedStyle($).getPropertyValue(prop))

  useEffect(() => {
    $.style.setProperty(prop, value)
    // eslint-disable-next-line
  }, [value])

  return [value, setValue]
}

export const Modal = ({
  title,
  content,
  footer,
  confirmCb,
  cancelCb,
  open = false
}) => {
  const [isVisible, setVisible] = useState(open)
  const [, setOverflow] = useStyle('overflow')
  const buttonRef = useRef()

  const onClick = () => {
    setVisible(true)
    buttonRef.current.blur()
  }

  const onConfirm = () =>
    typeof confirmCb === 'function' ? confirmCb() : setVisible(false)

  const onCancel = () =>
    typeof cancelCb === 'function' ? cancelCb() : setVisible(false)

  const onKeyDown = ({ key }) => {
    switch (key) {
      case 'Escape':
        return onCancel()
      case 'Enter':
        return onConfirm()
      default:
        return
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  useEffect(
    () => (isVisible ? setOverflow('hidden') : setOverflow('auto')),
    // eslint-disable-next-line
    [isVisible]
  )

  return (
    <>
      <button className={styles.show} onClick={onClick} ref={buttonRef}>
        Show Modal
      </button>
      {isVisible && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setVisible(false)}
          ></div>
          <div className={styles.modal}>
            <button className={styles.close} onClick={() => setVisible(false)}>
              x
            </button>
            <h3 className={styles.title}>{title}</h3>
            <hr />
            <p className={styles.content}>{content}</p>
            <hr />
            <span className={styles.footer}>{footer}</span>
            <div className={styles.buttons}>
              <button className={styles.confirm} onClick={onConfirm}>
                Agree
              </button>
              <button className={styles.cancel} onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
```

## Password

```js
import { useState } from 'react'

export const Password = ({ value, onChange }) => {
  const [shown, setShown] = useState(false)

  return (
    <div>
      <input
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={onChange}
      />
      <button onClick={() => setShown(!shown)}>
        {shown ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
```

## Rating

```js
import { useEffect, useState } from 'react'
import { star } from './Rating.module.css'

const Star = ({ selected, starId, onClick }) => (
  <span className={star} data-star-id={starId} onClick={onClick}>
    {selected ? '\u2605' : '\u2606'}
  </span>
)

export const Rating = ({ value, elRef, handleSetRating }) => {
  const [rating, setRating] = useState(parseInt(value) || 0)
  const [selection, setSelection] = useState(0)

  useEffect(() => {
    if (typeof handleSetRating === 'function') {
      handleSetRating(elRef, rating)
    }
  }, [rating])

  const onHover = (e) => {
    setSelection(e?.target?.getAttribute('data-star-id'))
  }

  const onClick = ({ target }) => {
    setRating(target.getAttribute('data-star-id'))
  }

  return (
    <div
      className='rating'
      onMouseOver={onHover}
      onMouseOut={() => onHover(null)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          starId={i + 1}
          selected={selection ? selection >= i + 1 : rating >= i + 1}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
```

## Tabs

```js
import { useState } from 'react'

import styles from './Tabs.module.css'

export const Tabs = ({ defaultIndex = 0, onClick, children }) => {
  const [index, setIndex] = useState(defaultIndex)

  const changeTab = (i) => {
    if (typeof onClick === 'function') onClick(children[i].type.name)
    if (i !== index) setIndex(i)
  }

  const ComponentToRender = () => (
    <div className={styles.item}>{children.filter((_, i) => i === index)}</div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.menu}>
        {children.map((item, i) => (
          <button
            key={i}
            className={
              i === index ? `${styles.link} ${styles.selected}` : styles.link
            }
            onClick={() => changeTab(i)}
          >
            {item.type.name}
          </button>
        ))}
      </div>
      <ComponentToRender />
    </div>
  )
}
```

## Tags

```js
import { useState, useEffect, useRef } from 'react'

import styles from './Tags.module.css'

export const Tags = ({ tags }) => {
  const [data, setData] = useState(tags)
  const inputRef = useRef()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  })

  const onSubmit = (e) => {
    e.preventDefault()
    const value = inputRef.current.value.trim()
    if (value) {
      setData([...data, value])
      inputRef.current.value = ''
    }
  }

  const onClick = (index) => {
    setData([...data.filter((_, i) => i !== index)])
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {data.map((t, i) => (
          <li className={styles.item} key={i}>
            <span>#{t}</span>
            <span className={styles.remove} onClick={() => onClick(i)}>
              x
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <input
          type='text'
          placeholder='Tag...'
          className={styles.input}
          ref={inputRef}
        />
      </form>
    </div>
  )
}
```

## Timer

```js
import { useState, useEffect } from 'react'

import styles from './Timer.module.css'

const format = (vals) =>
  vals.map((v) => v.toString().padStart(2, '0')).join(':')

export const Timer = ({ hours = 0, minutes = 0, seconds = 0 }) => {
  const [paused, setPaused] = useState(false)
  const [over, setOver] = useState(false)
  const [[h, m, s], setTime] = useState([hours, minutes, seconds])

  const tick = () => {
    if (paused || over) return
    if (h === 0 && m === 0 && s === 0) setOver(true)
    else if (m === 0 && s === 0) {
      setTime([h - 1, 59, 59])
    } else if (s === 0) {
      setTime([h, m - 1, 59])
    } else {
      setTime([h, m, s - 1])
    }
  }

  const pause = () => {
    setPaused(!paused)
  }

  const reset = () => {
    setTime([hours, minutes, seconds])
    setPaused(false)
    setOver(false)
  }

  useEffect(() => {
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
  })

  return (
    <div className={styles.wrapper}>
      <p className={styles.time}>{format([h, m, s])}</p>
      <div className={styles.info}>{over && `Time's up!`}</div>
      <div className={styles.buttons}>
        <button onClick={pause} className={styles.pause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={reset} className={styles.reset}>
          Restart
        </button>
      </div>
    </div>
  )
}
```

## Tooltip

```js
import { useState } from 'react'
import { wrapper, tooltip, visible, arrow } from './Tooltip.module.css'

export const Tooltip = ({ children, text, ...rest }) => {
  const [show, setShow] = useState(false)

  return (
    <div className={wrapper}>
      <div className={show ? `${tooltip} ${visible}` : tooltip}>
        {text}
        <span className={arrow}></span>
      </div>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        {...rest}
      >
        {children}
      </div>
    </div>
  )
}
```
