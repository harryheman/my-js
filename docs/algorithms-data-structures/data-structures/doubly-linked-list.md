---
sidebar_position: 2
title: Двусвязный список
description: Двусвязный список
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Двусвязный список

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%B2%D1%8F%D0%B7%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA#%D0%94%D0%B2%D1%83%D1%81%D0%B2%D1%8F%D0%B7%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_(%D0%B4%D0%B2%D1%83%D0%BD%D0%B0%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9_%D1%81%D0%B2%D1%8F%D0%B7%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA))
- [YouTube](https://www.youtube.com/watch?v=lQ-lPjbb9Ew)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/doubly-linked-list.js)

Двусвязный (двунаправленный) список (doubly linked list) похож на односвязный (см. предыдущий раздел), но узлы такого списка, помимо ссылок на следующие узлы, содержат также ссылки на предыдущие узлы, что, собственно, и делает список двусвязным.

<img src="https://habrastorage.org/webt/ci/rn/ow/cirnowhms_b5r1howkvgkw6kjte.png" />
<br />

Две ссылки позволяют обходить (traverse) список в обоих направлениях. Несмотря на то, что добавление и удаление узлов в двусвязном списке требует изменения бОльшего количества ссылок, сами эти операции проще и потенциально более эффективны (для некорневых узлов), поскольку при обходе списка нам не нужно следить за предыдущим узлом или повторно обходить список в поиске предыдущего узла.

__Сложность__

_Временная_

| Чтение | Поиск | Вставка | Удаление |
|--------|-------|---------|----------|
| O(n)   | O(n)  | O(1)    | O(n)     |

_Пространственная_

O(n)

__Реализация__

Начнем с узла:

```javascript
// data-structures/doubly-linked-list.js
// Узел
export class Node {
  constructor(value, next = null, prev = null) {
    // Значение
    this.value = value
    // Ссылка на следующий узел
    this.next = next
    // Ссылка на предыдущий узел
    this.prev = prev
  }

  // Возвращает строковое представление узла.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return cb ? cb(this.value) : `${this.value}`
  }
}
```

Приступаем к реализации двусвязного списка:

```javascript
// Двусвязный список
export default class DoublyLinkedList {
  constructor(fn) {
    // Головной (первый) узел
    this.head = null
    // Хвостовой (последний) узел
    this.tail = null
    // Функция сравнения узлов
    this.compare = new Comparator(fn)
  }
}
```

Начнем с методов добавления узла в начало и конец списка:

```javascript
// Добавляет значение в начало списка
prepend(value) {
  // Создаем новый узел
  const node = new Node(value, this.head)

  // Если головной узел имеется,
  if (this.head) {
    // обновляем его ссылку на предыдущий узел
    this.head.prev = node
  }

  // Обновляем головной узел (заменяем на новый)
  this.head = node

  // Если хвостовой узел отсутствует, значит,
  if (!this.tail) {
    // головной узел также является хвостовым
    // (список был пустым)
    this.tail = node
  }

  // Это обеспечивает возможность вызова методов по цепочке
  return this
}

// Добавляет значение в конец списка
append(value) {
  // Если головной узел отсутствует,
  if (!this.head) {
    // добавляем значение в начало списка
    return this.prepend(value)
  }

  // Создаем новый узел
  const node = new Node(value)

  // Добавляем ссылку на следующий (новый) узел в хвостовой
  this.tail.next = node
  // Добавляем ссылку на предыдущий (хвостовой) узел в новый
  node.prev = this.tail
  // Обновляем хвостовой узел
  this.tail = node

  return this
}
```

Методы удаления головного (первого) и хвостового (последнего) узлов:

```javascript
// Удаляет головной узел
removeHead() {
  // Если головной узел отсутствует, значит,
  if (!this.head) {
    // список пуст - удалять нечего
    return null
  }

  // Удаляемый узел - головной
  const removed = this.head

  // Если головной узел содержит ссылку на следующий
  if (this.head.next) {
    // Обновляем головной узел (заменяем на следующий)
    this.head = this.head.next
    // Обнуляем ссылку головного узла на предыдущий
    this.head.prev = null
  } else {
    // Иначе, обнуляем головной и хвостовой узлы
    // (делаем список пустым, поскольку он содержал только один узел)
    this.head = null
    this.tail = null
  }

  // Возвращаем удаленный узел
  return removed
}

// Удаляет хвостовой узел
removeTail() {
  // Если хвостовой узел отсутствует, значит,
  if (!this.tail) {
    // список пуст -удалять нечего
    return null
  }

  // Удаляемый узел - хвостовой
  const removed = this.tail

  // Крайний случай: если список состоит из одного узла
  if (this.head === this.tail) {
    // Обнуляем головной и хвостовой узлы
    // (делаем список пустым)
    this.head = null
    this.tail = null
    // Возвращаем удаленный узел
    return removed
  }

  // Обновляем хвостовой узел (заменяем на предыдущий)
  this.tail = this.tail.prev
  // Обнуляем ссылку хвостового узла на следующий
  this.tail.next = null

  // Возвращаем удаленный узел
  return removed
}
```

Метод удаления узла по значению:

```javascript
// Удаляет узел по значению
remove(value) {
  // Если головной узел отсутствует, значит,
  if (!this.head) {
    // список пуст - удалять нечего
    return null
  }

  // Удаляемый узел
  let removed = null
  // Текущий узел (начинаем с головного)
  let current = this.head

  // Пока есть текущий узел
  while (current) {
    // Если значения совпадают
    if (this.compare.equal(current.value, value)) {
      // Обновляем удаляемый узел
      removed = current

      // Если удаляется головной узел,
      if (removed === this.head) {
        // обновляем головной узел
        this.head = removed.next

        // Если новый головной узел имеется,
        if (this.head) {
          // обнуляем его ссылку на предыдущий узел
          this.head.prev = null
        }

        // Если также удаляется хвостовой узел
        // (список содержит только один узел),
        if (removed === this.tail) {
          // обнуляем хвостовой узел
          // (делаем список пустым)
          this.tail = null
        }
        // Иначе, если удаляется хвостовой узел,
      } else if (removed === this.tail) {
        // обновляем хвостовой узел
        this.tail = removed.prev
        // Обнуляем ссылку хвостового узла на следующий
        this.tail.next = null
      } else {
        // Предыдущий узел
        const prev = removed.prev
        // Следующий узел
        const next = removed.next

        // Обновляем ссылку предыдущего узла на следующий
        prev.next = next
        // Обновляем ссылку следующего узла на предыдущий
        // (закрываем образовавшуюся брешь)
        next.prev = prev
      }
    }

    // Переходим к следующему узлу
    current = current.next
  }

  // Возвращаем удаленный узел
  return removed
}
```

Метод поиска узла по значению:

```javascript
// Ищет узел по значению.
// Принимает искомое значение и функцию поиска
// в виде объекта
find({ value, cb }) {
  // Если головной узел отсутствует, значит,
  if (!this.head) {
    // список пуст - искать нечего
    return null
  }

  // Текущий узел (начинаем с головного)
  let current = this.head

  // Пока есть текущий узел
  while (current) {
    // Если передана функция, и она удовлетворяется,
    if (cb && cb(current.value)) {
      // возвращаем текущий узел
      return current
    }

    // Если передано значение, и значения совпадают,
    if (value && this.compare.equal(current.value, value)) {
      // возвращаем текущий узел
      return current
    }

    // Переходим к следующему узлу
    current = current.next
  }

  // Ничего не найдено
  return null
}
```

Метод инвертирования списка:

```javascript
// Инвертирует список
reverse() {
  // Текущий узел (начинаем с головного)
  let current = this.head
  // Предыдущий узел
  let prev = null
  // Следующий узел
  let next = null

  // Пока есть текущий узел
  while (current) {
    // Обновляем переменную для следующего узла
    next = current.next
    // Обновляем переменную для предыдущего узла
    prev = current.prev

    // Обновляем ссылки текущего узла
    current.next = prev
    current.prev = next

    // Обновляем переменную для предыдущего узла
    prev = current
    // Переходим к следующему узлу
    current = next
  }

  // Меняем местами головной и хвостовой узлы
  this.tail = this.head
  // Обновляем головной узел
  // (заменяем последним предыдущим - хвостовым)
  this.head = prev

  return this
}
```

Напоследок реализуем несколько вспомогательных методов:

```javascript
// Создает список из массива
fromArray(arr) {
  // Перебираем элементы массива и добавляем каждый в конец списка
  arr.forEach((value) => this.append(value))

  return this
}

// Преобразует список в массив
toArray() {
  // Массив узлов
  const arr = []
  // Текущий узел (начинаем с головного)
  let current = this.head
  // Пока есть текущий узел
  while (current) {
    // Добавляем узел в массив
    arr.push(current)
    // Переходим к следующему узлу
    current = current.next
  }
  // Возвращаем массив
  return arr
}

// Возвращает строковое представление списка.
// Принимает кастомную функцию стрингификации
toString(cb) {
  // Преобразуем список в массив
  return (
    this.toArray()
      // Перебираем узлы и преобразуем каждый в строку
      .map((node) => node.toString(cb))
      // Преобразуем массив в строку
      .toString()
  )
}
```

<details>
<summary>Полный код двусвязного списка</summary>

```javascript
import Comparator from '../utils/comparator'

// Узел
export class Node {
  constructor(value, next = null, prev = null) {
    // Значение
    this.value = value
    // Ссылка на следующий узел
    this.next = next
    // Ссылка на предыдущий узел
    this.prev = prev
  }

  // Возвращает строковое представление узла.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return cb ? cb(this.value) : `${this.value}`
  }
}

// Двусвязный список
export default class DoublyLinkedList {
  constructor(fn) {
    // Головной (первый) узел
    this.head = null
    // Хвостовой (последний) узел
    this.tail = null
    // Функция сравнения узлов
    this.compare = new Comparator(fn)
  }

  // Добавляет значение в начало списка
  prepend(value) {
    // Создаем новый узел
    const node = new Node(value, this.head)

    // Если головной узел имеется,
    if (this.head) {
      // обновляем его ссылку на предыдущий узел
      this.head.prev = node
    }

    // Обновляем головной узел (заменяем на новый)
    this.head = node

    // Если хвостовой узел отсутствует, значит,
    if (!this.tail) {
      // головной узел также является хвостовым
      // (список был пустым)
      this.tail = node
    }

    // Это обеспечивает возможность вызова методов по цепочке
    return this
  }

  // Добавляет значение в конец списка
  append(value) {
    // Если головной узел отсутствует,
    if (!this.head) {
      // добавляем значение в начало списка
      return this.prepend(value)
    }

    // Создаем новый узел
    const node = new Node(value)

    // Добавляем ссылку на следующий (новый) узел в хвостовой
    this.tail.next = node
    // Добавляем ссылку на предыдущий (хвостовой) узел в новый
    node.prev = this.tail
    // Обновляем хвостовой узел
    this.tail = node

    return this
  }

  // Удаляет головной узел
  removeHead() {
    // Если головной узел отсутствует, значит,
    if (!this.head) {
      // список пуст - удалять нечего
      return null
    }

    // Удаляемый узел - головной
    const removed = this.head

    // Если головной узел содержит ссылку на следующий
    if (this.head.next) {
      // Обновляем головной узел
      this.head = this.head.next
      // Обнуляем ссылку головного узла на предыдущий
      this.head.prev = null
    } else {
      // Иначе, обнуляем головной и хвостовой узлы
      // (делаем список пустым, поскольку он содержал только один узел)
      this.head = null
      this.tail = null
    }

    // Возвращаем удаленный узел
    return removed
  }

  // Удаляет хвостовой узел
  removeTail() {
    // Если хвостовой узел отсутствует, значит,
    if (!this.tail) {
      // список пуст -удалять нечего
      return null
    }

    // Удаляемый узел - хвостовой
    const removed = this.tail

    // Крайний случай: если список состоит из одного узла
    if (this.head === this.tail) {
      // Обнуляем головной и хвостовой узлы
      // (делаем список пустым)
      this.head = null
      this.tail = null
      // Возвращаем удаленный узел
      return removed
    }

    // Обновляем хвостовой узел (заменяем на предыдущий)
    this.tail = this.tail.prev
    // Обнуляем ссылку хвостового узла на следующий
    this.tail.next = null

    // Возвращаем удаленный узел
    return removed
  }

  // Удаляет узел по значению
  remove(value) {
    // Если головной узел отсутствует, значит,
    if (!this.head) {
      // список пуст - удалять нечего
      return null
    }

    // Удаляемый узел
    let removed = null
    // Текущий узел (начинаем с головного)
    let current = this.head

    // Пока есть текущий узел
    while (current) {
      // Если значения совпадают
      if (this.compare.equal(current.value, value)) {
        // Обновляем удаляемый узел
        removed = current

        // Если удаляется головной узел,
        if (removed === this.head) {
          // обновляем головной узел
          this.head = removed.next

          // Если новый головной узел имеется,
          if (this.head) {
            // обнуляем его ссылку на предыдущий узел
            this.head.prev = null
          }

          // Если также удаляется хвостовой узел
          // (список содержит только один узел),
          if (removed === this.tail) {
            // обнуляем хвостовой узел
            // (делаем список пустым)
            this.tail = null
          }
          // Иначе, если удаляется хвостовой узел,
        } else if (removed === this.tail) {
          // обновляем хвостовой узел
          this.tail = removed.prev
          // Обнуляем ссылку хвостового узла на следующий
          this.tail.next = null
        } else {
          // Предыдущий узел
          const prev = removed.prev
          // Следующий узел
          const next = removed.next

          // Обновляем ссылку предыдущего узла на следующий
          prev.next = next
          // Обновляем ссылку следующего узла на предыдущий
          // (закрываем образовавшуюся брешь)
          next.prev = prev
        }
      }

      // Переходим к следующему узлу
      current = current.next
    }

    // Возвращаем удаленный узел
    return removed
  }

  // Ищет узел по значению.
  // Принимает искомое значение и функцию поиска
  // в виде объекта
  find({ value, cb }) {
    // Если головной узел отсутствует, значит,
    if (!this.head) {
      // список пуст - искать нечего
      return null
    }

    // Текущий узел (начинаем с головного)
    let current = this.head

    // Пока есть текущий узел
    while (current) {
      // Если передана функция, и она удовлетворяется,
      if (cb && cb(current.value)) {
        // возвращаем текущий узел
        return current
      }

      // Если передано значение, и значения совпадают,
      if (value && this.compare.equal(current.value, value)) {
        // возвращаем текущий узел
        return current
      }

      // Переходим к следующему узлу
      current = current.next
    }

    // Ничего не найдено
    return null
  }

  // Инвертирует список
  reverse() {
    // Текущий узел (начинаем с головного)
    let current = this.head
    // Предыдущий узел
    let prev = null
    // Следующий узел
    let next = null

    // Пока есть текущий узел
    while (current) {
      // Обновляем переменную для следующего узла
      next = current.next
      // Обновляем переменную для предыдущего узла
      prev = current.prev

      // Обновляем ссылки текущего узла
      current.next = prev
      current.prev = next

      // Обновляем переменную для предыдущего узла
      prev = current
      // Переходим к следующему узлу
      current = next
    }

    // Меняем местами головной и хвостовой узлы
    this.tail = this.head
    // Обновляем головной узел
    // (заменяем последним предыдущим - хвостовым)
    this.head = prev

    return this
  }

  // Создает список из массива
  fromArray(arr) {
    // Перебираем элементы массива и добавляем каждый в конец списка
    arr.forEach((value) => this.append(value))

    return this
  }

  // Преобразует список в массив
  toArray() {
    // Массив узлов
    const arr = []
    // Текущий узел (начинаем с головного)
    let current = this.head
    // Пока есть текущий узел
    while (current) {
      // Добавляем узел в массив
      arr.push(current)
      // Переходим к следующему узлу
      current = current.next
    }
    // Возвращаем массив
    return arr
  }

  // Возвращает строковое представление списка.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    // Преобразуем список в массив
    return (
      this.toArray()
        // Перебираем узлы и преобразуем каждый в строку
        .map((node) => node.toString(cb))
        // Преобразуем массив в строку
        .toString()
    )
  }
}
```

</details>

__Тестирование__

Проверим, что наш двусвязный список работает, как ожидается.

Начнем с узла:

```javascript
// data-structures/__tests__/doubly-linked-list.test.js
import DoublyLinkedList, { Node } from '../doubly-linked-list'

describe('DoublyLinkedListNode', () => {
  it('должен создать узел с указанным значением', () => {
    const node = new Node(1)

    expect(node.value).toBe(1)
    expect(node.next).toBeNull()
    expect(node.prev).toBeNull()
  })

  it('должен создать узел с объектом в качестве значения', () => {
    const nodeValue = { value: 1, key: 'test' }
    const node = new Node(nodeValue)

    expect(node.value.value).toBe(1)
    expect(node.value.key).toBe('test')
    expect(node.next).toBeNull()
    expect(node.prev).toBeNull()
  })

  it('должен соединить узлы вместе', () => {
    const node2 = new Node(2)
    const node1 = new Node(1, node2)
    const node3 = new Node(10, node1, node2)

    expect(node1.next).toBeDefined()
    expect(node1.prev).toBeNull()
    expect(node2.next).toBeNull()
    expect(node2.prev).toBeNull()
    expect(node3.next).toBeDefined()
    expect(node3.prev).toBeDefined()
    expect(node1.value).toBe(1)
    expect(node1.next.value).toBe(2)
    expect(node3.next.value).toBe(1)
    expect(node3.prev.value).toBe(2)
  })

  it('должен преобразовать узел в строку', () => {
    const node = new Node(1)

    expect(node.toString()).toBe('1')

    node.value = 'string value'
    expect(node.toString()).toBe('string value')
  })

  it('должен преобразовать узел в строку с помощью кастомной функции', () => {
    const nodeValue = { value: 1, key: 'test' }
    const node = new Node(nodeValue)
    const toStringCallback = (value) =>
      `value: ${value.value}, key: ${value.key}`

    expect(node.toString(toStringCallback)).toBe('value: 1, key: test')
  })
})
```

<details>
<summary>Теперь сам список</summary>

```javascript
describe('DoublyLinkedList', () => {
  it('должен создать пустой двусвязный список', () => {
    const linkedList = new DoublyLinkedList()
    expect(linkedList.toString()).toBe('')
  })

  it('должен добавить узлы в конец списка', () => {
    const linkedList = new DoublyLinkedList()

    expect(linkedList.head).toBeNull()
    expect(linkedList.tail).toBeNull()

    linkedList.append(1)
    linkedList.append(2)

    expect(linkedList.head.next.value).toBe(2)
    expect(linkedList.tail.prev.value).toBe(1)
    expect(linkedList.toString()).toBe('1,2')
  })

  it('должен добавить узлы в начало списка', () => {
    const linkedList = new DoublyLinkedList()

    linkedList.prepend(2)
    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('2')

    linkedList.append(1)
    linkedList.prepend(3)

    expect(linkedList.head.next.next.prev).toBe(linkedList.head.next)
    expect(linkedList.tail.prev.next).toBe(linkedList.tail)
    expect(linkedList.tail.prev.value).toBe(2)
    expect(linkedList.toString()).toBe('3,2,1')
  })

  it('должен создать список из массива', () => {
    const linkedList = new DoublyLinkedList()
    linkedList.fromArray([1, 1, 2, 3, 3, 3, 4, 5])

    expect(linkedList.toString()).toBe('1,1,2,3,3,3,4,5')
  })

  it('должен удалить узлы по значениям', () => {
    const linkedList = new DoublyLinkedList()

    expect(linkedList.remove(5)).toBeNull()

    linkedList.append(1)
    linkedList.append(1)
    linkedList.append(2)
    linkedList.append(3)
    linkedList.append(3)
    linkedList.append(3)
    linkedList.append(4)
    linkedList.append(5)

    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('5')

    const removedNode = linkedList.remove(3)
    expect(removedNode.value).toBe(3)
    expect(linkedList.tail.prev.prev.value).toBe(2)
    expect(linkedList.toString()).toBe('1,1,2,4,5')

    linkedList.remove(3)
    expect(linkedList.toString()).toBe('1,1,2,4,5')

    linkedList.remove(1)
    expect(linkedList.toString()).toBe('2,4,5')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.head.next.next).toBe(linkedList.tail)
    expect(linkedList.tail.prev.prev).toBe(linkedList.head)
    expect(linkedList.tail.toString()).toBe('5')

    linkedList.remove(5)
    expect(linkedList.toString()).toBe('2,4')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('4')

    linkedList.remove(4)
    expect(linkedList.toString()).toBe('2')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('2')
    expect(linkedList.head).toBe(linkedList.tail)

    linkedList.remove(2)
    expect(linkedList.toString()).toBe('')
  })

  it('должен удалить хвостовые узлы', () => {
    const linkedList = new DoublyLinkedList()

    expect(linkedList.removeTail()).toBeNull()

    linkedList.append(1)
    linkedList.append(2)
    linkedList.append(3)

    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('3')

    const removedNode1 = linkedList.removeTail()

    expect(removedNode1.value).toBe(3)
    expect(linkedList.toString()).toBe('1,2')
    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('2')

    const removedNode2 = linkedList.removeTail()

    expect(removedNode2.value).toBe(2)
    expect(linkedList.toString()).toBe('1')
    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('1')

    const removedNode3 = linkedList.removeTail()

    expect(removedNode3.value).toBe(1)
    expect(linkedList.toString()).toBe('')
    expect(linkedList.head).toBeNull()
    expect(linkedList.tail).toBeNull()
  })

  it('должен удалить головные узлы', () => {
    const linkedList = new DoublyLinkedList()

    expect(linkedList.removeHead()).toBeNull()

    linkedList.append(1)
    linkedList.append(2)

    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('2')

    const removedNode1 = linkedList.removeHead()

    expect(removedNode1.value).toBe(1)
    expect(linkedList.head.prev).toBeNull()
    expect(linkedList.toString()).toBe('2')
    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('2')

    const removedNode2 = linkedList.removeHead()

    expect(removedNode2.value).toBe(2)
    expect(linkedList.toString()).toBe('')
    expect(linkedList.head).toBeNull()
    expect(linkedList.tail).toBeNull()
  })

  it('должен добавить в список значения в виде объектов', () => {
    const linkedList = new DoublyLinkedList()

    const nodeValue1 = { value: 1, key: 'key1' }
    const nodeValue2 = { value: 2, key: 'key2' }

    linkedList.append(nodeValue1).prepend(nodeValue2)

    const nodeStringifier = (value) => `${value.key}:${value.value}`

    expect(linkedList.toString(nodeStringifier)).toBe('key2:2,key1:1')
  })

  it('должен найти узлы по значениям', () => {
    const linkedList = new DoublyLinkedList()

    expect(linkedList.find({ value: 5 })).toBeNull()

    linkedList.append(1)
    expect(linkedList.find({ value: 1 })).toBeDefined()

    linkedList.append(2).append(3)

    const node = linkedList.find({ value: 2 })

    expect(node.value).toBe(2)
    expect(linkedList.find({ value: 5 })).toBeNull()
  })

  it('должен найти узлы с помощью кастомной функции', () => {
    const linkedList = new DoublyLinkedList()

    linkedList
      .append({ value: 1, key: 'test1' })
      .append({ value: 2, key: 'test2' })
      .append({ value: 3, key: 'test3' })

    const node = linkedList.find({ cb: (value) => value.key === 'test2' })

    expect(node).toBeDefined()
    expect(node.value.value).toBe(2)
    expect(node.value.key).toBe('test2')
    expect(linkedList.find({ cb: (value) => value.key === 'test5' })).toBeNull()
  })

  it('должен найти узлы с помощью кастомной функции сравнения', () => {
    const comparatorFunction = (a, b) => {
      if (a.customValue === b.customValue) {
        return 0
      }

      return a.customValue < b.customValue ? -1 : 1
    }

    const linkedList = new DoublyLinkedList(comparatorFunction)

    linkedList
      .append({ value: 1, customValue: 'test1' })
      .append({ value: 2, customValue: 'test2' })
      .append({ value: 3, customValue: 'test3' })

    const node = linkedList.find({
      value: { value: 2, customValue: 'test2' },
    })

    expect(node).toBeDefined()
    expect(node.value.value).toBe(2)
    expect(node.value.customValue).toBe('test2')
    expect(linkedList.find({ value: 2, customValue: 'test5' })).toBeNull()
  })

  it('должен инвертировать список', () => {
    const linkedList = new DoublyLinkedList()

    // Добавляем тестовые значения в список
    linkedList.append(1).append(2).append(3).append(4)

    expect(linkedList.toString()).toBe('1,2,3,4')
    expect(linkedList.head.value).toBe(1)
    expect(linkedList.tail.value).toBe(4)

    // Инвертируем список
    linkedList.reverse()

    expect(linkedList.toString()).toBe('4,3,2,1')

    expect(linkedList.head.prev).toBeNull()
    expect(linkedList.head.value).toBe(4)
    expect(linkedList.head.next.value).toBe(3)
    expect(linkedList.head.next.next.value).toBe(2)
    expect(linkedList.head.next.next.next.value).toBe(1)

    expect(linkedList.tail.next).toBeNull()
    expect(linkedList.tail.value).toBe(1)
    expect(linkedList.tail.prev.value).toBe(2)
    expect(linkedList.tail.prev.prev.value).toBe(3)
    expect(linkedList.tail.prev.prev.prev.value).toBe(4)

    // Инвертируем список обратно в начальное состояние
    linkedList.reverse()

    expect(linkedList.toString()).toBe('1,2,3,4')

    expect(linkedList.head.prev).toBeNull()
    expect(linkedList.head.value).toBe(1)
    expect(linkedList.head.next.value).toBe(2)
    expect(linkedList.head.next.next.value).toBe(3)
    expect(linkedList.head.next.next.next.value).toBe(4)

    expect(linkedList.tail.next).toBeNull()
    expect(linkedList.tail.value).toBe(4)
    expect(linkedList.tail.prev.value).toBe(3)
    expect(linkedList.tail.prev.prev.value).toBe(2)
    expect(linkedList.tail.prev.prev.prev.value).toBe(1)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/doubly-linked-list
```

<img src="https://habrastorage.org/webt/rn/nj/8k/rnnj8kia-74iiuhmzbzb0bhppyq.png" />
