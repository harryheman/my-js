// адрес сервера
const SERVER_URL = 'http://localhost:3000/todos'

// основная функция для получения всех задач
// принимает строку запроса и адрес сервера
async function getTodos(query, endpoint = SERVER_URL) {
  try {
    query ? (query = `?${query}`) : (query = '')
    const response = await fetch(`${endpoint}${query}`)
    if (response.ok) {
      const json = await response.json()
      // выводим результат в консоль
      console.log(json)
      return json
    }
    throw new Error(response.statusText)
  } catch (err) {
    console.error(err.message || err)
  }
}
getTodos()

// получение задачи по ключу
const getTodoByKey = (key, val) => getTodos(`${key}=${val}`)

// по `id`
const getTodoById = (id) => getTodoByKey('id', id)
getTodoById('2')

// по имени автора
const getTodoByAuthorName = (name) => getTodoByKey('meta.author', name)
getTodoByAuthorName('John')

// получение активных задач
const getActiveTodos = () => getTodoByKey('complete', false)
getActiveTodos()

// более сложный пример
// получение задач по массиву `id`
const getTodosByIds = (ids) => {
  let query = `id=${ids.splice(0, 1)}`
  ids.forEach((id) => {
    query += `&id=${id}`
  })
  getTodos(query)
}
getTodosByIds([2, 4])

// получение нечетных задач
const getOddTodos = async () => {
  const todos = await getTodos()
  const oddIds = todos.reduce((arr, { id }) => {
    id % 2 !== 0 && arr.push(id)
    return arr
  }, [])
  getTodosByIds(oddIds)
}
getOddTodos()

/* Пагинация */
// _page &| _limit - у нас нет страниц, так что...
const getTodosByCount = (count) => getTodos(`_limit=${count}`)
getTodosByCount(2)

/* Сортировка */
// _sort & _order - asc по умолчанию
const getSortedTodos = (field, order) =>
  getTodos(`_sort=${field}&_order=${order}`)
getSortedTodos('id', 'desc')

/* Часть */
// _start & _end | _limit
// _start не включается
const getTodosSlice = (min, max) => getTodos(`_start=${min}&_end=${max}`)
getTodosSlice(1, 3)

/* Операторы */
// Диапазон
// _gte | _lte
// _gte included
const getTodosByRange = (key, min, max) =>
  getTodos(`${key}_gte=${min}&${key}_lte=${max}`)
getTodosByRange('id', 1, 2)

// Исключение
// _ne
const getTodosWithout = (key, val) => getTodos(`${key}_ne=${val}`)
getTodosWithout('id', '3')

// Фильтрация
// _like
const getTodosByFilter = (key, filter) => getTodos(`${key}_like=${filter}`)
getTodosByFilter('text', '^[cr]') // Code & Repeat - начинаются с 'c' & 'r', соответственно

/* Полнотекстовый поиск */
// q
const getTodosBySearch = (str) => getTodos(`q=${str}`)
getTodosBySearch('eat') // Eat & Repeat - включают 'eat'
