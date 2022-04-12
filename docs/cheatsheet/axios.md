---
sidebar_position: 20
---

# Axios

## Возможности

- Отправка [XMLHttpRequest](https://learn.javascript.ru/xmlhttprequest) из браузера
- Отправка `HTTP-запросов` из [Node.js]https://nodejs.org/en/()
- Поддержка [Promise API](https://learn.javascript.ru/promise-basics)
- Перехват запросов и ответов
- Преобразование данных запросов и ответов
- Отмена/прерывание запроса
- Автоматический разбор/парсинг данных в формате `JSON`
- Автоматическая защита от [XSRF](https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B6%D1%81%D0%B0%D0%B9%D1%82%D0%BE%D0%B2%D0%B0%D1%8F_%D0%BF%D0%BE%D0%B4%D0%B4%D0%B5%D0%BB%D0%BA%D0%B0_%D0%B7%D0%B0%D0%BF%D1%80%D0%BE%D1%81%D0%B0)

## Установка

```bash
yarn add axios
# или
npm i axios
```

## Примеры отправки GET и POST-запросов

```js
// GET-запрос
const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/users?id=${userId}`)
    return response.data
  } catch (err) {
    console.error(err.toJSON())
  }
}
getUserById('1')

// POST-запрос
const addNewUser = async (newUser) => {
  try {
    const response = await axios.post('/users', newUser)
    return response.data
  } catch (err) {
    console.error(err.toJSON())
  }
}
addNewUser({ firstName: 'John', lastName: 'Smith' })
```

## Пример отправки нескольких запросов

```js
// Первый запрос
const getUserAccount = () => axios.get(`/user/123`)
// Второй запрос
const getUserPermissions = () => axios.get('/user/123/permissions')
// Отправка обоих запросов
const getUserInfo = async () => {
  const [account, permissions] = await Promise.all([getUserAccount(), getUserPermissions()])

  return {
    account,
    permissions
  }
}
```

## Настройки запроса

```js
{
  url: '/users',
  method: 'get', // default
  baseURL: 'http://example.com',
  // Преобразование запроса
  transfromRequest: [(data, headers) => {
    return data
  }],
  // Преобразование ответа
  transformResponse: [(data) => {
    return data
  }],
  headers: {
    'Authorization': 'Bearer [token]'
  },
  data: {
    firstName: 'John'
  },
  // Параметры строки запроса
  params: {
    id: '123'
  },
  withCredentials: false, // default
  responseType: 'json', // default
  responseEncoding: 'utf8', // default
  // Прогресс загрузки файлов
  onUploadProgress: (e) => {},
  // Прогресс скачивания файлов
  onDownloadProgress: (e) => {},
  // Максимальный размер ответа в байтах
  maxContentLength: 2048,
  // Максимальный размер запроса в байтах
  maxBodyLength: 2048,
  proxy: {
    protocol: 'https',
    host: '127.0.0.1',
    port: 5000,
    auth: {
      username: 'John',
      password: 'secret'
    }
  },
  // Токен для отмены запроса
  cancelToken: new CancelToken((cancel) => {})
}
```

## Схема ответа

```js
{
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
}
```

## Настройки по умолчанию

```js
axios.defaults.baseURL = 'http://example.com'
// Дефолтные настройки общих заголовков
axios.defaults.headers.common['Authorization'] = TOKEN
// Дефолтные настройки для POST-запроса
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
```

## Перехватчики

Мы можем перехватывать запросы или ответы перед их обработкой в `then` или `catch`.

```js
// Перехватчик запроса
axios.interceptors.request.use((config) => {
  return config
}, (error) => {
  return Promise.reject(error)
})

// Перехватчик ответа
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  return Promise.reject(error)
})
```

## Обработка ошибок

```js
const getUserById = (userId) => {
  try {
    const { data } = await axios.get(`/users?id=${userId}`)
    return data
  } catch (error) {
    if (error.response) {
      // Статус ответа выходит за пределы 2xx
      const { data, status, headers } = error.response
      console.error(data)
    } else if (error.request) {
      // Отсутствует тело ответа
      console.error(error.request)
    } else {
      // Ошибка, связанная с неправильной настройкой запроса
      console.error(error.message)
    }
    // Другая ошибка
    console.error(error.config)
    // Подробная информация об ошибке
    console.error(error.toJSON())
  }
}
```

## Отмена запроса

```js
const { CancelToken } = axios
const source = CancelToken.source()

const getUserById = (userId) => {
  try {
    const { data } = await axios.get(`/users?id=${userId}`)
    return data
  } catch (thrown) {
    if (axios.isCancel(thrown)) {
      console.error(thrown.message)
    } else {
      // Обработка ошибки
    }
  }
}

// Отмена запроса (параметр `message` является опциональным)
source.cancel('Выполнение операции отменено')
```
