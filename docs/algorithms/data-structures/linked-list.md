---
sidebar_position: 1
title: Связный список
description: Связный список
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Связный список

**Описание**

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%B2%D1%8F%D0%B7%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA)
- [YouTube](https://www.youtube.com/watch?v=C9FK1pHLnhI&list=PLQOaTSbfxUtAIipl4136nwb4ISyFk8oI4)

Связный (связанный, односвязный, однонаправленный) список (linked list) - это динамическая структура данных, представляющая собой упорядоченную коллекцию узлов (nodes). Каждый узел содержит значение и ссылку (указатель) на следующий узел.

<img src='https://habrastorage.org/webt/dz/-b/yf/dz-byfpa6h_clxc6thkrojlrdli.png' />

Преимущество связного списка перед массивом заключается в его структурной гибкости: порядок элементов связного списка может не совпадать с порядком их расположения в памяти. Порядок обхода (traverse) списка задается его внутренними связями. Суть преимущества состоит в том, что во многих языках программирования создание массива требует указания его размера (для выделения необходимой памяти), а связный список позволяет обойти это ограничение.

Недостатком связного списка является то, что время доступа к его элементам линейно (соответствует количеству элементов). Быстрый (произвольный) доступ к элементу невозможен.

**Сложность**

_Временная_

| Чтение | Поиск | Вставка | Удаление |
|--------|-------|---------|----------|
| O(n)   | O(n)  | O(1)    | O(n)     |

_Пространственная_

O(n)

**Реализация**

Начнем с реализации вспомогательной функции сравнения узлов:

```javascript
// utils/comparator.js
export default class Comparator {
  constructor(fn) {
    this.compare = fn || Comparator.defaultCompare
  }

  // Дефолтная функция сравнения узлов
  static defaultCompare(a, b) {
    if (a === b) {
      return 0
    }
    return a < b ? -1 : 1
  }

  // Проверка на равенство
  equal(a, b) {
    return this.compare(a, b) === 0
  }

  // Меньше чем
  lessThan(a, b) {
    return this.compare(a, b) < 0
  }

  // Больше чем
  greaterThan(a, b) {
    return this.compare(a, b) > 0
  }

  // Меньше или равно
  lessThanOrEqual(a, b) {
    return this.lessThan(a, b) || this.equal(a, b)
  }

  // Больше или равно
  greaterThanOrEqual(a, b) {
    return this.greaterThan(a, b) || this.equal(a, b)
  }

  // Инверсия сравнения
  reverse() {
    const original = this.compare
    this.compare = (a, b) => original(b, a)
  }
}
```

Эта функция позволяет создавать списки с узлами, значения которых являются не только примитивами, но и объектами.

Реализуем узел списка:

```javascript
// data-structures/linked-list.js
// Узел
class Node {
  constructor(value, next = null) {
    // Значение
    this.value = value
    // Ссылка на следующий узел
    this.next = next
  }

  // Возвращает строковое представление узла.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return cb ? cb(this.value) : `${this.value}`
  }
}
```

Приступаем к реализации связного списка:

```javascript
import Comparator from '../utils/comparator'

export default class LinkedList {
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
  // Создаем новый головной узел со ссылкой на предыдущий головной узел
  // (новый узел становится головным (первым))
  this.head = new Node(value, this.head)
  // Если хвостовой узел отсутствует, значит,
  if (!this.tail) {
    // головной узел также является хвостовым
    this.tail = this.head
  }
  // Это обеспечивает возможность вызова методов по цепочке
  return this
}

// Добавляет значение в конец списка
append(value) {
  // Создаем новый узел
  const node = new Node(value)
  // Если головной узел отсутствует, то
  if (!this.head) {
    // добавляем значение в начало списка
    return this.prepend(value)
  }
  // Добавляем ссылку на новый узел в хвостовой
  this.tail.next = node
  // Обновляем хвостовой узел
  // (новый узел становится хвостовым (последним))
  this.tail = node

  return this
}
```

Метод добавления узла в указанную позицию (по индексу):

```javascript
// Добавляет значение в список по указанному индексу
insert(value, index) {
  // Если индекс равен 0, то
  if (index === 0) {
    // Добавляем значение в начало списка
    return this.prepend(value)
  }
  // Создаем новый узел
  const node = new Node(value)
  // Текущий узел (начинаем с головного)
  let current = this.head
  // Счетчик
  let i = 1
  // Пока есть текущий узел
  while (current) {
    // Прерываем цикл при совпадении счетчика с индексом -
    // это означает, что мы нашли нужный узел
    if (i === index) {
      break
    }
    // Переходим к следующему узлу
    current = current.next
    // Увеличиваем значение счетчика
    i += 1
  }
  // Если узел найден
  if (current) {
    // Добавляем ссылку на следующий узел в новый
    node.next = current.next
    // Обновляем ссылку текущего узла на следующий
    // (новый узел помещается между текущим и следующим: current и current.next)
    current.next = node
  } else {
    // Если узел не найден,
    // добавляем значение в конец списка
    return this.append(value)
  }

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
  } else {
    // Иначе, обнуляем головной и хвостовой узлы,
    // (делаем список пустым, поскольку он содержал только один узел)
    this.head = null
    this.tail = null
  }

  // Возвращаем удаленный узел
  return removed
}

// Удаляет хвостовой узел
removeTail() {
  // Если головной узел отсутствует, значит,
  if (!this.head) {
    // список пуст - удалять нечего
    return null
  }

  // Удаляемый узел - хвостовой
  let removed = this.tail

  // Крайний случай: если список состоит из одного узла,
  if (this.head === this.tail) {
    // обнуляем головной и хвостовой узлы
    // (делаем список пустым)
    this.head = null
    this.tail = null

    // Возвращаем удаленный узел
    return removed
  }

  // Текущий узел (начинаем с головного)
  let current = this.head

  // Обнуляем ссылку на следующий узел.
  // Пока есть следующий узел
  while (current.next) {
    // Если следующий узел является последним
    // (не содержит ссылки на следующий),
    if (!current.next.next) {
      // обнуляем ссылку текущего узла на следующий
      current.next = null
    } else {
      // Иначе, переходим к следующему узлу
      current = current.next
    }
  }

  // Обновляем хвостовой узел (заменяем на текущий)
  this.tail = current

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

  // Последний удаленный узел
  let removed = null

  // Пока есть и удаляется головной узел
  while (this.head && this.compare.equal(this.head.value, value)) {
    // Обновляем удаляемый узел
    removed = this.head
    // Обновляем головной узел (заменяем на следующий)
    this.head = this.head.next
  }
  // Текущий узел (начинаем с головного)
  let current = this.head
  // Если узел имеется
  if (current) {
    // Пока есть следующий узел
    while (current.next) {
      // Если значения совпадают
      if (this.compare.equal(current.next.value, value)) {
        // Обновляем удаляемый узел
        removed = current.next
        // Обновляем ссылку текущего узла (заменяем на следующий,
        // чтобы закрыть образовавшуюся брешь)
        current.next = current.next.next
      } else {
        // Иначе, переходим к следующему узлу
        current = current.next
      }
    }
  }

  // Крайний случай: если удаляется хвостовой узел,
  if (this.compare.equal(this.tail.value, value)) {
    // обновляем его (заменяем на текущий)
    this.tail = current
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
    // Обновляем ссылку текущего узла на предыдущий
    current.next = prev
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
      // Перебираем узлы списка и преобразуем каждый в строку
      .map((node) => node.toString(cb))
      // Преобразуем массив в строку
      .toString()
  )
}
```

<details>
<summary>Полный код связного списка:</summary>

```javascript
import Comparator from '../utils/comparator'

// Узел
export class Node {
  constructor(value, next = null) {
    // Значение
    this.value = value
    // Ссылка на следующий узел
    this.next = next
  }

  // Возвращает строковое представление узла.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return cb ? cb(this.value) : `${this.value}`
  }
}

// Связный список
export default class LinkedList {
  constructor(fn) {
    // Головной (первый) узел
    this.head = null
    // Хвостовой (последний) узел
    this.tail = null
    // Функция сравнения узлов
    this.compare = new Comparator(fn)
  }

  // Добавляет значения в начало списка
  prepend(value) {
    // Создаем новый головной узел со ссылкой на предыдущий головной узел
    // (новый узел становится головным (первым))
    this.head = new Node(value, this.head)
    // Если хвостовой узел отсутствует, значит,
    if (!this.tail) {
      // головной узел также является хвостовым
      this.tail = this.head
    }
    // Это обеспечивает возможность вызова методов по цепочке
    return this
  }

  // Добавляет значение в конец списка
  append(value) {
    // Создаем новый узел
    const node = new Node(value)
    // Если головной узел отсутствует, то
    if (!this.head) {
      // добавляем значение в начало списка
      return this.prepend(value)
    }
    // Добавляем ссылку на новый узел в хвостовой узел
    this.tail.next = node
    // Обновляем хвостовой узел
    // (новый узел становится хвостовым (последним))
    this.tail = node

    return this
  }

  // Добавляет значение в список по указанному индексу
  insert(value, rawIndex) {
    // Нормализуем индекс
    const index = rawIndex < 0 ? 0 : rawIndex
    // Если индекс равен 0, то
    if (index === 0) {
      // Добавляем значение в начало списка
      return this.prepend(value)
    }
    // Создаем новый узел
    const node = new Node(value)
    // Текущий узел (начинаем с головного)
    let current = this.head
    // Счетчик
    let i = 1
    // Пока есть текущий узел
    while (current) {
      // Прерываем цикл при совпадении счетчика с индексом -
      // это означает, что мы нашли нужный узел
      if (i === index) {
        break
      }
      // Переходим к следующему узлу
      current = current.next
      // Увеличиваем значение счетчика
      i += 1
    }
    // Если узел найден
    if (current) {
      // Добавляем ссылку на следующий узел в новый
      node.next = current.next
      // Обновляем ссылку текущего узла на следующий
      // (новый узел помещается между текущий и следующим: current и current.next)
      current.next = node
    } else {
      // Если узел не найден,
      // добавляем значение в конец списка
      return this.append(value)
    }

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
      // Обновляем головной узел (заменяем на следующий)
      this.head = this.head.next
    } else {
      // Иначе, обнуляем головной и хвостовой узлы,
      // (делаем список пустым, поскольку он содержал только один узел)
      this.head = null
      this.tail = null
    }

    // Возвращаем удаленный узел
    return removed
  }

  // Удаляет хвостовой узел
  removeTail() {
    // Если головной узел отсутствует, значит,
    if (!this.head) {
      // список пуст - удалять нечего
      return null
    }

    // Удаляемый узел - хвостовой
    let removed = this.tail

    // Крайний случай: если список состоит из одного узла,
    if (this.head === this.tail) {
      // обнуляем головной и хвостовой узлы
      // (делаем список пустым)
      this.head = null
      this.tail = null

      // Возвращаем удаленный узел
      return removed
    }

    // Текущий узел (начинаем с головного)
    let current = this.head

    // Обнуляем ссылку на следующий узел.
    // Пока есть следующий узел
    while (current.next) {
      // Если следующий узел является последним
      // (не содержит ссылки на следующий),
      if (!current.next.next) {
        // обнуляем ссылку текущего узла на следующий
        current.next = null
      } else {
        // Иначе, переходим к следующему узлу
        current = current.next
      }
    }

    // Обновляем хвостовой узел (заменяем на текущий)
    this.tail = current

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

    // Последний удаленный узел
    let removed = null

    // Пока есть и удаляется головной узел
    while (this.head && this.compare.equal(this.head.value, value)) {
      // Обновляем удаляемый узел
      removed = this.head
      // Обновляем головной узел (заменяем на следующий)
      this.head = this.head.next
    }
    // Текущий узел (начинаем с головного)
    let current = this.head
    // Если узел имеется
    if (current) {
      // Пока есть следующий узел
      while (current.next) {
        // Если значения совпадают
        if (this.compare.equal(current.next.value, value)) {
          // Обновляем удаляемый узел
          removed = current.next
          // Обновляем ссылку текущего узла (заменяем на следующий,
          // чтобы закрыть образовавшуюся брешь)
          current.next = current.next.next
        } else {
          // Иначе, переходим к следующему узлу
          current = current.next
        }
      }
    }

    // Крайний случай: если удаляется хвостовой узел,
    if (this.compare.equal(this.tail.value, value)) {
      // обновляем его (заменяем на текущий)
      this.tail = current
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
      // Обновляем ссылку текущего узла на предыдущий
      current.next = prev
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

**Тестирование**

Проверим, что наш связный список работает, как ожидается.

<details>
<summary>Тесты для узла</summary>

```javascript
// data-structures/__tests__/linked-list.test.js
import LinkedList, { Node } from '../linked-list'

describe('LinkedListNode', () => {
  it('должен создать узел с указанным значением', () => {
    const node = new Node(1)

    expect(node.value).toBe(1)
    expect(node.next).toBeNull()
  })

  it('должен создать узел с объектом в качестве значения', () => {
    const nodeValue = { value: 1, key: 'test' }
    const node = new Node(nodeValue)

    expect(node.value.value).toBe(1)
    expect(node.value.key).toBe('test')
    expect(node.next).toBeNull()
  })

  it('должен соединить узлы вместе', () => {
    const node2 = new Node(2)
    const node1 = new Node(1, node2)

    expect(node1.next).toBeDefined()
    expect(node2.next).toBeNull()
    expect(node1.value).toBe(1)
    expect(node1.next.value).toBe(2)
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

</details>

<details>
<summary>Тесты для списка</summary>

```javascript
describe('LinkedList', () => {
  it('должен создать пустой связный список', () => {
    const linkedList = new LinkedList()
    expect(linkedList.toString()).toBe('')
  })

  it('должен добавить узлы в конец списка', () => {
    const linkedList = new LinkedList()

    expect(linkedList.head).toBeNull()
    expect(linkedList.tail).toBeNull()

    linkedList.append(1)
    linkedList.append(2)

    expect(linkedList.toString()).toBe('1,2')
    expect(linkedList.tail.next).toBeNull()
  })

  it('должен добавить узлы в начало списка', () => {
    const linkedList = new LinkedList()

    linkedList.prepend(2)
    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('2')

    linkedList.append(1)
    linkedList.prepend(3)

    expect(linkedList.toString()).toBe('3,2,1')
  })

  it('должен добавить узлы по указанным индексам', () => {
    const linkedList = new LinkedList()

    linkedList.insert(4, 3)
    expect(linkedList.head.toString()).toBe('4')
    expect(linkedList.tail.toString()).toBe('4')

    linkedList.insert(3, 2)
    linkedList.insert(2, 1)
    linkedList.insert(1, -7)
    linkedList.insert(10, 9)

    expect(linkedList.toString()).toBe('1,4,2,3,10')
  })

  it('должен удалить узлы по значениям', () => {
    const linkedList = new LinkedList()

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
    expect(linkedList.toString()).toBe('1,1,2,4,5')

    linkedList.remove(3)
    expect(linkedList.toString()).toBe('1,1,2,4,5')

    linkedList.remove(1)
    expect(linkedList.toString()).toBe('2,4,5')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('5')

    linkedList.remove(5)
    expect(linkedList.toString()).toBe('2,4')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('4')

    linkedList.remove(4)
    expect(linkedList.toString()).toBe('2')

    expect(linkedList.head.toString()).toBe('2')
    expect(linkedList.tail.toString()).toBe('2')

    linkedList.remove(2)
    expect(linkedList.toString()).toBe('')
  })

  it('должен удалить хвостовые узлы', () => {
    const linkedList = new LinkedList()

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
    const linkedList = new LinkedList()

    expect(linkedList.removeHead()).toBeNull()

    linkedList.append(1)
    linkedList.append(2)

    expect(linkedList.head.toString()).toBe('1')
    expect(linkedList.tail.toString()).toBe('2')

    const removedNode1 = linkedList.removeHead()

    expect(removedNode1.value).toBe(1)
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
    const linkedList = new LinkedList()

    const nodeValue1 = { value: 1, key: 'key1' }
    const nodeValue2 = { value: 2, key: 'key2' }

    linkedList.append(nodeValue1).prepend(nodeValue2)

    const nodeStringifier = (value) => `${value.key}:${value.value}`

    expect(linkedList.toString(nodeStringifier)).toBe('key2:2,key1:1')
  })

  it('должен найти узлы по значениям', () => {
    const linkedList = new LinkedList()

    expect(linkedList.find({ value: 5 })).toBeNull()

    linkedList.append(1)
    expect(linkedList.find({ value: 1 })).toBeDefined()

    linkedList.append(2).append(3)

    const node = linkedList.find({ value: 2 })

    expect(node.value).toBe(2)
    expect(linkedList.find({ value: 5 })).toBeNull()
  })

  it('должен найти узлы с помощью кастомной функции', () => {
    const linkedList = new LinkedList()

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

    const linkedList = new LinkedList(comparatorFunction)

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
    expect(
      linkedList.find({ value: { value: 2, customValue: 'test5' } }),
    ).toBeNull()
  })

  it('должен применять функции для поиска узлов в правильном порядке (сначала применяется функция, переданная в объекте, при вызове метода `find`)', () => {
    const greaterThan = (value, compareTo) => (value > compareTo ? 0 : 1)

    const linkedList = new LinkedList(greaterThan)
    linkedList.fromArray([1, 2, 3, 4, 5])

    let node = linkedList.find({ value: 3 })
    expect(node.value).toBe(4)

    node = linkedList.find({ cb: (value) => value < 3 })
    expect(node.value).toBe(1)
  })

  it('должен создать список из массива', () => {
    const linkedList = new LinkedList()
    linkedList.fromArray([1, 1, 2, 3, 3, 3, 4, 5])

    expect(linkedList.toString()).toBe('1,1,2,3,3,3,4,5')
  })

  it('должен преобразовать список в массив', () => {
    const linkedList = new LinkedList()
    linkedList.append(1)
    linkedList.append(2)
    linkedList.append(3)
    expect(linkedList.toArray().join(',')).toBe('1,2,3')
  })

  it('должен инвертировать список', () => {
    const linkedList = new LinkedList()

    // Добавляем тестовые значения в список
    linkedList.append(1).append(2).append(3)

    expect(linkedList.toString()).toBe('1,2,3')
    expect(linkedList.head.value).toBe(1)
    expect(linkedList.tail.value).toBe(3)

    // Инвертируем список
    linkedList.reverse()
    expect(linkedList.toString()).toBe('3,2,1')
    expect(linkedList.head.value).toBe(3)
    expect(linkedList.tail.value).toBe(1)

    // Инвертируем список обратно в начальное состояние
    linkedList.reverse()
    expect(linkedList.toString()).toBe('1,2,3')
    expect(linkedList.head.value).toBe(1)
    expect(linkedList.tail.value).toBe(3)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/linked-list
```

<img src='https://habrastorage.org/webt/uw/sc/y_/uwscy_lkxt5mao_eeohhngnj3w0.png' />
