---
sidebar_position: 7
title: Очередь с приоритетом
description: Очередь с приоритетом
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Очередь с приоритетом

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9E%D1%87%D0%B5%D1%80%D0%B5%D0%B4%D1%8C_%D1%81_%D0%BF%D1%80%D0%B8%D0%BE%D1%80%D0%B8%D1%82%D0%B5%D1%82%D0%BE%D0%BC_(%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5))
- [YouTube](https://www.youtube.com/watch?v=y_2toG5-j_M)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/priority-queue.js)

Очередь с приоритетом (priority queue) - это абстрактный тип данных, похожий на обычную очередь (см. часть 1, раздел 3) или стек (см. часть 1, раздел 4), за исключением того, что в ней каждый элемент имеет определенный "приоритет" (priority). Элемент с более высоким приоритетом обрабатывается перед элементом с более низким приоритетом. Если два элемента имеют одинаковый приоритет, они обрабатываются в порядке их расположения в очереди.

Несмотря на то, что очереди с приоритетом часто реализуются с помощью куч, они концептуально различаются. Очередь с приоритетом - это абстрактная концепция, вроде "списка" (list) или "карты" (map). Как список может быть реализован с помощью связного списка (см. часть 1, раздел 1) или массива, так и очередь с приоритетом может быть реализована с помощью кучи или другим способом, например, с помощью неупорядоченного массива.

Интерактивную визуализации очереди с приоритетом можно посмотреть [здесь](https://priority-queue-visualizer.vercel.app/).

__Сложность__

Временная сложность очереди с приоритетом составляет O(n) или O(n*log(n)) (зависит от реализации).

__Реализация__

Для реализации очереди с приоритетом мы воспользуемся min-кучей (см. предыдущий раздел).

Начнем с конструктора:

```javascript
// data-structures/priority-queue.js
// Импортируем конструктор функции сравнения узлов
import Comparator from '../utils/comparator'
// Импортируем конструктор min-кучи
import MinHeap from './heap/min-heap'

// Очередь с приоритетом.
// Реализация на основе min-кучи
export default class PriorityQueue extends MinHeap {
  constructor() {
    // Инициализируем min-кучу
    super()
    // Карта приоритетов
    this.priorities = new Map()
    // Функция сравнения элементов
    this.compare = new Comparator(this.comparePriorities.bind(this))
  }
}
```

Методы добавления и удаления элементов в/из очереди:

```javascript
// Добавляет элемент в очередь.
// Принимает элемент и приоритет.
// Чем больше приоритет (меньше значение `priority`),
// тем "выше" элемент находится в очереди
add(item, priority = 0) {
  // Обновляем приоритеты
  this.priorities.set(item, priority)
  // Добавляем элемент в кучу
  super.add(item)

  return this
}

// Удаляет элемент из очереди.
// Принимает элемент и кастомную функцию сравнения элементов
remove(item, compare) {
  // Удаляем элемент из кучи
  super.remove(item, compare)
  // Обновляем приоритеты
  this.priorities.delete(item)

  return this
}
```

Метод обновления приоритета:

```javascript
// Обновляет приоритет.
// Принимает элемент и новый приоритет
changePriority(item, priority) {
  // Удаляем элемент из очереди
  this.remove(item, new Comparator(this.compareValues))
  // Добавляем элемент с новым приоритетом
  this.add(item, priority)

  return this
}
```

Метод поиска элемента по значению и определения наличия элемента:

```javascript
// Ищет элемент по значению.
// Возвращает массив индексов
findByValue(item) {
  return this.find(item, new Comparator(this.compareValues))
}

// Определяет наличие элемента
hasValue(item) {
  return this.findByValue(item).length > 0
}
```

Методы сравнения элементов по приоритетам и значениям:

```javascript
// Сравнивает приоритеты
comparePriorities(a, b) {
  // Вызываем функцию сравнения значений,
  // передавая ей приоритеты
  return this.compareValues(this.priorities.get(a), this.priorities.get(b))
}

// Сравнивает значения
compareValues(a, b) {
  if (a === b) {
    return 0
  }
  return a < b ? -1 : 1
}
```

<details>
<summary>Полный код очереди с приоритетом</summary>

```javascript
// Импортируем конструктор функции сравнения узлов
import Comparator from '../utils/comparator'
// Импортируем конструктор min-кучи
import MinHeap from './heap/min-heap'

// Очередь с приоритетом.
// Реализация на основе min-кучи
export default class PriorityQueue extends MinHeap {
  constructor() {
    // Инициализируем min-кучу
    super()
    // Карта приоритетов
    this.priorities = new Map()
    // Функция сравнения элементов
    this.compare = new Comparator(this.comparePriorities.bind(this))
  }

  // Добавляет элемент в очередь.
  // Принимает элемент и приоритет.
  // Чем больше приоритет (меньше значение `priority`),
  // тем "выше" элемент находится в очереди
  add(item, priority = 0) {
    // Обновляем приоритеты
    this.priorities.set(item, priority)
    // Добавляем элемент в кучу
    super.add(item)

    return this
  }

  // Удаляет элемент из очереди.
  // Принимает элемент и кастомную функцию сравнения элементов
  remove(item, compare) {
    // Удаляем элемент из кучи
    super.remove(item, compare)
    // Обновляем приоритеты
    this.priorities.delete(item)

    return this
  }

  // Обновляет приоритет.
  // Принимает элемент и новый приоритет
  changePriority(item, priority) {
    // Удаляем элемент из очереди
    this.remove(item, new Comparator(this.compareValues))
    // Добавляем элемент с новым приоритетом
    this.add(item, priority)

    return this
  }

  // Ищет элемент по значению.
  // Возвращает массив индексов
  findByValue(item) {
    return this.find(item, new Comparator(this.compareValues))
  }

  // Определяет наличие элемента
  hasValue(item) {
    return this.findByValue(item).length > 0
  }

  // Сравнивает приоритеты
  comparePriorities(a, b) {
    // Вызываем функцию сравнения значений,
    // передавая ей приоритеты
    return this.compareValues(this.priorities.get(a), this.priorities.get(b))
  }

  // Сравнивает значения
  compareValues(a, b) {
    if (a === b) {
      return 0
    }
    return a < b ? -1 : 1
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
import PriorityQueue from '../priority-queue'

describe('PriorityQueue', () => {
  it('должен создать дефолтную очередь с приоритетом', () => {
    const priorityQueue = new PriorityQueue()

    expect(priorityQueue).toBeDefined()
  })

  it('должен добавить элементы с приоритетом в очередь', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    expect(priorityQueue.peek()).toBe(10)

    priorityQueue.add(5, 2)
    expect(priorityQueue.peek()).toBe(10)

    priorityQueue.add(100, 0)
    expect(priorityQueue.peek()).toBe(100)
  })

  it('должен добавить в очередь объекты', () => {
    const priorityQueue = new PriorityQueue()

    const user1 = { name: 'Mike' }
    const user2 = { name: 'Bill' }
    const user3 = { name: 'Jane' }

    priorityQueue.add(user1, 1)
    expect(priorityQueue.peek()).toBe(user1)

    priorityQueue.add(user2, 2)
    expect(priorityQueue.peek()).toBe(user1)

    priorityQueue.add(user3, 0)
    expect(priorityQueue.peek()).toBe(user3)
  })

  it('должен извлечь элементы из очереди согласно приоритету', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    priorityQueue.add(5, 2)
    priorityQueue.add(100, 0)
    priorityQueue.add(200, 0)

    expect(priorityQueue.poll()).toBe(100)
    expect(priorityQueue.poll()).toBe(200)
    expect(priorityQueue.poll()).toBe(10)
    expect(priorityQueue.poll()).toBe(5)
  })

  it('должен обновить приоритеты головных узлов', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    priorityQueue.add(5, 2)
    priorityQueue.add(100, 0)
    priorityQueue.add(200, 0)

    expect(priorityQueue.peek()).toBe(100)

    priorityQueue.changePriority(100, 10)
    priorityQueue.changePriority(10, 20)

    expect(priorityQueue.poll()).toBe(200)
    expect(priorityQueue.poll()).toBe(5)
    expect(priorityQueue.poll()).toBe(100)
    expect(priorityQueue.poll()).toBe(10)
  })

  it('должен обновить приоритеты внутренних узлов', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    priorityQueue.add(5, 2)
    priorityQueue.add(100, 0)
    priorityQueue.add(200, 0)

    expect(priorityQueue.peek()).toBe(100)

    priorityQueue.changePriority(200, 10)
    priorityQueue.changePriority(10, 20)

    expect(priorityQueue.poll()).toBe(100)
    expect(priorityQueue.poll()).toBe(5)
    expect(priorityQueue.poll()).toBe(200)
    expect(priorityQueue.poll()).toBe(10)
  })

  it('должен обновить приоритеты и добавить элемент', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    priorityQueue.add(5, 2)
    priorityQueue.add(100, 0)
    priorityQueue.add(200, 0)

    priorityQueue.changePriority(200, 10)
    priorityQueue.changePriority(10, 20)

    priorityQueue.add(15, 15)

    expect(priorityQueue.poll()).toBe(100)
    expect(priorityQueue.poll()).toBe(5)
    expect(priorityQueue.poll()).toBe(200)
    expect(priorityQueue.poll()).toBe(15)
    expect(priorityQueue.poll()).toBe(10)
  })

  it('должен определить наличие значений элементов', () => {
    const priorityQueue = new PriorityQueue()

    priorityQueue.add(10, 1)
    priorityQueue.add(5, 2)
    priorityQueue.add(100, 0)
    priorityQueue.add(200, 0)
    priorityQueue.add(15, 15)

    expect(priorityQueue.hasValue(70)).toBe(false)
    expect(priorityQueue.hasValue(15)).toBe(true)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/priority-queue
```

<img src="https://habrastorage.org/webt/op/se/xs/opsexsj0spxpzlivn5dcba5ydp8.png" />
