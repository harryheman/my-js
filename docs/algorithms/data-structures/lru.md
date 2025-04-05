---
sidebar_position: 13
title: Кэш актуальных данных
description: Кэш актуальных данных
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Кэш актуальных данных

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC%D1%8B_%D0%BA%D1%8D%D1%88%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)
- [YouTube](https://www.youtube.com/watch?v=5JjISpzM8uM)

Кэш актуальных (часто используемых) данных (least recently used (LRU) cache) организует (хранит) элементы таким образом, что мы можем легко определить, какие элементы используются часто, а какие - редко.

Реализация КАД включает в себя:

- конструктор `LRUCache(capacity: number)`, инициализирующий КАД определенного размера (`capacity`, положительное целое число)
- метод `get(key: string)`, возвращающий значение по ключу (`key`) или `null`
- метод `set(key: string, value: any)`, обновляющий или добавляющий значение (`value`) по ключу (`key`). При превышении `capacity` из кэша удаляется (вытесняется) самое старое (наименее используемое) значение

Функции `get` и `set` должны выполняться за константное время `O(1)`.

__Сложность__

_Временная_

| get  | set  |
|------|------|
| O(1) | O(1) |

_Пространственная_

O(n)

__Реализация__

_Двусвязный список и хеш-таблица_

В следующей реализации КАД мы будем использовать хеш-таблицу (см. часть 2, раздел 5) для константного (в среднем) доступа к элементам и двойной связный список (см. часть 1, раздел 2) для константного обновления и вытеснения элементов.

<img src="https://habrastorage.org/webt/rl/ad/gt/rladgtulm15sg3xmoyxmudez5f0.jpeg" />
<br />

Начнем с реализации узла:

```javascript
// data-structures/lru-cache.js
// Узел
class Node {
  constructor(key, val, prev = null, next = null) {
    // Ключ
    this.key = key
    // Значение
    this.val = val
    // Ссылка на предыдущий узел
    this.prev = prev
    // Ссылка на следующий узел
    this.next = next
  }
}
```

Теперь займемся КАД:

```javascript
// КАД
export default class LRUCache {
  // Конструктор принимает емкость кэша
  constructor(capacity) {
    // Максимальный размер кэша
    this.capacity = capacity
    // Кэшированные узлы
    this.nodesMap = {}
    // Текущий размер кэша
    this.size = 0
    // Головной узел
    this.head = new Node()
    // Хвостовой узел
    this.tail = new Node()
  }
}
```

Метод получения элемента по ключу:

```javascript
// Возвращает значение по ключу
get(key) {
  const node = this.nodesMap[key]
  if (!node) return null
  // Обновляем "приоритет" узла
  this.promote(node)
  return node.val
}
```

Метод добавления элемента в кэш:

```javascript
// Добавляет узел в кэш
set(key, val) {
  if (this.nodesMap[key]) {
    // Обновляем значение существующего узла
    const node = this.nodesMap[key]
    node.val = val
    this.promote(node)
  } else {
    // Добавляем новый узел
    const node = new Node(key, val)
    this.append(node)
  }
}
```

Метод обновления приоритета узла:

```javascript
/**
 * Перемещает узел в конец связного списка.
 * Это означает, что узел используется наиболее часто.
 * Это также снижает вероятность удаления такого узла из кэша
 */
promote(node) {
  this.evict(node)
  this.append(node)
}
```

Метод добавления узла в конец связного списка:

```javascript
// Перемещает узел в конец связного списка
append(node) {
  this.nodesMap[node.key] = node

  if (!this.head.next) {
    // Первый узел
    this.head.next = node
    this.tail.prev = node
    node.prev = this.head
    node.next = this.tail
  } else {
    // Добавляем узел в конец
    const oldTail = this.tail.prev
    oldTail.next = node
    node.prev = oldTail
    node.next = this.tail
    this.tail.prev = node
  }

  // Увеличиваем текущий размер кэша
  this.size += 1
  // Если достигнут максимальный размер кэша,
  // то удаляем первый узел
  if (this.size > this.capacity) {
    this.evict(this.head.next)
  }
}
```

И метод удаления узла:

```javascript
// Удаляет (вытесняет) узел из кэша
evict(node) {
  delete this.nodesMap[node.key]
  // Уменьшаем текущий размер кэша
  this.size -= 1

  const prev = node.prev
  const next = node.next

  // Имеется только один узел
  if (prev === this.head && next === this.tail) {
    this.head.next = null
    this.tail.prev = null
    this.size = 0
    return
  }

  // Это головной узел
  if (prev === this.head) {
    next.prev = this.head
    this.head.next = next
    return
  }

  // Это хвостовой узел
  if (next === this.tail) {
    prev.next = this.tail
    this.tail.prev = prev
    return
  }

  // Это узел в середине списка
  prev.next = next
  next.prev = prev
}
```

<details>
<summary>Полный код КАД вместе с узлом</summary>

```javascript
// Узел
class Node {
  constructor(key, val, prev = null, next = null) {
    // Ключ
    this.key = key
    // Значение
    this.val = val
    // Ссылка на предыдущий узел
    this.prev = prev
    // Ссылка на следующий узел
    this.next = next
  }
}

// КАД
export default class LRUCache {
  // Конструктор принимает емкость кэша
  constructor(capacity) {
    // Максимальный размер кэша
    this.capacity = capacity
    // Кэшированные узлы
    this.nodesMap = {}
    // Текущий размер кэша
    this.size = 0
    // Головной узел
    this.head = new Node()
    // Хвостовой узел
    this.tail = new Node()
  }

  // Возвращает значение по ключу
  get(key) {
    const node = this.nodesMap[key]
    if (!node) return null
    // Обновляем "приоритет" узла
    this.promote(node)
    return node.val
  }

  // Добавляет узел в кэш
  set(key, val) {
    if (this.nodesMap[key]) {
      // Обновляем значение существующего узла
      const node = this.nodesMap[key]
      node.val = val
      this.promote(node)
    } else {
      // Добавляем новый узел
      const node = new Node(key, val)
      this.append(node)
    }
  }

  /**
   * Перемещает узел в конец связного списка.
   * Это означает, что узел используется наиболее часто.
   * Это также снижает вероятность удаления такого узла из кэша
   */
  promote(node) {
    this.evict(node)
    this.append(node)
  }

  // Перемещает узел в конец связного списка
  append(node) {
    this.nodesMap[node.key] = node

    if (!this.head.next) {
      // Первый узел
      this.head.next = node
      this.tail.prev = node
      node.prev = this.head
      node.next = this.tail
    } else {
      // Добавляем узел в конец
      const oldTail = this.tail.prev
      oldTail.next = node
      node.prev = oldTail
      node.next = this.tail
      this.tail.prev = node
    }

    // Увеличиваем текущий размер кэша
    this.size += 1
    // Если достигнут максимальный размер кэша,
    // то удаляем первый узел
    if (this.size > this.capacity) {
      this.evict(this.head.next)
    }
  }

  // Удаляет (вытесняет) узел из кэша
  evict(node) {
    delete this.nodesMap[node.key]
    // Уменьшаем текущий размер кэша
    this.size -= 1

    const prev = node.prev
    const next = node.next

    // Имеется только один узел
    if (prev === this.head && next === this.tail) {
      this.head.next = null
      this.tail.prev = null
      this.size = 0
      return
    }

    // Это головной узел
    if (prev === this.head) {
      next.prev = this.head
      this.head.next = next
      return
    }

    // Это хвостовой узел
    if (next === this.tail) {
      prev.next = this.tail
      this.tail.prev = prev
      return
    }

    // Это узел в середине списка
    prev.next = next
    next.prev = prev
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
import LRUCache from '../lru-cache'

describe('LRUCache', () => {
  it('должен добавить/извлечь значения в/из кэша', () => {
    const cache = new LRUCache(100)
    expect(cache.get('key-1')).toBeNull()

    cache.set('key-1', 15)
    cache.set('key-2', 16)
    cache.set('key-3', 17)
    expect(cache.get('key-1')).toBe(15)
    expect(cache.get('key-2')).toBe(16)
    expect(cache.get('key-3')).toBe(17)
    expect(cache.get('key-3')).toBe(17)
    expect(cache.get('key-2')).toBe(16)
    expect(cache.get('key-1')).toBe(15)

    cache.set('key-1', 5)
    cache.set('key-2', 6)
    cache.set('key-3', 7)
    expect(cache.get('key-1')).toBe(5)
    expect(cache.get('key-2')).toBe(6)
    expect(cache.get('key-3')).toBe(7)
  })

  it('должен вытеснить элементы из кэша размером 1', () => {
    const cache = new LRUCache(1)
    expect(cache.get('key-1')).toBeNull()

    cache.set('key-1', 15)
    expect(cache.get('key-1')).toBe(15)

    cache.set('key-2', 16)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(16)

    cache.set('key-2', 17)
    expect(cache.get('key-2')).toBe(17)

    cache.set('key-3', 18)
    cache.set('key-4', 19)
    expect(cache.get('key-2')).toBeNull()
    expect(cache.get('key-3')).toBeNull()
    expect(cache.get('key-4')).toBe(19)
  })

  it('должен вытеснить элементы из кэша размером 2', () => {
    const cache = new LRUCache(2)
    expect(cache.get('key-21')).toBeNull()

    cache.set('key-21', 15)
    expect(cache.get('key-21')).toBe(15)

    cache.set('key-22', 16)
    expect(cache.get('key-21')).toBe(15)
    expect(cache.get('key-22')).toBe(16)

    cache.set('key-22', 17)
    expect(cache.get('key-22')).toBe(17)

    cache.set('key-23', 18)
    expect(cache.size).toBe(2)
    expect(cache.get('key-21')).toBeNull()
    expect(cache.get('key-22')).toBe(17)
    expect(cache.get('key-23')).toBe(18)

    cache.set('key-24', 19)
    expect(cache.size).toBe(2)
    expect(cache.get('key-21')).toBeNull()
    expect(cache.get('key-22')).toBeNull()
    expect(cache.get('key-23')).toBe(18)
    expect(cache.get('key-24')).toBe(19)
  })

  it('должен вытеснить элемент из кэша размером 3', () => {
    const cache = new LRUCache(3)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)

    cache.set('key-3', 4)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(4)

    cache.set('key-4', 5)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(4)
    expect(cache.get('key-4')).toBe(5)
  })

  it('должен обновить узел при вызове метода `set`', () => {
    const cache = new LRUCache(2)

    cache.set('2', 1)
    cache.set('1', 1)
    cache.set('2', 3)
    cache.set('4', 1)
    expect(cache.get('1')).toBeNull()
    expect(cache.get('2')).toBe(3)
  })

  it('должен обновить элементы в кэше размером 3', () => {
    const cache = new LRUCache(3)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    expect(cache.get('key-1')).toBe(1)

    cache.set('key-4', 4)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBe(4)
    expect(cache.get('key-2')).toBeNull()
  })

  it('должен обновить элементы в кэше размером 4', () => {
    const cache = new LRUCache(4)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    cache.set('key-4', 4)
    expect(cache.get('key-4')).toBe(4)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-1')).toBe(1)

    cache.set('key-5', 5)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBeNull()
    expect(cache.get('key-5')).toBe(5)

    cache.set('key-6', 6)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBeNull()
    expect(cache.get('key-5')).toBe(5)
    expect(cache.get('key-6')).toBe(6)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/lru-cache
```

<img src="https://habrastorage.org/webt/gb/b_/pj/gbb_pj6itdymbfexdt42o46lyse.png" />
<br />

_Упорядоченная карта_

Реализация, в которой используется связный список, полезна в целях обучения, поскольку позволяет понять, как достигается время выполнения `O(1)` операций `get` и `set`.

Однако КАД легче реализовать с помощью объекта `Map`, который хранит пары "ключ-значение" и запоминает порядок добавления ключей. Мы можем хранить последний используемый элемент в конце карты за счет его удаления и повторного добавления. Элемент, находящийся в начале карты, первым вытесняется из кэша. Для проверки порядка элементов можно использовать `IteratorIterable`, такой как `map.keys()`.

```javascript
// data-structure/lru-cache-on-map.js
export default class LruCacheOnMap {
  // Конструктор принимает размер кэша
  constructor(size) {
    // Размер кэша
    this.size = size
    // Хранилище (по сути, сам кэш)
    this.map = new Map()
  }

  // Возвращает значение по ключу
  get(key) {
    const val = this.map.get(key)
    if (!val) return null
    // Обновляем "приоритет" элемента
    this.map.delete(key)
    this.map.set(key, val)
    return val
  }

  // Добавляет элемент в кэш
  set(key, val) {
    // Обновляем "приоритет" элемента
    this.map.delete(key)
    this.map.set(key, val)
    // Если кэш переполнен, удаляем первый (самый редко используемый) элемент
    if (this.map.size > this.size) {
      for (const key of this.map.keys()) {
        this.map.delete(key)
        break
      }
    }
  }
}
```

<details>
<summary>Тесты</summary>

```javascript
// data-structure/__tests__/lru-cache-on-map.test.js
import LRUCache from '../lru-cache-on-map'

describe('LRUCacheOnMap', () => {
  it('должен добавить/извлечь значения в/из кэша', () => {
    const cache = new LRUCache(100)
    expect(cache.get('key-1')).toBeNull()

    cache.set('key-1', 15)
    cache.set('key-2', 16)
    cache.set('key-3', 17)
    expect(cache.get('key-1')).toBe(15)
    expect(cache.get('key-2')).toBe(16)
    expect(cache.get('key-3')).toBe(17)
    expect(cache.get('key-3')).toBe(17)
    expect(cache.get('key-2')).toBe(16)
    expect(cache.get('key-1')).toBe(15)

    cache.set('key-1', 5)
    cache.set('key-2', 6)
    cache.set('key-3', 7)
    expect(cache.get('key-1')).toBe(5)
    expect(cache.get('key-2')).toBe(6)
    expect(cache.get('key-3')).toBe(7)
  })

  it('должен вытеснить элементы из кэша размером 1', () => {
    const cache = new LRUCache(1)
    expect(cache.get('key-1')).toBeNull()

    cache.set('key-1', 15)
    expect(cache.get('key-1')).toBe(15)

    cache.set('key-2', 16)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(16)

    cache.set('key-2', 17)
    expect(cache.get('key-2')).toBe(17)

    cache.set('key-3', 18)
    cache.set('key-4', 19)
    expect(cache.get('key-2')).toBeNull()
    expect(cache.get('key-3')).toBeNull()
    expect(cache.get('key-4')).toBe(19)
  })

  it('должен вытеснить элементы из кэша размером 2', () => {
    const cache = new LRUCache(2)
    expect(cache.get('key-21')).toBeNull()

    cache.set('key-21', 15)
    expect(cache.get('key-21')).toBe(15)

    cache.set('key-22', 16)
    expect(cache.get('key-21')).toBe(15)
    expect(cache.get('key-22')).toBe(16)

    cache.set('key-22', 17)
    expect(cache.get('key-22')).toBe(17)

    cache.set('key-23', 18)
    expect(cache.get('key-21')).toBeNull()
    expect(cache.get('key-22')).toBe(17)
    expect(cache.get('key-23')).toBe(18)

    cache.set('key-24', 19)
    expect(cache.get('key-21')).toBeNull()
    expect(cache.get('key-22')).toBeNull()
    expect(cache.get('key-23')).toBe(18)
    expect(cache.get('key-24')).toBe(19)
  })

  it('должен вытеснить элемент из кэша размером 3', () => {
    const cache = new LRUCache(3)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)

    cache.set('key-3', 4)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(4)

    cache.set('key-4', 5)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(4)
    expect(cache.get('key-4')).toBe(5)
  })

  it('должен обновить узел при вызове метода `set`', () => {
    const cache = new LRUCache(2)

    cache.set('2', 1)
    cache.set('1', 1)
    cache.set('2', 3)
    cache.set('4', 1)
    expect(cache.get('1')).toBeNull()
    expect(cache.get('2')).toBe(3)
  })

  it('должен обновить элементы в кэше размером 3', () => {
    const cache = new LRUCache(3)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    expect(cache.get('key-1')).toBe(1)

    cache.set('key-4', 4)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBe(4)
    expect(cache.get('key-2')).toBeNull()
  })

  it('должен обновить элементы в кэше размером 4', () => {
    const cache = new LRUCache(4)

    cache.set('key-1', 1)
    cache.set('key-2', 2)
    cache.set('key-3', 3)
    cache.set('key-4', 4)
    expect(cache.get('key-4')).toBe(4)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-1')).toBe(1)

    cache.set('key-5', 5)
    expect(cache.get('key-1')).toBe(1)
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBeNull()
    expect(cache.get('key-5')).toBe(5)

    cache.set('key-6', 6)
    expect(cache.get('key-1')).toBeNull()
    expect(cache.get('key-2')).toBe(2)
    expect(cache.get('key-3')).toBe(3)
    expect(cache.get('key-4')).toBeNull()
    expect(cache.get('key-5')).toBe(5)
    expect(cache.get('key-6')).toBe(6)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/lru-cache-on-map
```

<img src="https://habrastorage.org/webt/15/an/lu/15anlupcnibg1wccovis5swswpm.png" />
