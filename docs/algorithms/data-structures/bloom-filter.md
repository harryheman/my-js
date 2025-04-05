---
sidebar_position: 12
title: Фильтр Блума
description: Фильтр Блума
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Фильтр Блума

**Описание**

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A4%D0%B8%D0%BB%D1%8C%D1%82%D1%80_%D0%91%D0%BB%D1%83%D0%BC%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=V3pzxngeLqw&t=26s)

Фильтр Блума (Bloom filter) - это пространственно-эффективная вероятностная структура данных, предназначенная для определения наличия элемента во множестве. С одной стороны, эта структура является очень быстрой и использует минимальный объем памяти, с другой стороны, возможны ложноположительные (false positive) результаты. Ложноотрицательные (false negative) результаты невозможны. Другими словами, фильтр возвращает либо "элемент МОЖЕТ содержаться во множестве", либо "элемент ТОЧНО НЕ содержится во множестве". Фильтр Блума может использовать любое количество памяти, но, как правило, чем больше памяти, тем ниже вероятность ложноположительных результатов.

Блум предложил эту технику для применения в областях, где количество исходных данных потребовало бы непрактично много памяти в случае применения условно безошибочных техник хеширования.

_Описание алгоритма_

Пустой фильтр Блума представлен массивом из `m` битов, установленных в `0`. Должно быть определено `k` независимых хеш-функций, отображающих каждый элемент множества в одну из `m` позиций массива, генерируя единообразное случайное распределение. Обычно `k` задается константой, которая намного меньше `m` и пропорциональна количеству добавляемых элементов. Точный выбор `k` и постоянной пропорциональности `m` определяются уровнем ложных срабатываний фильтра.

Вот пример фильтра Блума, представляющего множество `{x, y, z}`. Цветные стрелки показывают позиции (индексы) битового массива, соответствующие элементам множества. Элемент `w` не содержится во множестве `{x, y, z}`, потому что он привязан к позиции массива, равной `0`. В данном случае `m = 18`, а `k = 3`.

<img src="https://habrastorage.org/webt/mx/bt/_e/mxbt_eoh1fk17csnkjnyfpzxxqa.png" />
<br />

Для добавления в фильтр элемента `e` необходимо записать `1` в каждую позицию `h1(e)`, ..., `hk(e)` (хеш-функции) битового массива.

Для определения наличия элемента `e` во множестве необходимо проверить состояние битов `h1(e)`, ..., `hk(e)`. Если хотя бы один бит имеет значение `0`, элемент отсутствует. Если все биты имеют значение `1`, структура сообщает, что элемент присутствует. При этом, может возникнуть две ситуации: либо элемент действительно содержится во множестве, либо все биты оказались установлены случайно при добавлении других элементов. Второй случай является источником ложноположительных результатов.

_Операции_

Фильтр Блума позволяет выполнять две основные операции: вставка и поиск элемента. Поиск может завершаться ложноположительными результатами. Удаление элементов возможно, но проблематично.

Другими словами, в фильтр можно добавлять элементы, а на вопрос о наличии элемента структура отвечает либо "нет", либо "возможно".

Операции вставки и поиска выполняются за время `O(1)`.

_Создание фильтра_

При создании фильтра указывается его размер. Размер нашего фильтра составляет `100`. Все элементы устанавливаются в `false` (по сути, тоже самое, что `0`).

В процессе добавления генерируется хеш элемента с помощью трех хеш-функций. Эти функции возвращают индексы. Значение по каждому индексу обновляется на `true`.

В процессе поиска также генерируется хеш элемента. Затем проверяется, что все значения по индексам являются `true`. Если это так, то элемент может содержаться во множестве.

Однако мы не можем быть в этом уверены на 100%, поскольку биты могли быть установлены при добавлении других элементов.

Если хотя бы одно значение равняется `false`, элемент точно отсутствует во множестве.

_Ложноположительные результаты_

Вероятность ложноположительных срабатываний определяется тремя факторами: размером фильтра (`m`), количеством используемых хеш-функций (`k`) и количеством элементов, добавляемых в фильтр (`n`).

Формула выглядит следующим образом:

( 1 - e <sup>-kn/m</sup> ) <sup>k</sup>

Значения этих переменных выбираются, исходя из приемлемости ложноположительных результатов.

_Применение_

Фильтр Блума может использоваться в блогах. Он идеально подходит для определения статей, которые пользователь еще не читал, за счет добавления в фильтр статей, прочитанных им.

Некоторые статьи будут отфильтрованы по ошибке, но цена приемлема: пользователь не увидит нескольких статей, зато ему будут показываться новые статьи при каждом посещении сайта.

Подробнее о фильтре Блума можно почитать в [этой статье](https://habr.com/ru/companies/timeweb/articles/806383/).

**Реализация**

Приступаем к реализации фильтра Блума:

```javascript
// data-structures/bloom-filter.js
export default class BloomFilter {
  // Размер фильтра напрямую влияет на вероятность ложноположительных результатов.
  // Как правило, чем больше размер, тем такая вероятность ниже
  constructor(size = 100) {
    // Размер фильтра
    this.size = size
    // Хранилище (по сути, сам фильтр)
    this.storage = this.createStore(size)
  }
}
```

Метод добавления элемента в фильтр:

```javascript
// Добавляет элемент в фильтр
insert(item) {
  // Вычисляем хеш элемента (индексы массива в количестве 3 штук)
  const hashValues = this.getHashValues(item)

  // Устанавливаем значение по каждому индексу в `true`
  hashValues.forEach((v) => this.storage.setValue(v))
}
```

Метод определения наличия элемента в фильтре:

```javascript
// Определяет наличие элемента в фильтре
mayContain(item) {
  // Вычисляем хеш элемента
  const hashValues = this.getHashValues(item)

  // Перебираем индексы
  for (const v of hashValues) {
    // Если хотя бы одно значение равняется `false`
    if (!this.storage.getValue(v)) {
      // Элемент точно отсутствует
      return false
    }
  }

  // Элемент может присутствовать
  return true
}
```

Метод создания хранилища (по сути, фильтра):

```javascript
// Создает хранилище
createStore(size) {
  // Хранилище - массив указанного размера, заполненный `false`
  const storage = new Array(size).fill(false)

  // Возвращается объект с "геттером" и "сеттером"
  return {
    getValue(i) {
      return storage[i]
    },
    setValue(i) {
      storage[i] = true
    },
  }
}
```

Хеш-функции (довольно примитивные, надо сказать):

```javascript
// Хеш-функции
hash1(item) {
  let hash = 0
  for (let i = 0; i < item.length; i++) {
    const char = item.charCodeAt(i)
    hash = (hash << 5) + hash + char
    hash &= hash // конвертируем значение в 32-битное целое число
    hash = Math.abs(hash)
  }
  return hash % this.size
}

hash2(item) {
  let hash = 5381
  for (let i = 0; i < item.length; i++) {
    const char = item.charCodeAt(i)
    hash = (hash << 5) + hash + char // hash * 33 + char
  }
  return Math.abs(hash % this.size)
}

hash3(item) {
  let hash = 0
  for (let i = 0; i < item.length; i++) {
    const char = item.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash &= hash // конвертируем значение в 32-битное целое число
  }
  return Math.abs(hash % this.size)
}
```

Наконец, метод генерации хеша:

```javascript
// Генерирует хеш элемента.
// Возвращает массив из трех индексов
getHashValues(item) {
  return [this.hash1(item), this.hash2(item), this.hash3(item)]
}
```

<details>
<summary>Полный код фильтра Блума</summary>

```javascript
export default class BloomFilter {
  // Размер фильтра напрямую влияет на вероятность ложноположительных результатов.
  // Как правило, чем больше размер, тем такая вероятность ниже
  constructor(size = 100) {
    // Размер фильтра
    this.size = size
    // Хранилище (по сути, сам фильтр)
    this.storage = this.createStore(size)
  }

  // Добавляет элемент в фильтр
  insert(item) {
    // Вычисляем хеш элемента (индексы массива в количестве 3 штук)
    const hashValues = this.getHashValues(item)

    // Устанавливаем значение по каждому индексу в `true`
    hashValues.forEach((v) => this.storage.setValue(v))
  }

  // Определяет наличие элемента в фильтре
  mayContain(item) {
    // Вычисляем хеш элемента
    const hashValues = this.getHashValues(item)

    // Перебираем индексы
    for (const v of hashValues) {
      // Если хотя бы одно значение равняется `false`
      if (!this.storage.getValue(v)) {
        // Элемент точно отсутствует
        return false
      }
    }

    // Элемент может присутствовать
    return true
  }

  // Создает хранилище
  createStore(size) {
    // Хранилище - массив указанного размера, заполненный `false`
    const storage = new Array(size).fill(false)

    // Возвращается объект с "геттером" и "сеттером"
    return {
      getValue(i) {
        return storage[i]
      },
      setValue(i) {
        storage[i] = true
      },
    }
  }

  // Хеш-функции
  hash1(item) {
    let hash = 0
    for (let i = 0; i < item.length; i++) {
      const char = item.charCodeAt(i)
      hash = (hash << 5) + hash + char
      hash &= hash // конвертируем значение в 32-битное целое число
      hash = Math.abs(hash)
    }
    return hash % this.size
  }

  hash2(item) {
    let hash = 5381
    for (let i = 0; i < item.length; i++) {
      const char = item.charCodeAt(i)
      hash = (hash << 5) + hash + char // hash * 33 + char
    }
    return Math.abs(hash % this.size)
  }

  hash3(item) {
    let hash = 0
    for (let i = 0; i < item.length; i++) {
      const char = item.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash &= hash // конвертируем значение в 32-битное целое число
    }
    return Math.abs(hash % this.size)
  }

  // Генерирует хеш элемента.
  // Возвращает массив из трех индексов
  getHashValues(item) {
    return [this.hash1(item), this.hash2(item), this.hash3(item)]
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/__tests__/bloom-filter.test.js
import BloomFilter from '../bloom-filter'

describe('BloomFilter', () => {
  let bloomFilter
  const people = ['Bruce Wayne', 'Clark Kent', 'Barry Allen']

  beforeEach(() => {
    bloomFilter = new BloomFilter()
  })

  it('должен содержать методы "insert" и "mayContain"', () => {
    expect(typeof bloomFilter.insert).toBe('function')
    expect(typeof bloomFilter.mayContain).toBe('function')
  })

  it('должен создать хранилище с указанными методами', () => {
    const store = bloomFilter.createStore(18)
    expect(typeof store.getValue).toBe('function')
    expect(typeof store.setValue).toBe('function')
  })

  it('должен стабильно хешировать элементы с помощью трех хеш-функций', () => {
    const str1 = 'apple'

    expect(bloomFilter.hash1(str1)).toEqual(bloomFilter.hash1(str1))
    expect(bloomFilter.hash2(str1)).toEqual(bloomFilter.hash2(str1))
    expect(bloomFilter.hash3(str1)).toEqual(bloomFilter.hash3(str1))

    expect(bloomFilter.hash1(str1)).toBe(14)
    expect(bloomFilter.hash2(str1)).toBe(43)
    expect(bloomFilter.hash3(str1)).toBe(10)

    const str2 = 'orange'

    expect(bloomFilter.hash1(str2)).toEqual(bloomFilter.hash1(str2))
    expect(bloomFilter.hash2(str2)).toEqual(bloomFilter.hash2(str2))
    expect(bloomFilter.hash3(str2)).toEqual(bloomFilter.hash3(str2))

    expect(bloomFilter.hash1(str2)).toBe(0)
    expect(bloomFilter.hash2(str2)).toBe(61)
    expect(bloomFilter.hash3(str2)).toBe(10)
  })

  it('должен создать массив с тремя хешированными значениями', () => {
    expect(bloomFilter.getHashValues('abc').length).toBe(3)
    expect(bloomFilter.getHashValues('abc')).toEqual([66, 63, 54])
  })

  it('должен добавить строки и возвращать `true` при проверке их наличия', () => {
    people.forEach((person) => bloomFilter.insert(person))

    // expect(bloomFilter.mayContain('Bruce Wayne')).toBe(true)
    // expect(bloomFilter.mayContain('Clark Kent')).toBe(true)
    // expect(bloomFilter.mayContain('Barry Allen')).toBe(true)

    expect(bloomFilter.mayContain('Tony Stark')).toBe(false)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/__tests__/bloom-filter
```

<img src="https://habrastorage.org/webt/-i/v4/yq/-iv4yqz0moqbyimbu7e82h-5erc.png" />
