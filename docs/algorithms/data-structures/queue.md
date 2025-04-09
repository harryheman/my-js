---
sidebar_position: 3
title: Очередь
description: Очередь
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Очередь

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9E%D1%87%D0%B5%D1%80%D0%B5%D0%B4%D1%8C_(%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5))
- [YouTube](https://www.youtube.com/watch?v=fmHyFTji-Lc)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/queue.js)

Очередь (queue) - это динамическая структура данных, в которой элементы хранятся в порядке их добавления. Она является примером линейной структуры или последовательной коллекции. Новые элементы добавляются в конец очереди (enqueue). Удаление элементов выполняется с начала очереди (dequeue). Таким образом, очередь реализует принцип "первым вошел - первым вышел" (first in - first out, FIFO). Кроме enqueue и dequeue, часто также реализуется операция чтения значения головного узла без его удаления (peek).

Иллюстрацией рассматриваемой структуры данных может служить любая очередь в обычной жизни, например, из тех, кто только спросить :D

<img src="https://habrastorage.org/webt/xf/1d/ce/xf1dceeivz7ssa0hn0an5thknoa.png" />
<br />

__Реализация__

Для реализации очереди мы воспользуемся связным списком (см. раздел 1).

Говорить тут особо не о чем, так что привожу сразу весь код:

```javascript
// data-structures/queue.js
// Импортируем конструктор связного списка
import LinkedList from './linked-list'

// Очередь
export default class Queue {
  constructor() {
    // Создаем связный список
    this.list = new LinkedList()
  }

  // Проверяет, является ли очередь пустой
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

  // Добавляет элемент в конец очереди
  enqueue(value) {
    this.list.append(value)
  }

  // Удаляет первый узел и возвращает его значение
  dequeue() {
    const removedHead = this.list.removeHead()
    return removedHead?.value || null
  }

  // Преобразует очередь в строку.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return this.list.toString(cb)
  }

  // Преобразует очередь в массив значений
  toArray() {
    return this.list.toArray().map((node) => node.value)
  }
}
```

__Тестирование__

Проверяем, что наша очередь работает, как ожидается:

```javascript
// data-structures/__tests__/queue.test.js
import Queue from '../queue'

describe('Queue', () => {
  it('должен создать пустую очередь', () => {
    const queue = new Queue()
    expect(queue).not.toBeNull()
    expect(queue.linkedList).not.toBeNull()
  })

  it('должен добавить значения в очередь', () => {
    const queue = new Queue()

    queue.enqueue(1)
    queue.enqueue(2)

    expect(queue.toString()).toBe('1,2')
  })

  it('должен добавить/удалить объекты в/из очереди', () => {
    const queue = new Queue()

    queue.enqueue({ value: 'test1', key: 'key1' })
    queue.enqueue({ value: 'test2', key: 'key2' })

    const stringifier = (value) => `${value.key}:${value.value}`

    expect(queue.toString(stringifier)).toBe('key1:test1,key2:test2')
    expect(queue.dequeue().value).toBe('test1')
    expect(queue.dequeue().value).toBe('test2')
  })

  it('должен извлечь значения из очереди без удаления и с удалением соответствующих узлов', () => {
    const queue = new Queue()

    expect(queue.peek()).toBeNull()

    queue.enqueue(1)
    queue.enqueue(2)

    expect(queue.peek()).toBe(1)
    expect(queue.peek()).toBe(1)
  })

  it('должен проверить пустоту очереди', () => {
    const queue = new Queue()

    expect(queue.isEmpty()).toBe(true)

    queue.enqueue(1)

    expect(queue.isEmpty()).toBe(false)
  })

  it('должен удалять элементы из очереди в порядке FIFO', () => {
    const queue = new Queue()

    queue.enqueue(1)
    queue.enqueue(2)

    expect(queue.dequeue()).toBe(1)
    expect(queue.dequeue()).toBe(2)
    expect(queue.dequeue()).toBeNull()
    expect(queue.isEmpty()).toBe(true)
  })
})
```

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/queue
```

<img src="https://habrastorage.org/webt/8f/d_/x6/8fd_x6dmfzqzwojlsoucpnqola0.png" />
