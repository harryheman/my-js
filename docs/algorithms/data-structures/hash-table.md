---
sidebar_position: 5
title: Хэш-таблица
description: Хэш-таблица
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Хэш-таблица

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A5%D0%B5%D1%88-%D1%82%D0%B0%D0%B1%D0%BB%D0%B8%D1%86%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=cWbuK7C13HQ)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/hash-table.js)

Хэш-таблица (hash table) - это структура данных, которая реализует абстрактный тип данных "ассоциативный массив" и позволяет хранить пары "ключ-значение". Хэш-таблица использует так называемую хэш-функцию (hash function), которая принимает ключ и возвращает индекс массива, по которому будет храниться значение (см. [хорошее видео про хэширование](https://www.youtube.com/watch?v=xV8USnjKGCU)). Пример хэш-таблицы, в которой ключом выступает имя человека, а значением адрес его электронной почты:

<img src="https://habrastorage.org/webt/rx/lo/u4/rxlou4t-at0bmzeeno2bll_2igs.png" />
<br />

В идеале хэш-функция должна генерировать уникальный индекс для каждого ключа. Однако реальные хэш-таблицы используют несовершенные хэш-функции, генерирующие одинаковые индексы для разных ключей. Такие ситуации называются коллизиями (collisions). Существует несколько способов их решения, наиболее популярными из которых являются: хэш-таблица с цепочками и хэш-таблица с открытой адресацией.

Метод цепочек подразумевает хранение значений, соответствующих одному индексу в виде связного списка (linked list) (см. часть 1, раздел 1):

<img src="https://habrastorage.org/webt/et/dn/jw/etdnjwllpuzxjxnp4l5uwjvqk0i.png" />

Метод открытой адресации помещает значение по совпадающему индексу в первую свободную ячейку:

<img src="https://habrastorage.org/webt/oi/io/li/oiiolihgcyn10bwjxkj4zhtqkcc.png" />

__Реализация__

Приступаем к реализации хэш-таблицы:

```javascript
// data-structures/hash-table.js
// Импортируем конструктор связного списка
// (мы будем использовать метод цепочек для разрешения коллизий)
import LinkedList from './linked-list'

// Дефолтный размер таблицы
// (в реальности размер будет намного больше)
const defaultHashTableSize = 32

// Хэш-таблица
export default class HashTable {
  constructor(size = defaultHashTableSize) {
    // Создаем таблицу указанного размера и
    // заполняем ее пустыми связными списками
    this.buckets = new Array(size).fill(null).map(() => new LinkedList())
    // Хранилище ключей
    this.keys = {}
  }
}
```

Реализуем простейшую хэш-функцию:

```javascript
// Преобразует ключ в хэшированное значение
// (хэш-функция)
hash(key) {
  // Для простоты в качестве хэша используется сумма кодов символов ключа
  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  const hash = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Хэш (индекс) не должен превышать размера таблицы
  return hash % this.buckets.length
}
```

Метод установки значения по ключу:

```javascript
// Устанавливает значение по ключу
set(key, value) {
  // Хэшируем ключ
  // (получаем индекс массива)
  const index = this.hash(key)
  // Сохраняем хэш по ключу
  this.keys[key] = index
  // Извлекаем нужный список
  const bucket = this.buckets[index]
  // Извлекаем узел
  // (значением узла является объект)
  const node = bucket.find({ cb: (value) => value.key === key })
  // Если узел не найден
  if (!node) {
    // Добавляем новый узел
    bucket.append({ key, value })
  } else {
    // Иначе, обновляем значение узла
    node.value.value = value
  }
}
```

Метод удаления значения по ключу:

```javascript
// Удаляет значение по ключу
remove(key) {
  // Хэшируем ключ
  const index = this.hash(key)
  // Удаляем хэш по ключу
  delete this.keys[key]
  // Извлекаем нужный список
  const bucket = this.buckets[index]
  // Извлекаем узел
  const node = bucket.find({ cb: (value) => value.key === key })
  // Возвращаем удаленный узел или `null`,
  // если узел отсутствует
  return node ? bucket.remove(node.value) : null
}
```

Метод извлечения значения по ключу:

```javascript
// Возвращает значение по ключу
get(key) {
  // Хэшируем ключ
  const index = this.hash(key)
  // Извлекаем нужный список
  const bucket = this.buckets[index]
  // Извлекаем узел
  const node = bucket.find({ cb: (value) => value.key === key })
  // Возвращаем значение узла или `null`,
  // если узел отсутствует
  return node ? node.value.value : null
}
```

Напоследок реализуем несколько вспомогательных методов:

```javascript
// Определяет наличие ключа
has(key) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
  return Object.hasOwn(this.keys, key)
}

// Возвращает все ключи
getKeys() {
  return Object.keys(this.keys)
}

// Возвращает все значения
getValues() {
  // Перебираем списки и возвращаем значения всех узлов
  return this.buckets.reduce((acc, bucket) => {
    return acc.concat(
      // Метод `toArray` преобразует связный список в массив
      bucket.toArray().map((node) => node.value.value),
    )
  }, [])
}
```

<details>
<summary>Полный код хэш-таблицы</summary>

```javascript
// Импортируем конструктор связного списка
// (мы будем использовать метод цепочек для разрешения коллизий)
import LinkedList from './linked-list'

// Дефолтный размер таблицы
// (в реальности размер будет намного больше)
const defaultSize = 32

// Хэш-таблица
export default class HashTable {
  constructor(size = defaultSize) {
    // Создаем таблицу указанного размера и
    // заполняем ее пустыми связными списками
    this.buckets = new Array(size).fill(null).map(() => new LinkedList())
    // Хранилище ключей
    this.keys = {}
  }

  // Преобразует ключ в хэшированное значение
  // (хэш-функция)
  hash(key) {
    // Для простоты в качестве хэша используется сумма кодов символов ключа
    // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    const hash = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0)
    // Хэшированное значение не должно превышать размера таблицы
    return hash % this.buckets.length
  }

  // Устанавливает значение по ключу
  set(key, value) {
    // Хэшируем ключ
    // (получаем индекс массива)
    const index = this.hash(key)
    // Сохраняем хэш по ключу
    this.keys[key] = index
    // Извлекаем нужный список
    const bucket = this.buckets[index]
    // Извлекаем узел
    // (значением узла является объект)
    const node = bucket.find({ cb: (value) => value.key === key })
    // Если узел не найден
    if (!node) {
      // Добавляем новый узел
      bucket.append({ key, value })
    } else {
      // Иначе, обновляем значение узла
      node.value.value = value
    }
  }

  // Удаляет значение по ключу
  remove(key) {
    // Хэшируем ключ
    const index = this.hash(key)
    // Удаляем хэш по ключу
    delete this.keys[key]
    // Извлекаем нужный список
    const bucket = this.buckets[index]
    // Извлекаем узел
    const node = bucket.find({ cb: (value) => value.key === key })
    // Возвращаем удаленный узел или `null`,
    // если узел отсутствует
    return node ? bucket.remove(node.value) : null
  }

  // Возвращает значение по ключу
  get(key) {
    // Хэшируем ключ
    const index = this.hash(key)
    // Извлекаем нужный список
    const bucket = this.buckets[index]
    // Извлекаем узел
    const node = bucket.find({ cb: (value) => value.key === key })
    // Возвращаем значение узла или `null`,
    // если узел отсутствует
    return node ? node.value.value : null
  }

  // Определяет наличие ключа
  has(key) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
    return Object.hasOwn(this.keys, key)
  }

  // Возвращает все ключи
  getKeys() {
    return Object.keys(this.keys)
  }

  // Возвращает все значения
  getValues() {
    // Перебираем списки и возвращаем значения всех узлов
    return this.buckets.reduce((acc, bucket) => {
      return acc.concat(
        // Метод `toArray` преобразует связный список в массив
        bucket.toArray().map((node) => node.value.value),
      )
    }, [])
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/__tests__/hash-table.test.js
import HashTable from '../hash-table'

describe('HashTable', () => {
  it('должен создать хэш-таблицы указанного размера', () => {
    const defaultHashTable = new HashTable()
    expect(defaultHashTable.buckets.length).toBe(32)

    const biggerHashTable = new HashTable(64)
    expect(biggerHashTable.buckets.length).toBe(64)
  })

  it('должен генерировать правильный хэш для ключей', () => {
    const hashTable = new HashTable()

    expect(hashTable.hash('a')).toBe(1)
    expect(hashTable.hash('b')).toBe(2)
    expect(hashTable.hash('abc')).toBe(6)
  })

  it('должен устанавливать, читать и удалять значения с коллизиями', () => {
    const hashTable = new HashTable(3)

    expect(hashTable.hash('a')).toBe(1)
    expect(hashTable.hash('b')).toBe(2)
    expect(hashTable.hash('c')).toBe(0)
    expect(hashTable.hash('d')).toBe(1)

    hashTable.set('a', 'sky-old')
    hashTable.set('a', 'sky')
    hashTable.set('b', 'sea')
    hashTable.set('c', 'earth')
    hashTable.set('d', 'ocean')

    expect(hashTable.has('x')).toBe(false)
    expect(hashTable.has('b')).toBe(true)
    expect(hashTable.has('c')).toBe(true)

    const stringifier = (value) => `${value.key}:${value.value}`

    expect(hashTable.buckets[0].toString(stringifier)).toBe('c:earth')
    expect(hashTable.buckets[1].toString(stringifier)).toBe('a:sky,d:ocean')
    expect(hashTable.buckets[2].toString(stringifier)).toBe('b:sea')

    expect(hashTable.get('a')).toBe('sky')
    expect(hashTable.get('d')).toBe('ocean')
    expect(hashTable.get('x')).toBeNull()

    hashTable.remove('a')

    expect(hashTable.remove('not-existing')).toBeNull()

    expect(hashTable.get('a')).toBeNull()
    expect(hashTable.get('d')).toBe('ocean')

    hashTable.set('d', 'ocean-new')
    expect(hashTable.get('d')).toBe('ocean-new')
  })

  it('должен добавить в таблицу объекты', () => {
    const hashTable = new HashTable()

    hashTable.set('objectKey', { prop1: 'a', prop2: 'b' })

    const object = hashTable.get('objectKey')
    expect(object).toBeDefined()
    expect(object.prop1).toBe('a')
    expect(object.prop2).toBe('b')
  })

  it('должен отслеживать актуальные ключи', () => {
    const hashTable = new HashTable(3)

    hashTable.set('a', 'sky-old')
    hashTable.set('a', 'sky')
    hashTable.set('b', 'sea')
    hashTable.set('c', 'earth')
    hashTable.set('d', 'ocean')

    expect(hashTable.getKeys()).toEqual(['a', 'b', 'c', 'd'])
    expect(hashTable.has('a')).toBe(true)
    expect(hashTable.has('x')).toBe(false)

    hashTable.remove('a')

    expect(hashTable.has('a')).toBe(false)
    expect(hashTable.has('b')).toBe(true)
    expect(hashTable.has('x')).toBe(false)
  })

  it('должен вернуть все значения', () => {
    const hashTable = new HashTable(3)

    hashTable.set('a', 'alpha')
    hashTable.set('b', 'beta')
    hashTable.set('c', 'gamma')

    expect(hashTable.getValues()).toEqual(['gamma', 'alpha', 'beta'])
  })

  it('должен вернуть все значения пустой таблицы', () => {
    const hashTable = new HashTable()
    expect(hashTable.getValues()).toEqual([])
  })

  it('должен вернуть все значения при наличии коллизий', () => {
    const hashTable = new HashTable(3)

    // Ключи `ab` и `ba` в текущей реализации будут иметь одинаковый хэш.
    // Нужно убедиться в сериализации нескольких значений одного списка
    hashTable.set('ab', 'one')
    hashTable.set('ba', 'two')

    hashTable.set('ac', 'three')

    expect(hashTable.getValues()).toEqual(['one', 'two', 'three'])
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/hash-table
```

<img src="https://habrastorage.org/webt/fn/v7/a2/fnv7a2nxeekiywcuseehkfitve0.png" />
