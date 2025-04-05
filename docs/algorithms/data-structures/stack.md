---
sidebar_position: 4
title: Стек
description: Стек
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Стек

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D1%82%D0%B5%D0%BA)
- [YouTube](https://www.youtube.com/watch?v=B3VHHfMW0Pg)

Стек (stack) - это динамическая структура данных, в которой элементы хранятся в порядке, обратному порядку их добавления. Она, как и очередь, является примером линейной структуры или последовательной коллекции. Новые элементы добавляются в начало стека (push). Удаление элементов также выполняется с начала стека (pop). Таким образом, стек реализует принцип "последним вошел - первым вышел" (last in - first out, LIFO). Кроме push и pop, часто также реализуется операция чтения значения головного узла без его удаления (peek).

Иллюстрацией рассматриваемой структуры данных может служить стопка книг: для того, чтобы взять вторую книгу сверху, нужно сначала снять верхнюю.

<img src="https://habrastorage.org/webt/kt/3w/9v/kt3w9vovkz_w3m2mfndkqmqcabm.png" />
<br />

__Реализация__

Для реализации стека мы также воспользуемся связным списком (см. раздел 1).

Привожу сразу весь код:

```javascript
// data-structures/stack.js
// Импортируем конструктор связного списка
import LinkedList from './linked-list'

// Стек
export default class Stack {
  constructor() {
    // Создаем связный список
    this.list = new LinkedList()
  }

  // Проверяет, является ли стек пустым
  isEmpty() {
    return !this.list.head
  }

  // Возвращает значение первого узла без его удаления
  peek() {
    if (this.isEmpty()) {
      return null
    }
    return this.list.head.value
  }

  // Добавляет элемент в начало стека
  push(value) {
    this.list.prepend(value)
  }

  // Удаляет первый узел и возвращает его значение
  pop() {
    const removedHead = this.list.removeHead()
    return removedHead?.value || null
  }

  // Преобразует стек в строку
  toString(cb) {
    return this.list.toString(cb)
  }

  // Преобразует стек в массив значений
  toArray() {
    return this.list.toArray().map((node) => node.value)
  }
}
```

__Тестирование__

Проверяем, что наш стек работает, как ожидается:

```javascript
// data-structures/__tests__/stack.test.js
import Stack from '../stack'

describe('Stack', () => {
  it('должен создать пустой стек', () => {
    const stack = new Stack()
    expect(stack).not.toBeNull()
    expect(stack.linkedList).not.toBeNull()
  })

  it('должен добавить значения в стек', () => {
    const stack = new Stack()

    stack.push(1)
    stack.push(2)

    expect(stack.toString()).toBe('2,1')
  })

  it('должен проверить пустоту стека', () => {
    const stack = new Stack()

    expect(stack.isEmpty()).toBe(true)

    stack.push(1)

    expect(stack.isEmpty()).toBe(false)
  })

  it('должен извлечь значения из стека без удаления узлов', () => {
    const stack = new Stack()

    expect(stack.peek()).toBeNull()

    stack.push(1)
    stack.push(2)

    expect(stack.peek()).toBe(2)
    expect(stack.peek()).toBe(2)
  })

  it('должен извлечь значения из стека с удалением узлов', () => {
    const stack = new Stack()

    stack.push(1)
    stack.push(2)

    expect(stack.pop()).toBe(2)
    expect(stack.pop()).toBe(1)
    expect(stack.pop()).toBeNull()
    expect(stack.isEmpty()).toBe(true)
  })

  it('должен добавить/удалить объекты в/из стека', () => {
    const stack = new Stack()

    stack.push({ value: 'test1', key: 'key1' })
    stack.push({ value: 'test2', key: 'key2' })

    const stringifier = (value) => `${value.key}:${value.value}`

    expect(stack.toString(stringifier)).toBe('key2:test2,key1:test1')
    expect(stack.pop().value).toBe('test2')
    expect(stack.pop().value).toBe('test1')
  })

  it('должен преобразовать стек в массив', () => {
    const stack = new Stack()

    expect(stack.peek()).toBeNull()

    stack.push(1)
    stack.push(2)
    stack.push(3)

    expect(stack.toArray()).toEqual([3, 2, 1])
  })
})
```

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/stack
```

<img src="https://habrastorage.org/webt/dp/lk/ce/dplkcescglpddyuxvvlh8are_ky.png" />
