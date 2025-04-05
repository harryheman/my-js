---
sidebar_position: 11
title: Система непересекающихся множеств
description: Система непересекающихся множеств
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Система непересекающихся множеств

**Описание**

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0_%D0%BD%D0%B5%D0%BF%D0%B5%D1%80%D0%B5%D1%81%D0%B5%D0%BA%D0%B0%D1%8E%D1%89%D0%B8%D1%85%D1%81%D1%8F_%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2)
- [YouTube](https://www.youtube.com/watch?v=RAFQZa-8Wh4)

Система непересекающихся множеств (disjoint set) (также называемая структурой данных поиска объединения (пересечения) (union-find data structure) или множеством поиска слияния (merge-find set)) - это структура данных, которая содержит множество элементов, разделенных на определенное количество непересекающихся подмножеств. Она обеспечивает почти константное время выполнения операций (ограниченное [обратной функцией Аккермана](https://ru.wikipedia.org/wiki/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F_%D0%90%D0%BA%D0%BA%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B0)) добавления новых множеств, объединения существующих множеств и определения принадлежности элементов к одному множеству. Среди прочего, СНМ играет ключевую роль в [алгоритме Краскала](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%9A%D1%80%D0%B0%D1%81%D0%BA%D0%B0%D0%BB%D0%B0) для построения минимального остовного дерева взвешенного связного неориентированного графа.

Основные операции СНМ:

- `MakeSet(x)` - создает одноэлементное множество `{x}`
- `Find(x)` - возвращает идентификатор множества (выделенный или репрезентативный элемент), содержащего элемент `x`
- `Union(x, y)` - объединяет множества, содержащие `x` и `y`

<img src="https://habrastorage.org/webt/sg/9y/kh/sg9ykhueonz1t3saw60flfwfrvm.png" />
<br />

_8 непересекающихся множеств, созданных с помощью MakeSet_

<img src="https://habrastorage.org/webt/kb/sj/sx/kbsjsx6johtsg4dscm9copzr91e.png" />
<br />

_Группировка множеств с помощью Union_

**Реализация**

Начнем с реализации конструктора выделенного элемента множества:

```javascript
// data-structures/disjoin-set/item.js
export default class Item {
  constructor(value, keyCb) {
    // Значение
    this.value = value
    // Кастомная функция извлечения ключа
    this.keyCb = keyCb
    // Родительский узел
    this.parent = null
    // Дочерние узлы
    this.children = {}
  }
}
```

Методы получения значения узла, корневого узла и определения того, является ли узел корневым:

```javascript
// Возвращает ключ (значение)
getKey() {
  if (this.keyCb) {
    return this.keyCb(this.value)
  }
  return this.value
}

// Возвращает корневой узел
getRoot() {
  return this.isRoot() ? this : this.parent.getRoot()
}

// Определяет, является ли узел корневым
isRoot() {
  return this.parent === null
}
```

Методы получения ранга и потомков узла:

```javascript
// Возвращает ранг (вес) узла
getRank() {
  const children = this.getChildren()

  if (children.length === 0) {
    return 0
  }

  let rank = 0
  for (const child of children) {
    rank += 1
    rank += child.getRank()
  }
  return rank
}

// Возвращает потомков
getChildren() {
  return Object.values(this.children)
}
```

Методы установки родительского и добавления дочернего узла:

```javascript
// Устанавливает предка
setParent(parent, forceSettingParentChild = true) {
  this.parent = parent

  if (forceSettingParentChild) {
    parent.addChild(this)
  }

  return this
}

// Добавляет потомка
addChild(child) {
  this.children[child.getKey()] = child
  child.setParent(this, false)

  return this
}
```

<details>
<summary>Полный код узла</summary>

```javascript
export default class Item {
  constructor(value, keyCb) {
    // Значение
    this.value = value
    // Кастомная функция извлечения ключа
    this.keyCb = keyCb
    // Родительский узел
    this.parent = null
    // Дочерние узлы
    this.children = {}
  }

  // Возвращает ключ (значение)
  getKey() {
    if (this.keyCb) {
      return this.keyCb(this.value)
    }
    return this.value
  }

  // Возвращает корневой узел
  getRoot() {
    return this.isRoot() ? this : this.parent.getRoot()
  }

  // Определяет, является ли узел корневым
  isRoot() {
    return this.parent === null
  }

  // Возвращает ранг (вес) узла
  getRank() {
    const children = this.getChildren()

    if (children.length === 0) {
      return 0
    }

    let rank = 0
    for (const child of children) {
      rank += 1
      rank += child.getRank()
    }
    return rank
  }

  // Возвращает потомков
  getChildren() {
    return Object.values(this.children)
  }

  // Устанавливает предка
  setParent(parent, forceSettingParentChild = true) {
    this.parent = parent

    if (forceSettingParentChild) {
      parent.addChild(this)
    }

    return this
  }

  // Добавляет потомка
  addChild(child) {
    this.children[child.getKey()] = child
    child.setParent(this, false)

    return this
  }
}
```

</details>

Приступаем к реализации СНМ:

```javascript
// data-structures/disjoin-set/index.js
import Item from './item'

export default class DisjointSet {
  constructor(cb) {
    // Кастомная функция извлечения ключа (значения) узла
    this.cb = cb
    // Непересекающиеся подмножества
    this.items = {}
  }
}
```

Метод создания подмножества:

```javascript
// Создает подмножество
makeSet(value) {
  // Создаем выделенный элемент
  const item = new Item(value, this.cb)

  // Добавляем подмножество в список
  if (!this.items[item.getKey()]) {
    this.items[item.getKey()] = item
  }

  return this
}
```

Метод поиска выделенного элемента:

```javascript
// Ищет выделенный элемент
find(value) {
  const temp = new Item(value, this.cb)
  const item = this.items[temp.getKey()]
  return item ? item.getRoot().getKey() : null
}
```

Метод объединения двух подмножеств:

```javascript
// Объединяет подмножества
union(value1, value2) {
  const root1 = this.find(value1)
  const root2 = this.find(value2)

  if (!root1 || !root2) {
    throw new Error('Одно или оба значения отсутствуют!')
  }

  if (root1 === root2) {
    return this
  }

  const item1 = this.items[root1]
  const item2 = this.items[root2]

  // Определяем, какое подмножество имеет больший ранг.
  // Подмножество с меньшим рангом становится потомком подмножества с большим рангом
  if (item1.getRank() < item2.getRank()) {
    item2.addChild(item1)
    return this
  }

  item1.addChild(item2)
  return this
}
```

Метод определения принадлежности двух элементов к одному множеству:

```javascript
// Определяет, принадлежат ли значения к одному множеству
isSameSet(value1, value2) {
  const root1 = this.find(value1)
  const root2 = this.find(value2)

  if (!root1 || !root2) {
    throw new Error('Одно или оба значения отсутствуют!')
  }

  return root1 === root2
}
```

<details>
<summary>Полный код СНМ</summary>

```javascript
import Item from './item'

export default class DisjointSet {
  constructor(cb) {
    // Кастомная функция извлечения ключа (значения) узла
    this.cb = cb
    // Непересекающиеся подмножества
    this.items = {}
  }

  // Создает подмножество
  makeSet(value) {
    // Создаем выделенный элемент
    const item = new Item(value, this.cb)

    // Добавляем подмножество в список
    if (!this.items[item.getKey()]) {
      this.items[item.getKey()] = item
    }

    return this
  }

  // Ищет выделенный элемент
  find(value) {
    const temp = new Item(value, this.cb)
    const item = this.items[temp.getKey()]
    return item ? item.getRoot().getKey() : null
  }

  // Объединяет подмножества
  union(value1, value2) {
    const root1 = this.find(value1)
    const root2 = this.find(value2)

    if (!root1 || !root2) {
      throw new Error('Одно или оба значения отсутствуют!')
    }

    if (root1 === root2) {
      return this
    }

    const item1 = this.items[root1]
    const item2 = this.items[root2]

    // Определяем, какое подмножество имеет больший ранг.
    // Подмножество с меньшим рангом становится потомком подмножества с большим рангом
    if (item1.getRank() < item2.getRank()) {
      item2.addChild(item1)
      return this
    }

    item1.addChild(item2)
    return this
  }

  // Определяет, принадлежат ли значения к одному множеству
  isSameSet(value1, value2) {
    const root1 = this.find(value1)
    const root2 = this.find(value2)

    if (!root1 || !root2) {
      throw new Error('Одно или оба значения отсутствуют!')
    }

    return root1 === root2
  }
}
```

</details>

Автономную СНМ (без дополнительных зависимостей) можно реализовать следующим образом:

```javascript
export default class DisjointSetAdHoc {
  constructor(size) {
    this.roots = new Array(size).fill(0).map((_, i) => i)
    this.heights = new Array(size).fill(1)
  }

  find(a) {
    if (this.roots[a] === a) return a
    this.roots[a] = this.find(this.roots[a])
    return this.roots[a]
  }

  union(a, b) {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return

    if (this.heights[rootA] < this.heights[rootB]) {
      this.roots[rootA] = rootB
    } else if (this.heights[rootA] > this.heights[rootB]) {
      this.roots[rootB] = rootA
    } else {
      this.roots[rootB] = rootA
      this.heights[rootA]++
    }
  }

  connected(a, b) {
    return this.find(a) === this.find(b)
  }
}
```

<details>
<summary>Тесты для выделенного элемента</summary>

```javascript
// data-structures/disjoint-set/__tests__/item.test.js
import Item from '../item'

describe('Item', () => {
  it('должен выполнить базовые манипуляции с выделенным элементом', () => {
    const itemA = new Item('A')
    const itemB = new Item('B')
    const itemC = new Item('C')
    const itemD = new Item('D')

    expect(itemA.getRank()).toBe(0)
    expect(itemA.getChildren()).toEqual([])
    expect(itemA.getKey()).toBe('A')
    expect(itemA.getRoot()).toEqual(itemA)
    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(true)

    itemA.addChild(itemB)
    itemD.setParent(itemC)

    expect(itemA.getRank()).toBe(1)
    expect(itemC.getRank()).toBe(1)

    expect(itemB.getRank()).toBe(0)
    expect(itemD.getRank()).toBe(0)

    expect(itemA.getChildren().length).toBe(1)
    expect(itemC.getChildren().length).toBe(1)

    expect(itemA.getChildren()[0]).toEqual(itemB)
    expect(itemC.getChildren()[0]).toEqual(itemD)

    expect(itemB.getChildren().length).toBe(0)
    expect(itemD.getChildren().length).toBe(0)

    expect(itemA.getRoot()).toEqual(itemA)
    expect(itemB.getRoot()).toEqual(itemA)

    expect(itemC.getRoot()).toEqual(itemC)
    expect(itemD.getRoot()).toEqual(itemC)

    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(false)
    expect(itemC.isRoot()).toBe(true)
    expect(itemD.isRoot()).toBe(false)

    itemA.addChild(itemC)

    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(false)
    expect(itemC.isRoot()).toBe(false)
    expect(itemD.isRoot()).toBe(false)

    expect(itemA.getRank()).toEqual(3)
    expect(itemB.getRank()).toEqual(0)
    expect(itemC.getRank()).toEqual(1)
  })

  it('должен выполнить базовые манипуляции с выделенным элементом с кастомной функцией извлечения ключа', () => {
    const keyExtractor = (value) => value.key

    const itemA = new Item({ key: 'A', value: 1 }, keyExtractor)
    const itemB = new Item({ key: 'B', value: 2 }, keyExtractor)
    const itemC = new Item({ key: 'C', value: 3 }, keyExtractor)
    const itemD = new Item({ key: 'D', value: 4 }, keyExtractor)

    expect(itemA.getRank()).toBe(0)
    expect(itemA.getChildren()).toEqual([])
    expect(itemA.getKey()).toBe('A')
    expect(itemA.getRoot()).toEqual(itemA)
    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(true)

    itemA.addChild(itemB)
    itemD.setParent(itemC)

    expect(itemA.getRank()).toBe(1)
    expect(itemC.getRank()).toBe(1)

    expect(itemB.getRank()).toBe(0)
    expect(itemD.getRank()).toBe(0)

    expect(itemA.getChildren().length).toBe(1)
    expect(itemC.getChildren().length).toBe(1)

    expect(itemA.getChildren()[0]).toEqual(itemB)
    expect(itemC.getChildren()[0]).toEqual(itemD)

    expect(itemB.getChildren().length).toBe(0)
    expect(itemD.getChildren().length).toBe(0)

    expect(itemA.getRoot()).toEqual(itemA)
    expect(itemB.getRoot()).toEqual(itemA)

    expect(itemC.getRoot()).toEqual(itemC)
    expect(itemD.getRoot()).toEqual(itemC)

    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(false)
    expect(itemC.isRoot()).toBe(true)
    expect(itemD.isRoot()).toBe(false)

    itemA.addChild(itemC)

    expect(itemA.isRoot()).toBe(true)
    expect(itemB.isRoot()).toBe(false)
    expect(itemC.isRoot()).toBe(false)
    expect(itemD.isRoot()).toBe(false)

    expect(itemA.getRank()).toEqual(3)
    expect(itemB.getRank()).toEqual(0)
    expect(itemC.getRank()).toEqual(1)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/disjoint-set/__tests__/item
```

<img src="https://habrastorage.org/webt/qf/qo/2i/qfqo2irqnlatstfp8kjim28-zog.png" />
<br />

<details>
<summary>Тесты для СНМ</summary>

```javascript
// data-structures/disjoint-set/__tests__/disjoint-set.test.js
import DisjointSet from '..'

describe('DisjointSet', () => {
  it('должен выбросить исключения при объединении и проверке несуществующих множеств', () => {
    function mergeNotExistingSets() {
      const disjointSet = new DisjointSet()

      disjointSet.union('A', 'B')
    }

    function checkNotExistingSets() {
      const disjointSet = new DisjointSet()

      disjointSet.isSameSet('A', 'B')
    }

    expect(mergeNotExistingSets).toThrow()
    expect(checkNotExistingSets).toThrow()
  })

  it('должен выполнить базовые манипуляции с системой непересекающихся множеств', () => {
    const disjointSet = new DisjointSet()

    expect(disjointSet.find('A')).toBeNull()
    expect(disjointSet.find('B')).toBeNull()

    disjointSet.makeSet('A')

    expect(disjointSet.find('A')).toBe('A')
    expect(disjointSet.find('B')).toBeNull()

    disjointSet.makeSet('B')

    expect(disjointSet.find('A')).toBe('A')
    expect(disjointSet.find('B')).toBe('B')

    disjointSet.makeSet('C')

    expect(disjointSet.isSameSet('A', 'B')).toBe(false)

    disjointSet.union('A', 'B')

    expect(disjointSet.find('A')).toBe('A')
    expect(disjointSet.find('B')).toBe('A')
    expect(disjointSet.isSameSet('A', 'B')).toBe(true)
    expect(disjointSet.isSameSet('B', 'A')).toBe(true)
    expect(disjointSet.isSameSet('A', 'C')).toBe(false)

    disjointSet.union('A', 'A')

    disjointSet.union('B', 'C')

    expect(disjointSet.find('A')).toBe('A')
    expect(disjointSet.find('B')).toBe('A')
    expect(disjointSet.find('C')).toBe('A')

    expect(disjointSet.isSameSet('A', 'B')).toBe(true)
    expect(disjointSet.isSameSet('B', 'C')).toBe(true)
    expect(disjointSet.isSameSet('A', 'C')).toBe(true)

    disjointSet.makeSet('E').makeSet('F').makeSet('G').makeSet('H').makeSet('I')

    disjointSet.union('E', 'F').union('F', 'G').union('G', 'H').union('H', 'I')

    expect(disjointSet.isSameSet('A', 'I')).toBe(false)
    expect(disjointSet.isSameSet('E', 'I')).toBe(true)

    disjointSet.union('I', 'C')

    expect(disjointSet.find('I')).toBe('E')
    expect(disjointSet.isSameSet('A', 'I')).toBe(true)
  })

  it('должен выполнить базовые манипуляции с системой непересекающихся множеств с кастомной функцией извлечения ключа', () => {
    const keyExtractor = (value) => value.key

    const disjointSet = new DisjointSet(keyExtractor)

    const itemA = { key: 'A', value: 1 }
    const itemB = { key: 'B', value: 2 }
    const itemC = { key: 'C', value: 3 }

    expect(disjointSet.find(itemA)).toBeNull()
    expect(disjointSet.find(itemB)).toBeNull()

    disjointSet.makeSet(itemA)

    expect(disjointSet.find(itemA)).toBe('A')
    expect(disjointSet.find(itemB)).toBeNull()

    disjointSet.makeSet(itemB)

    expect(disjointSet.find(itemA)).toBe('A')
    expect(disjointSet.find(itemB)).toBe('B')

    disjointSet.makeSet(itemC)

    expect(disjointSet.isSameSet(itemA, itemB)).toBe(false)

    disjointSet.union(itemA, itemB)

    expect(disjointSet.find(itemA)).toBe('A')
    expect(disjointSet.find(itemB)).toBe('A')
    expect(disjointSet.isSameSet(itemA, itemB)).toBe(true)
    expect(disjointSet.isSameSet(itemB, itemA)).toBe(true)
    expect(disjointSet.isSameSet(itemA, itemC)).toBe(false)

    disjointSet.union(itemA, itemC)

    expect(disjointSet.find(itemA)).toBe('A')
    expect(disjointSet.find(itemB)).toBe('A')
    expect(disjointSet.find(itemC)).toBe('A')

    expect(disjointSet.isSameSet(itemA, itemB)).toBe(true)
    expect(disjointSet.isSameSet(itemB, itemC)).toBe(true)
    expect(disjointSet.isSameSet(itemA, itemC)).toBe(true)
  })

  it('должен объединить меньшее множество с большим, сделав большее новым выделенным элементом', () => {
    const disjointSet = new DisjointSet()

    disjointSet
      .makeSet('A')
      .makeSet('B')
      .makeSet('C')
      .union('B', 'C')
      .union('A', 'C')

    expect(disjointSet.find('A')).toBe('B')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/disjoint-set/__tests__/disjoint-set
```

<img src="https://habrastorage.org/webt/oq/jh/bj/oqjhbjoutk1b9tjgfs5nyeqhpgw.png" />
<br />

<details>
<summary>Тесты для автономной СНМ</summary>

```javascript
// data-structures/disjoint-set/__tests__/ad-hoc.test.js
import DisjointSetAdhoc from '../ad-hoc'

describe('DisjointSetAdhoc', () => {
  it('должен создать множества и найти соединенные элементы', () => {
    const set = new DisjointSetAdhoc(10)

    // 1-2-5-6-7 3-8-9 4
    set.union(1, 2)
    set.union(2, 5)
    set.union(5, 6)
    set.union(6, 7)

    set.union(3, 8)
    set.union(8, 9)

    expect(set.connected(1, 5)).toBe(true)
    expect(set.connected(5, 7)).toBe(true)
    expect(set.connected(3, 8)).toBe(true)

    expect(set.connected(4, 9)).toBe(false)
    expect(set.connected(4, 7)).toBe(false)

    // 1-2-5-6-7 3-8-9-4
    set.union(9, 4)

    expect(set.connected(4, 9)).toBe(true)
    expect(set.connected(4, 3)).toBe(true)
    expect(set.connected(8, 4)).toBe(true)

    expect(set.connected(8, 7)).toBe(false)
    expect(set.connected(2, 3)).toBe(false)
  })

  it('должен сохранять высоту дерева маленькой', () => {
    const set = new DisjointSetAdhoc(10)

    // 1-2-6-7-9 1 3 4 5
    set.union(7, 6)
    set.union(1, 2)
    set.union(2, 6)
    set.union(1, 7)
    set.union(9, 1)

    expect(set.connected(1, 7)).toBe(true)
    expect(set.connected(6, 9)).toBe(true)
    expect(set.connected(4, 9)).toBe(false)

    expect(Math.max(...set.heights)).toBe(3)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/disjoint-set/__tests__/ad-hoc
```

<img src="https://habrastorage.org/webt/da/aq/aj/daaqaj509ydv7vlmepjc-x2yqqc.png" />
