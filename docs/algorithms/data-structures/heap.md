---
sidebar_position: 6
title: Куча
description: Куча
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Куча

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9A%D1%83%D1%87%D0%B0_(%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B0_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85))
- [YouTube](https://www.youtube.com/watch?v=bO6h0NbbUEg)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/heap)

Куча (heap) - это специализированная структура данных типа "дерево" (tree), которая удовлетворяет свойству кучи: если `B` является узлом-потомком узла `A`, то `k(A) >= k(B)`, где `k(X)` - ключ (идентификатор) узла. Из этого следует, что элемент с наибольшим значением ключа всегда является корневым узлом (root node) кучи, поэтому такие кучи называют max-кучами (max heaps):

<img src="https://habrastorage.org/webt/oj/f2/tw/ojf2tw7pyohegjkuug9tbqbwyre.png" />
<br />

Приведенную max-кучу можно представить в виде массива следующим образом:

<img src="https://habrastorage.org/webt/ra/er/en/raerencrfmantpcrfbgdc6iqmji.png" />
<br />

Если дерево перевернуть, то корневым узлом всегда будет элемент с наименьшим значением. Такие кучи называют min-кучами:

<img src="https://habrastorage.org/webt/ir/5v/rd/ir5vrdxssdly_uih82hq7slokr4.png" />
<br />

Не существует никаких ограничений относительно того, сколько узлов-потомков имеет каждый узел кучи, хотя на практике их число обычно не более двух (такие кучи называют "двоичными" или "бинарными" (binary)). Куча является максимально эффективной реализацией абстрактного типа данных, который называется "очередью с приоритетом" (см. следующий раздел). Кучи имеют решающее значение в некоторых эффективных алгоритмах на графах, таких, как алгоритм Дейкстры на d-кучах и сортировка [методом пирамиды](https://ru.wikipedia.org/wiki/%D0%9F%D0%B8%D1%80%D0%B0%D0%BC%D0%B8%D0%B4%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0).

Интерактивную визуализации кучи можно посмотреть [здесь](https://www.cs.usfca.edu/~galles/JavascriptVisual/Heap.html).

__Сложность__

Временная сложность кучи зависит от ее типа.

| Тип кучи                                                                                           | find-max   | delete-max | insert     | increase-key | meld       |
|----------------------------------------------------------------------------------------------------|------------|------------|------------|--------------|------------|
| [Binary](https://en.wikipedia.org/wiki/Binary_heap)                                                | `Θ(1)`     | `Θ(log n)` | `O(log n)` | `O(log n)`   | `Θ(n)`     |
| [Leftist](https://en.wikipedia.org/wiki/Leftist_tree)                                              | `Θ(1)`     | `Θ(log n)` | `Θ(log n)` | `O(log n)`   | `Θ(log n)` |
| [Binomial](https://en.wikipedia.org/wiki/Binomial_heap)                                            | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `O(log n)`   | `O(log n)` |
| [Fibonacci](https://en.wikipedia.org/wiki/Fibonacci_heap)                                          | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `Θ(1)`       | `Θ(1)`     |
| [Pairing](https://en.wikipedia.org/wiki/Pairing_heap)                                              | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `o(log n)`   | `Θ(1)`     |
| [Brodal](https://en.wikipedia.org/wiki/Brodal_queue)                                               | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `Θ(1)`       | `Θ(1)`     |
| [Rank-pairing](https://en.wikipedia.org/w/index.php?title=Rank-pairing_heap&action=edit&redlink=1) | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `Θ(1)`       | `Θ(1)`     |
| [Strict Fibonacci](https://en.wikipedia.org/wiki/Fibonacci_heap)                                   | `Θ(1)`     | `Θ(log n)` | `Θ(1)`     | `Θ(1)`       | `Θ(1)`     |
| [2-3 heap](https://en.wikipedia.org/wiki/2%E2%80%933_heap)                                         | `O(log n)` | `O(log n)` | `O(log n)` | `Θ(1)`       | `?`        |

Где:

- _find-max (или find-min):_ поиск максимального значения в max-куче или минимального значения в min-куче, соответственно (похоже на _peek_ в очереди или стеке)
- _delete-max (or delete-min):_ удаление корневого узла
- _insert:_ добавление в кучу нового значения (похоже на _push_ в стеке или _enqueue_ в очереди)
- _increase-key или decrease-key:_ обновление значения узла
- _meld:_ объединение 2 куч в 1 с уничтожением оригиналов

__Реализация__

В рамках этой статьи мы рассмотрим реализацию только бинарной кучи.

Начнем с реализации родительского (или супер, или абстрактного) класса для min- и max-куч. Конструктор этого класса будет выглядеть следующим образом:

```javascript
// data-structures/heap/index.js
// Импортируем конструктор функции сравнения узлов
import Comparator from '../../utils/comparator'

// Родительский класс для min- и max-куч
export default class Heap {
  constructor(fn) {
    // Кучи должны создаваться с помощью соответствующих подклассов
    if (new.target === Heap) {
      throw new TypeError('Кучу нельзя создавать напрямую!')
    }
    // Представление кучи в виде массива
    this.heapContainer = []
    // Функция сравнения элементов
    this.compare = new Comparator(fn)
  }
}
```

Реализуем несколько вспомогательных методов:

```javascript
// Возвращает индекс левого потомка
getLeftChildIndex(parentIndex) {
  return 2 * parentIndex + 1
}

// Возвращает индекс правого потомка
getRightChildIndex(parentIndex) {
  return 2 * parentIndex + 2
}

// Возвращает индекс предка
getParentIndex(childIndex) {
  return Math.floor((childIndex - 1) / 2)
}

// Проверяет наличие предка
hasParent(childIndex) {
  return this.getParentIndex(childIndex) >= 0
}

// Проверяет наличие левого потомка
hasLeftChild(parentIndex) {
  return this.getLeftChildIndex(parentIndex) < this.heapContainer.length
}

// Проверяет наличие правого потомка
hasRightChild(parentIndex) {
  return this.getRightChildIndex(parentIndex) < this.heapContainer.length
}

// Возвращает левого потомка
leftChild(parentIndex) {
  return this.heapContainer[this.getLeftChildIndex(parentIndex)]
}

// Возвращает правого потомка
rightChild(parentIndex) {
  return this.heapContainer[this.getRightChildIndex(parentIndex)]
}

// Возвращает предка
parent(childIndex) {
  return this.heapContainer[this.getParentIndex(childIndex)]
}

// Определяет пустоту кучи
isEmpty() {
  return this.heapContainer.length === 0
}

// Возвращает строковое представление кучи
toString() {
  return this.heapContainer.toString()
}
```

Методы получения ссылки на корневой элемент кучи и самого корневого элемента:

```javascript
// Возвращает ссылку на корневой элемент кучи
// (наименьший для min-кучи, наибольший для max-кучи;
// элемент не удаляется)
peek() {
  if (this.isEmpty()) {
    return null
  }

  return this.heapContainer[0]
}

// Удаляет и возвращает корневой элемент кучи
poll() {
  if (this.isEmpty()) {
    return null
  }

  if (this.heapContainer.length === 1) {
    return this.heapContainer.pop()
  }

  const item = this.heapContainer[0]
  // Перемещаем последний элемент в начало
  this.heapContainer[0] = this.heapContainer.pop()
  // Просеиваем кучу вниз
  this.heapifyDown()
  // Возвращаем удаленный элемент
  return item
}
```

Методы добавления и удаления элементов:

```javascript
// Добавляет элемент в кучу
add(item) {
  // Добавляем новый элемент в конец кучи
  this.heapContainer.push(item)
  // Просеиваем кучу вверх
  this.heapifyUp()

  return this
}

// Удаляет элемент из кучи.
// Принимает элемент и кастомную функцию сравнения элементов
remove(item, comparator = this.compare) {
  // Определяем количество удаляемых элементов
  const numberOfItemsToRemove = this.find(item, comparator).length

  for (let i = 0; i < numberOfItemsToRemove; i += 1) {
    // Определять индекс удаляемого элемента необходимо на каждой итерации,
    // поскольку куча каждый раз модифицируется
    const index = this.find(item, comparator).pop()

    // Последний элемент просто удаляется
    if (index === this.heapContainer.length - 1) {
      this.heapContainer.pop()
    } else {
      // Иначе, перемещаем последний элемент на освободившееся место
      this.heapContainer[index] = this.heapContainer.pop()
      // Получаем родительский элемент
      const parentItem = this.parent(index)

      // Если предок отсутствует или неправильно расположен,
      // просеиваем кучу вниз
      if (
        this.hasLeftChild(index) &&
        (!parentItem ||
          this.pairIsInCorrectOrder(parentItem, this.heapContainer[index]))
      ) {
        this.heapifyDown(index)
      } else {
        // Иначе, просеиваем кучу вверх
        this.heapifyUp(index)
      }
    }
  }

  return this
}
```

Метод поиска индексов элементов:

```javascript
// Находит индексы всех элементов, равных `item`.
// Принимает искомый элемент и кастомную функцию сравнения элементов
find(item, comparator = this.compare) {
  const indices = []

  for (let i = 0; i < this.heapContainer.length; i += 1) {
    if (comparator.equal(this.heapContainer[i], item)) {
      indices.push(i)
    }
  }

  return indices
}
```

Метод перестановки элементов:

```javascript
// Меняет элементы местами
swap(indexOne, indexTwo) {
  const tmp = this.heapContainer[indexOne]
  this.heapContainer[indexOne] = this.heapContainer[indexTwo]
  this.heapContainer[indexTwo] = tmp
}
```

Пришло время главных (и самых сложных для понимания) функций кучи.

Функция просеивания кучи вверх:

```javascript
// Просеивает кучу вверх.
// Принимает кастомный индекс начальной позиции
heapifyUp(customStartIndex) {
  // Берем последний элемент (последний в массиве или нижний левый в дереве)
  // и поднимаем его наверх до тех пор, пока он не будет
  // правильно расположен по отношению к предку
  let currentIndex = customStartIndex || this.heapContainer.length - 1

  while (
    this.hasParent(currentIndex) &&
    !this.pairIsInCorrectOrder(
      this.parent(currentIndex),
      this.heapContainer[currentIndex],
    )
  ) {
    this.swap(currentIndex, this.getParentIndex(currentIndex))
    currentIndex = this.getParentIndex(currentIndex)
  }
}
```

Функция просеивания кучи вниз:

```javascript
// Просеивает кучу вниз.
// Принимает кастомный индекс начальной позиции (по умолчанию 0)
heapifyDown(customStartIndex = 0) {
  // Сравниваем предка с его потомками и
  // меняем местами предка с соответствующим потомком
  // (наименьшим для min-кучи, наибольшим для max-кучи).
  // Затем делаем тоже самое для следующего потомка
  let currentIndex = customStartIndex
  let nextIndex = null

  // Пока есть левый потомок
  while (this.hasLeftChild(currentIndex)) {
    // Если есть правый потомок и
    // потомки расположены в правильном порядке
    if (
      this.hasRightChild(currentIndex) &&
      this.pairIsInCorrectOrder(
        this.rightChild(currentIndex),
        this.leftChild(currentIndex),
      )
    ) {
      // Следующим индексом является индекс правого потомка
      nextIndex = this.getRightChildIndex(currentIndex)
    } else {
      // Иначе, следующим индексом является индекс левого потомка
      nextIndex = this.getLeftChildIndex(currentIndex)
    }

    // Прерываем цикл, если элементы расположены в правильном порядке
    if (
      this.pairIsInCorrectOrder(
        this.heapContainer[currentIndex],
        this.heapContainer[nextIndex],
      )
    ) {
      break
    }

    // Меняем элементы местами
    this.swap(currentIndex, nextIndex)
    // Обновляем текущий индекс
    currentIndex = nextIndex
  }
}
```

Заглушка (абстрактный метод, контракт) для метода определения правильного расположения элементов:

```javascript
// Проверяет, что пара элементов в куче расположена в правильном порядке.
// Для min-кучи первый элемент всегда должен быть меньше или равен второму.
// Для max-кучи первый элемент всегда должен быть больше или равен второму.
// Этот метод должен быть реализован соответствующими подклассами
// (min-кучей и max-кучей)
pairIsInCorrectOrder(firstElement, secondElement) {
  throw new Error('Метод сравнения не реализован!')
}
```

<details>
<summary>Полный код кучи</summary>

```javascript
// Импортируем конструктор функции сравнения узлов
import Comparator from '../../utils/comparator'

// Родительский класс для min- и max-куч
export default class Heap {
  constructor(fn) {
    // Кучи должны создаваться с помощью соответствующих подклассов
    if (new.target === Heap) {
      throw new TypeError('Кучу нельзя создавать напрямую!')
    }
    // Представление кучи в виде массива
    this.heapContainer = []
    // Функция сравнения элементов
    this.compare = new Comparator(fn)
  }

  // Возвращает индекс левого потомка
  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1
  }

  // Возвращает индекс правого потомка
  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2
  }

  // Возвращает индекс предка
  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2)
  }

  // Проверяет наличие предка
  hasParent(childIndex) {
    return this.getParentIndex(childIndex) >= 0
  }

  // Проверяет наличие левого потомка
  hasLeftChild(parentIndex) {
    return this.getLeftChildIndex(parentIndex) < this.heapContainer.length
  }

  // Проверяет наличие правого потомка
  hasRightChild(parentIndex) {
    return this.getRightChildIndex(parentIndex) < this.heapContainer.length
  }

  // Возвращает левого потомка
  leftChild(parentIndex) {
    return this.heapContainer[this.getLeftChildIndex(parentIndex)]
  }

  // Возвращает правого потомка
  rightChild(parentIndex) {
    return this.heapContainer[this.getRightChildIndex(parentIndex)]
  }

  // Возвращает предка
  parent(childIndex) {
    return this.heapContainer[this.getParentIndex(childIndex)]
  }

  // Определяет пустоту кучи
  isEmpty() {
    return this.heapContainer.length === 0
  }

  // Возвращает строковое представление кучи
  toString() {
    return this.heapContainer.toString()
  }

  // Возвращает ссылку на корневой элемент кучи
  // (наименьший для min-кучи, наибольший для max-кучи;
  // элемент не удаляется)
  peek() {
    if (this.isEmpty()) {
      return null
    }

    return this.heapContainer[0]
  }

  // Удаляет и возвращает корневой элемент кучи
  poll() {
    if (this.isEmpty()) {
      return null
    }

    if (this.heapContainer.length === 1) {
      return this.heapContainer.pop()
    }

    const item = this.heapContainer[0]
    // Перемещаем последний элемент в начало
    this.heapContainer[0] = this.heapContainer.pop()
    // Просеиваем кучу вниз
    this.heapifyDown()
    // Возвращаем удаленный элемент
    return item
  }

  // Добавляет элемент в кучу
  add(item) {
    // Добавляем новый элемент в конец кучи
    this.heapContainer.push(item)
    // Просеиваем кучу вверх
    this.heapifyUp()

    return this
  }

  // Удаляет элемент из кучи.
  // Принимает элемент и кастомную функцию сравнения элементов
  remove(item, comparator = this.compare) {
    // Определяем количество удаляемых элементов
    const numberOfItemsToRemove = this.find(item, comparator).length

    for (let i = 0; i < numberOfItemsToRemove; i += 1) {
      // Определять индекс удаляемого элемента необходимо на каждой итерации,
      // поскольку куча каждый раз модифицируется
      const index = this.find(item, comparator).pop()

      // Последний элемент просто удаляется
      if (index === this.heapContainer.length - 1) {
        this.heapContainer.pop()
      } else {
        // Иначе, перемещаем последний элемент на освободившееся место
        this.heapContainer[index] = this.heapContainer.pop()
        // Получаем родительский элемент
        const parentItem = this.parent(index)

        // Если предок отсутствует или неправильно расположен,
        // просеиваем кучу вниз
        if (
          this.hasLeftChild(index) &&
          (!parentItem ||
            this.pairIsInCorrectOrder(parentItem, this.heapContainer[index]))
        ) {
          this.heapifyDown(index)
        } else {
          // Иначе, просеиваем кучу вверх
          this.heapifyUp(index)
        }
      }
    }

    return this
  }

  // Находит индексы всех элементов, равных `item`.
  // Принимает искомый элемент и кастомную функцию сравнения элементов
  find(item, comparator = this.compare) {
    const indices = []

    for (let i = 0; i < this.heapContainer.length; i += 1) {
      if (comparator.equal(this.heapContainer[i], item)) {
        indices.push(i)
      }
    }

    return indices
  }

  // Меняет элементы местами
  swap(indexOne, indexTwo) {
    const tmp = this.heapContainer[indexOne]
    this.heapContainer[indexOne] = this.heapContainer[indexTwo]
    this.heapContainer[indexTwo] = tmp
  }

  // Просеивает кучу вверх.
  // Принимает кастомный индекс начальной позиции
  heapifyUp(customStartIndex) {
    // Берем последний элемент (последний в массиве или нижний левый в дереве)
    // и поднимаем его наверх до тех пор, пока он не будет
    // правильно расположен по отношению к предку
    let currentIndex = customStartIndex || this.heapContainer.length - 1

    while (
      this.hasParent(currentIndex) &&
      !this.pairIsInCorrectOrder(
        this.parent(currentIndex),
        this.heapContainer[currentIndex],
      )
    ) {
      this.swap(currentIndex, this.getParentIndex(currentIndex))
      currentIndex = this.getParentIndex(currentIndex)
    }
  }

  // Просеивает кучу вниз.
  // Принимает кастомный индекс начальной позиции (по умолчанию 0)
  heapifyDown(customStartIndex = 0) {
    // Сравниваем предка с его потомками и
    // меняем местами предка с соответствующим потомком
    // (наименьшим для min-кучи и наибольшим для max-кучи).
    // Затем делаем тоже самое для следующего потомка
    let currentIndex = customStartIndex
    let nextIndex = null

    // Пока есть левый потомок
    while (this.hasLeftChild(currentIndex)) {
      // Если есть правый потомок и
      // потомки расположены в правильном порядке
      if (
        this.hasRightChild(currentIndex) &&
        this.pairIsInCorrectOrder(
          this.rightChild(currentIndex),
          this.leftChild(currentIndex),
        )
      ) {
        // Следующим индексом является индекс правого потомка
        nextIndex = this.getRightChildIndex(currentIndex)
      } else {
        // Иначе, следующим индексом является индекс левого потомка
        nextIndex = this.getLeftChildIndex(currentIndex)
      }

      // Прерываем цикл, если элементы расположены в правильном порядке
      if (
        this.pairIsInCorrectOrder(
          this.heapContainer[currentIndex],
          this.heapContainer[nextIndex],
        )
      ) {
        break
      }

      // Меняем элементы местами
      this.swap(currentIndex, nextIndex)
      // Обновляем текущий индекс
      currentIndex = nextIndex
    }
  }

  // Проверяет, что пара элементов в куче расположена в правильном порядке.
  // Для min-кучи первый элемент всегда должен быть меньше или равен второму.
  // Для max-кучи первый элемент всегда должен быть больше или равен второму.
  // Этот метод должен быть реализован соответствующими подклассами
  // (min-кучей и max-кучей)
  pairIsInCorrectOrder(firstElement, secondElement) {
    throw new Error('Метод сравнения не реализован!')
  }
}
```

</details>

Таким образом, реализация подклассов сводится к реализации метода `pairIsInCorrectOrder`.

Реализация подкласса min-кучи:

```javascript
// data-structures/heap/min-heap.js
import Heap from '.'

export default class MinHeap extends Heap {
  pairIsInCorrectOrder(firstElement, secondElement) {
    // Первый элемент должен быть меньше или равен второму
    return this.compare.lessThanOrEqual(firstElement, secondElement)
  }
}
```

Реализация подкласса max-кучи:

```javascript
// data-structures/heap/max-heap.js
import Heap from '.'

export default class MaxHeap extends Heap {
  pairIsInCorrectOrder(firstElement, secondElement) {
    // Первый элемент должен быть больше или равен второму
    return this.compare.greaterThanOrEqual(firstElement, secondElement)
  }
}
```

__Тестирование__

Проверим, что наша куча работает, как ожидается.

Начнем с суперкласса:

```javascript
// data-structures/heap/__tests__/heap.test.js
import Heap from '..'

describe('Heap', () => {
  it('должен выбросить исключение при попытке создания кучи напрямую', () => {
    const instantiateHeap = () => {
      const heap = new Heap()
      heap.add(5)
    }

    expect(instantiateHeap).toThrow()
  })
})
```

<details>
<summary>Тесты для min-кучи</summary>

```javascript
// data-structures/heap/__tests__/min-heap.test.js
import MinHeap from '../min-heap'
import Comparator from '../../../utils/comparator'

describe('MinHeap', () => {
  it('должен создать пустую min-кучу', () => {
    const minHeap = new MinHeap()

    expect(minHeap).toBeDefined()
    expect(minHeap.peek()).toBeNull()
    expect(minHeap.isEmpty()).toBe(true)
  })

  it('должен добавить элементы в кучу и просеять ее вверх', () => {
    const minHeap = new MinHeap()

    minHeap.add(5)
    expect(minHeap.isEmpty()).toBe(false)
    expect(minHeap.peek()).toBe(5)
    expect(minHeap.toString()).toBe('5')

    minHeap.add(3)
    expect(minHeap.peek()).toBe(3)
    expect(minHeap.toString()).toBe('3,5')

    minHeap.add(10)
    expect(minHeap.peek()).toBe(3)
    expect(minHeap.toString()).toBe('3,5,10')

    minHeap.add(1)
    expect(minHeap.peek()).toBe(1)
    expect(minHeap.toString()).toBe('1,3,10,5')

    minHeap.add(1)
    expect(minHeap.peek()).toBe(1)
    expect(minHeap.toString()).toBe('1,1,10,5,3')

    expect(minHeap.poll()).toBe(1)
    expect(minHeap.toString()).toBe('1,3,10,5')

    expect(minHeap.poll()).toBe(1)
    expect(minHeap.toString()).toBe('3,5,10')

    expect(minHeap.poll()).toBe(3)
    expect(minHeap.toString()).toBe('5,10')
  })

  it('должен извлечь элементы из кучи и просеять ее вниз', () => {
    const minHeap = new MinHeap()

    minHeap.add(5)
    minHeap.add(3)
    minHeap.add(10)
    minHeap.add(11)
    minHeap.add(1)

    expect(minHeap.toString()).toBe('1,3,10,11,5')

    expect(minHeap.poll()).toBe(1)
    expect(minHeap.toString()).toBe('3,5,10,11')

    expect(minHeap.poll()).toBe(3)
    expect(minHeap.toString()).toBe('5,11,10')

    expect(minHeap.poll()).toBe(5)
    expect(minHeap.toString()).toBe('10,11')

    expect(minHeap.poll()).toBe(10)
    expect(minHeap.toString()).toBe('11')

    expect(minHeap.poll()).toBe(11)
    expect(minHeap.toString()).toBe('')

    expect(minHeap.poll()).toBeNull()
    expect(minHeap.toString()).toBe('')
  })

  it('должен просеять кучу вниз по правильной ветке', () => {
    const minHeap = new MinHeap()

    minHeap.add(3)
    minHeap.add(12)
    minHeap.add(10)

    expect(minHeap.toString()).toBe('3,12,10')

    minHeap.add(11)
    expect(minHeap.toString()).toBe('3,11,10,12')

    expect(minHeap.poll()).toBe(3)
    expect(minHeap.toString()).toBe('10,11,12')
  })

  it('должен находить индексы элементов', () => {
    const minHeap = new MinHeap()

    minHeap.add(3)
    minHeap.add(12)
    minHeap.add(10)
    minHeap.add(11)
    minHeap.add(11)

    expect(minHeap.toString()).toBe('3,11,10,12,11')

    expect(minHeap.find(5)).toEqual([])
    expect(minHeap.find(3)).toEqual([0])
    expect(minHeap.find(11)).toEqual([1, 4])
  })

  it('должен удалять элементы из кучи с ее просеиванием вниз', () => {
    const minHeap = new MinHeap()

    minHeap.add(3)
    minHeap.add(12)
    minHeap.add(10)
    minHeap.add(11)
    minHeap.add(11)

    expect(minHeap.toString()).toBe('3,11,10,12,11')

    expect(minHeap.remove(3).toString()).toEqual('10,11,11,12')
    expect(minHeap.remove(3).peek()).toEqual(10)
    expect(minHeap.remove(11).toString()).toEqual('10,12')
    expect(minHeap.remove(3).peek()).toEqual(10)
  })

  it('должен удалять элементы из кучи с ее просеиванием вверх', () => {
    const minHeap = new MinHeap()

    minHeap.add(3)
    minHeap.add(10)
    minHeap.add(5)
    minHeap.add(6)
    minHeap.add(7)
    minHeap.add(4)
    minHeap.add(6)
    minHeap.add(8)
    minHeap.add(2)
    minHeap.add(1)

    expect(minHeap.toString()).toBe('1,2,4,6,3,5,6,10,8,7')
    expect(minHeap.remove(8).toString()).toEqual('1,2,4,6,3,5,6,10,7')
    expect(minHeap.remove(7).toString()).toEqual('1,2,4,6,3,5,6,10')
    expect(minHeap.remove(1).toString()).toEqual('2,3,4,6,10,5,6')
    expect(minHeap.remove(2).toString()).toEqual('3,6,4,6,10,5')
    expect(minHeap.remove(6).toString()).toEqual('3,5,4,10')
    expect(minHeap.remove(10).toString()).toEqual('3,5,4')
    expect(minHeap.remove(5).toString()).toEqual('3,4')
    expect(minHeap.remove(3).toString()).toEqual('4')
    expect(minHeap.remove(4).toString()).toEqual('')
  })

  it('должен удалить элементы из кучи, найденные с помощью кастомной функции сравнения', () => {
    const minHeap = new MinHeap()
    minHeap.add('dddd')
    minHeap.add('ccc')
    minHeap.add('bb')
    minHeap.add('a')

    expect(minHeap.toString()).toBe('a,bb,ccc,dddd')

    const comparator = new Comparator((a, b) => {
      if (a.length === b.length) {
        return 0
      }

      return a.length < b.length ? -1 : 1
    })

    minHeap.remove('hey', comparator)
    expect(minHeap.toString()).toBe('a,bb,dddd')
  })

  it('должен удалить элементы из кучи с правильной реструктуризацией дерева', () => {
    const minHeap = new MinHeap()

    minHeap.add(1)
    minHeap.add(2)
    minHeap.add(3)
    minHeap.add(4)
    minHeap.add(5)
    minHeap.add(6)
    minHeap.add(7)
    minHeap.add(8)
    minHeap.add(9)

    expect(minHeap.toString()).toBe('1,2,3,4,5,6,7,8,9')

    minHeap.remove(2)
    expect(minHeap.toString()).toBe('1,4,3,8,5,6,7,9')

    minHeap.remove(4)
    expect(minHeap.toString()).toBe('1,5,3,8,9,6,7')
  })
})
```

</details>

<details>
<summary>Тесты для max-кучи</summary>

```javascript
// data-structures/heap/__tests__/max-heap.test.js
import MaxHeap from '../max-heap'
import Comparator from '../../../utils/comparator'

describe('MaxHeap', () => {
  it('должен создать пустую max-кучу', () => {
    const maxHeap = new MaxHeap()

    expect(maxHeap).toBeDefined()
    expect(maxHeap.peek()).toBeNull()
    expect(maxHeap.isEmpty()).toBe(true)
  })

  it('должен добавить элементы в кучу и просеять ее вверх', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(5)
    expect(maxHeap.isEmpty()).toBe(false)
    expect(maxHeap.peek()).toBe(5)
    expect(maxHeap.toString()).toBe('5')

    maxHeap.add(3)
    expect(maxHeap.peek()).toBe(5)
    expect(maxHeap.toString()).toBe('5,3')

    maxHeap.add(10)
    expect(maxHeap.peek()).toBe(10)
    expect(maxHeap.toString()).toBe('10,3,5')

    maxHeap.add(1)
    expect(maxHeap.peek()).toBe(10)
    expect(maxHeap.toString()).toBe('10,3,5,1')

    maxHeap.add(1)
    expect(maxHeap.peek()).toBe(10)
    expect(maxHeap.toString()).toBe('10,3,5,1,1')

    expect(maxHeap.poll()).toBe(10)
    expect(maxHeap.toString()).toBe('5,3,1,1')

    expect(maxHeap.poll()).toBe(5)
    expect(maxHeap.toString()).toBe('3,1,1')

    expect(maxHeap.poll()).toBe(3)
    expect(maxHeap.toString()).toBe('1,1')
  })

  it('должен извлечь элементы из кучи и просеять ее вниз', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(5)
    maxHeap.add(3)
    maxHeap.add(10)
    maxHeap.add(11)
    maxHeap.add(1)

    expect(maxHeap.toString()).toBe('11,10,5,3,1')

    expect(maxHeap.poll()).toBe(11)
    expect(maxHeap.toString()).toBe('10,3,5,1')

    expect(maxHeap.poll()).toBe(10)
    expect(maxHeap.toString()).toBe('5,3,1')

    expect(maxHeap.poll()).toBe(5)
    expect(maxHeap.toString()).toBe('3,1')

    expect(maxHeap.poll()).toBe(3)
    expect(maxHeap.toString()).toBe('1')

    expect(maxHeap.poll()).toBe(1)
    expect(maxHeap.toString()).toBe('')

    expect(maxHeap.poll()).toBeNull()
    expect(maxHeap.toString()).toBe('')
  })

  it('должен просеять кучу вниз по правильной ветке', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(3)
    maxHeap.add(12)
    maxHeap.add(10)

    expect(maxHeap.toString()).toBe('12,3,10')

    maxHeap.add(11)
    expect(maxHeap.toString()).toBe('12,11,10,3')

    expect(maxHeap.poll()).toBe(12)
    expect(maxHeap.toString()).toBe('11,3,10')
  })

  it('должен находить индексы элементов', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(3)
    maxHeap.add(12)
    maxHeap.add(10)
    maxHeap.add(11)
    maxHeap.add(11)

    expect(maxHeap.toString()).toBe('12,11,10,3,11')

    expect(maxHeap.find(5)).toEqual([])
    expect(maxHeap.find(12)).toEqual([0])
    expect(maxHeap.find(11)).toEqual([1, 4])
  })

  it('должен удалять элементы из кучи с ее просеиванием вниз', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(3)
    maxHeap.add(12)
    maxHeap.add(10)
    maxHeap.add(11)
    maxHeap.add(11)

    expect(maxHeap.toString()).toBe('12,11,10,3,11')

    expect(maxHeap.remove(12).toString()).toEqual('11,11,10,3')
    expect(maxHeap.remove(12).peek()).toEqual(11)
    expect(maxHeap.remove(11).toString()).toEqual('10,3')
    expect(maxHeap.remove(10).peek()).toEqual(3)
  })

  it('должен удалять элементы из кучи с ее просеиванием вверх', () => {
    const maxHeap = new MaxHeap()

    maxHeap.add(3)
    maxHeap.add(10)
    maxHeap.add(5)
    maxHeap.add(6)
    maxHeap.add(7)
    maxHeap.add(4)
    maxHeap.add(6)
    maxHeap.add(8)
    maxHeap.add(2)
    maxHeap.add(1)

    expect(maxHeap.toString()).toBe('10,8,6,7,6,4,5,3,2,1')
    expect(maxHeap.remove(4).toString()).toEqual('10,8,6,7,6,1,5,3,2')
    expect(maxHeap.remove(3).toString()).toEqual('10,8,6,7,6,1,5,2')
    expect(maxHeap.remove(5).toString()).toEqual('10,8,6,7,6,1,2')
    expect(maxHeap.remove(10).toString()).toEqual('8,7,6,2,6,1')
    expect(maxHeap.remove(6).toString()).toEqual('8,7,1,2')
    expect(maxHeap.remove(2).toString()).toEqual('8,7,1')
    expect(maxHeap.remove(1).toString()).toEqual('8,7')
    expect(maxHeap.remove(7).toString()).toEqual('8')
    expect(maxHeap.remove(8).toString()).toEqual('')
  })

  it('должен удалить элементы из кучи, найденные с помощью кастомной функции сравнения', () => {
    const maxHeap = new MaxHeap()
    maxHeap.add('a')
    maxHeap.add('bb')
    maxHeap.add('ccc')
    maxHeap.add('dddd')

    expect(maxHeap.toString()).toBe('dddd,ccc,bb,a')

    const comparator = new Comparator((a, b) => {
      if (a.length === b.length) {
        return 0
      }

      return a.length < b.length ? -1 : 1
    })

    maxHeap.remove('hey', comparator)
    expect(maxHeap.toString()).toBe('dddd,a,bb')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/heap
```

<img src="https://habrastorage.org/webt/ci/7e/d4/ci7ed4irdsdl-chkftaeksjtifa.png" />
