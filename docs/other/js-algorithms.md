---
sidebar_position: 6
---

# JavaScript Algorithms & Data Structures

> Данный раздел находится в разработке

## Структуры данных

### Очередь (queue)

```js
class Queue {
  constructor() {
    this.data = []
  }

  enqueue(record) {
    this.data.unshift(record)
  }

  dequeue() {
    return this.data.pop()
  }

  peek() {
    return this.data[this.data.length - 1]
  }
}

const weave = (q1, q2) => {
  const queueCombined = new Queue()

  while (q1.peek() || q2.peek()) {
    if (q1.peek()) queueCombined.enqueue(q1.dequeue())
    if (q2.peek()) queueCombined.enqueue(q2.dequeue())
  }

  return queueCombined
}

// пример использования
const one = new Queue()
one.enqueue(1)
one.enqueue(2)
one.enqueue(3)

const two = new Queue()
two.enqueue('one')
two.enqueue('two')
two.enqueue('three')

const res = weave(one, two)
console.log(
  res.dequeue(), // 1
  res.dequeue(), // "one"
  res.dequeue(), // 2
  res.dequeue(), // "two"
  res.dequeue(), // 3
  res.dequeue(), // "three"
  res.dequeue() // undefined
)
```

### Стек (stack)

```js
class Stack {
  constructor() {
    this.data = []
  }

  push(record) {
    this.data.push(record)
  }

  pop() {
    return this.data.pop()
  }

  peek() {
    return this.data[this.data.length - 1]
  }
}

// очередь с использованием стека
class Queue {
  constructor() {
    this.first = new Stack()
    this.second = new Stack()
  }

  enqueue(record) {
    this.first.push(record)
  }

  dequeue() {
    while (this.first.peek()) {
      this.second.push(this.first.pop())
    }

    const record = this.second.pop()

    while (this.second.peek()) {
      this.first.push(this.second.pop())
    }

    return record
  }

  peek() {
    while (this.first.peek()) {
      this.second.push(this.first.pop())
    }

    const record = this.second.peek()

    while (this.second.peek()) {
      this.first.push(this.second.pop())
    }

    return record
  }
}

// пример использования
const queue = new Queue()
queue.enqueue(1)
queue.enqueue(2)
queue.enqueue(3)
console.log(
  queue.peek(), // 1
  queue.dequeue(), // 1
  queue.dequeue(), // 2
  queue.dequeue(), // 3
  queue.dequeue() // undefined
)
```

### Связный список (linked list)

```js
class Node {
  constructor(data, next = null) {
    this.data = data
    this.next = next
  }
}

class LinkedList {
  constructor() {
    this.head = null
  }

  insertHead(data) {
    this.head = new Node(data, this.head)
  }

  size() {
    let counter = 0
    let node = this.head

    while (node) {
      counter++
      node = node.next
    }

    return counter
  }

  getHead() {
    return this.head
  }

  getTail() {
    if (!this.head) return null

    let node = this.head

    while (node) {
      if (!node.next) return node
      node = node.next
    }
  }

  clear() {
    this.head = null
  }

  removeHead() {
    if (!this.head) return
    this.head = this.head.next
  }

  removeTail() {
    if (!this.head) return

    if (!this.head.next) {
      this.head = null
      return
    }

    let prev = this.head
    let node = this.head.next

    while (node.next) {
      prev = node
      node = node.next
    }

    prev.next = null
  }

  insertTail(data) {
    const last = this.getTail()

    if (last) last.next = new Node(data)
    else this.head = new Node(data)
  }

  getAt(index) {
    let counter = 0
    let node = this.head

    while (node) {
      if (counter === index) return node
      counter++
      node = node.next
    }
    return null
  }

  removeAt(index) {
    if (!this.head) return

    if (index === 0) {
      this.head = this.head.next
      return
    }

    const prev = this.getAt(index - 1)

    if (!prev || !prev.next) return

    prev.next = prev.next.next
  }

  insertAt(index, data) {
    if (!this.head) {
      this.head = new Node(data)
      return
    }

    const prev = this.getAt(index - 1) || this.getTail()

    const node = new Node(data, prev.next)

    prev.next = node
  }

  forEach(fn) {
    let node = this.head
    let index = 0

    while (node) {
      fn(node, index)
      node = node.next
      index++
    }
  }

  *[Symbol.iterator]() {
    let node = this.head

    while (node) {
      yield node
      node = node.next
    }
  }
}

// пример использования
const chain = new LinkedList()

chain.insertHead(1)
console.log(
  chain.head.data, // 1
  chain.size(), // 1
  chain.getHead().data // 1
)

chain.insertHead(2)
console.log(chain.getTail().data) // 1

chain.clear()
console.log(chain.size()) // 0

chain.insertHead(1)
chain.insertHead(2)
chain.removeHead()
console.log(chain.size()) // 1

chain.removeTail()
console.log(chain.size()) // 0

chain.insertTail(1)
console.log(chain.getTail().data) // 1

chain.insertHead(2)
console.log(chain.getAt(0).data) // 2

chain.removeAt(0)
console.log(chain.size()) // 1

chain.insertAt(0, 2)
console.log(chain.getAt(1).data) // 2

chain.forEach((node, index) => (node.data = node.data + index))
console.log(chain.getTail().data) // 3

for (const node of chain) node.data = node.data + 1
console.log(chain.getHead().data) // 2

// поиск центрального элемента
function middle(list) {
  let one = list.head
  let two = list.head

  while (two.next && two.next.next) {
    one = one.next
    two = two.next.next
  }

  return one
}

chain.clear()
chain.insertHead(1)
chain.insertHead(2)
chain.insertHead(3)
console.log(middle(chain).data) // 2

// создание циклического списка
function circular(list) {
  let one = list.head
  let two = list.head

  while (two.next && two.next.next) {
    one = one.next
    two = two.next.next

    if (two === one) return true
  }

  return false
}

chain.head.next.next.next = chain.head
console.log(circular(chain)) // true
```

### Дерево (tree)

```js
class Node {
  constructor(data) {
    this.data = data
    this.children = []
  }

  add(data) {
    this.children.push(new Node(data))
  }

  remove(data) {
    this.children = this.children.filter(node => node.data !== data)
  }
}

class Tree {
  constructor() {
    this.root = null
  }

  traverseBF(fn) {
    const queue = [this.root]

    while (queue.length) {
      const node = queue.shift()
      queue.push(...node.children)
      fn(node)
    }
  }

  traverseDF(fn) {
    const stack = [this.root]

    while (stack.length) {
      const node = stack.shift()
      stack.unshift(...node.children)
      fn(node)
    }
  }
}

// пример использования
const root = new Node(1)
root.add(2)
console.log(
  root.data, // 1
  root.children[0].data // 2
)
root.remove(2)
console.log(root.children.length) // 0

const tree = new Tree()
tree.root = new Node(1)
tree.root.add(2)
tree.root.add(3)
tree.root.children[0].add(4)

const numbers = []
tree.traverseBF(node => numbers.push(node.data))
console.log(numbers) // [1, 2, 3, 4]

numbers.length = 0
tree.traverseDF(node => numbers.push(node.data))
console.log(numbers) // [1, 2, 4, 3]

// определение ширины дерева
function treeWidths(root) {
  const queue = [root, 'reset']
  const counters = [0]

  while (queue.length > 1) {
    const node = queue.shift()

    if (node === 'reset') {
      counters.push(0)
      queue.push('reset')
    } else {
      queue.push(...node.children)
      counters[counters.length - 1]++
    }
  }

  return counters
}

const _root = new Node(1)
_root.add(2)
_root.add(3)
_root.children[1].add(4)
console.log(treeWidths(_root)) // [1, 2, 1]

// определение высоты дерева
function treeHeight(root) {
  const queue = [root, "reset"]
  let counter = 0

  while (queue.length > 1) {
    const node = queue.shift()

    if (node === "reset") {
      counter++
      queue.push("reset")
    } else {
      queue.push(...node.children)
    }
  }

  return counter
}

console.log(treeHeight(_root)) // 2
```

## Алгоритмы

### Сортировка

#### Пузырьковая

```js
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const less = arr[j + 1]
        arr[j + 1] = arr[j]
        arr[j] = less
      }
    }
  }

  return arr
}

const arr = [5, 3, 2, 4, 1]
console.log(bubbleSort(arr)) // [1, 2, 3, 4, 5]
```

#### Вставкой

```js
const insertionSort = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[i] < arr[j]) arr.splice(j, 0, arr.splice(i, 1)[0])
    }
  }
  return arr
}

console.log(insertionSort(arr))
```

#### Выборкой

```js
// 1
function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIndex = i

    for (let j = i + 1; j < arr.length; j++)
      if (arr[j] < arr[minIndex]) minIndex = j

    if (minIndex !== i) {
      const less = arr[minIndex]
      arr[minIndex] = arr[i]
      arr[i] = less
    }
  }

  return arr
}

console.log(selectionSort(arr))

// 2
function _selectionSort(arr) {
  let newArr = []

  while (arr.length !== 0) {
    const smallest = arr[0]

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < smallest) {
        smallest = arr[i]
      }
    }

    newArr.push(...arr.splice(arr.indexOf(smallest), 1))
  }
  return newArr
}

console.log(_selectionSort(arr))
```

#### Быстрая

```js
const quickSort = (arr) => {
  if (arr.length < 2) return arr

  let n = arr[~~((arr.length - 1) / 2)]

  let less = []
  let great = []

  for (const i of arr) {
    if (i < n) {
      less.push(i)
    } else if (i > n) {
      great.push(i)
    }
  }

  less = quickSort(less)
  great = quickSort(great)

  return [...less, n, ...great]
}

console.log(quickSort(arr))
```

#### Слиянием

```js
function mergeSort(arr) {
  if (arr.length === 1) return arr

  const center = ~~(arr.length / 2)
  const left = arr.slice(0, center)
  const right = arr.slice(center)

  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  const res = []

  while (left.length && right.length) {
    if (left[0] < right[0]) res.push(left.shift())
    else res.push(right.shift())
  }

  return [...res, ...left, ...right]
}

console.log(mergeSort(arr))
```

#### Подсчетом

```js
const countingSort = (arr, max) => {
  const counts = new Array(max + 1)
  counts.fill(0)
  arr.forEach((v) => counts[v]++)

  const res = []
  let index = 0

  counts.forEach((c, i) => {
    for (let j = 0; j < c; j++) {
      res[index] = i
      index++
    }
  })

  return res
}

console.log(countingSort(arr, 5))
```

### Поиск (search)

#### Бинарный (двоичный) (binary)

```js
function binarySearch(list, item) {
  let min = 0
  let max = list.length - 1
  let steps = 1

  while (min <= max) {
    let mid = Math.floor((min + max) / 2)

    if (list[mid] === item) {
      return `Position: ${mid}, steps: ${steps}`
    } else if (list[mid] > item) {
      max = mid - 1
    } else {
      min = mid + 1
    }
    steps++
  }
  return 'Not found'
}
```

#### Бинарное (двоичное) дерево поиска (binary search tree)

```js
class Node {
  constructor(data) {
    this.data = data
    this.left = null
    this.right = null
  }

  insert(data) {
    if (data < this.data && this.left)
      this.left.insert(data)
    else if (data < this.data)
      this.left = new Node(data)
    else if (data > this.data && this.right)
      this.right.insert(data)
    else if (data > this.data)
      this.right = new Node(data)
  }

  search(data) {
    if (this.data === data) return this

    if (this.data < data && this.right)
      return this.right.search(data)
    else if (this.data > data && this.left)
      return this.left.search(data)

    return null
  }
}

// пример использования
const root = new Node(2)
root.insert(1)
root.insert(3)
root.insert(0)
console.log(root.left.left.data === 0) // true

console.log(root.search(3).data) // 4
console.log(root.search(4)) // null
```
