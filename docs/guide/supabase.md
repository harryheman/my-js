---
sidebar_position: 15
title: Руководство по Supabase
description: Руководство по Supabase
keywords: ['javascript', 'js', 'supabase', 'saas', 'baas', 'guide', 'руководство', 'firebase', 'api', 'database', 'file storage', 'realtime', 'база данных', 'файловое хранилище', 'обработка изменений в режиме реального времени']
tags: ['javascript', 'js', 'supabase', 'saas', 'baas', 'guide', 'руководство', 'firebase', 'api', 'database', 'file storage', 'realtime', 'база данных', 'файловое хранилище', 'обработка изменений в режиме реального времени']
---

# Supabase

> `Supabase`, как и `Firebase` - это [`SaaS`](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BD%D0%BE%D0%B5_%D0%BE%D0%B1%D0%B5%D1%81%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BA%D0%B0%D0%BA_%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B0) или [`BaaS`](https://ru.bmstu.wiki/BaaS_(Backend-as-a-Service)). Что это означает? Это означает, что в случае с фулстек-приложением мы разрабатываем только клиентскую часть, а все остальное предоставляется `Supabase` через пользовательские комплекты для разработки программного обеспечения (`SDK`) и программные интерфейсы приложения (`API`). Под "всем остальным" подразумевается сервис аутентификации (включая возможность использования сторонних провайдеров), база данных (`PostgreSQL`), файловое хранилище, обработку модификации данных в режиме реального времени и сервер, который все это обслуживает.

[Пример использования `Supabase` для разработки фулстек-приложения для публикации постов](https://github.com/harryheman/Blog-Posts/tree/master/supabase-social-app)&nbsp;&nbsp;👀

_Установка_

```bash
yarn add @supabase/supabase-js
```

_Импорт_

```js
import supabase from '@supabase/supabase-js'
```

## Теоретические основы

### Клиент (Client)

_Инициализация_

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key, options)
```

- `url` - путь, предоставляемый после создания проекта, доступный в настройках панели управления проектом;
- `key` - ключ, предоставляемый после создания проекта, доступный в настройках панели управления проектом;
- `options` - дополнительные настройки.

```js
const options = {
 // дефолтная схема
 schema: 'public',
 headers: { 'x-my-custom-header': 'my-app-name' },
 autoRefreshToken: true,
 persistSession: true,
 detectSessionInUrl: true
}
const supabase = createClient('https://my-app.supabase.co', 'public-anon-key', options)
```

По умолчанию для выполнения HTTP-запросов `supabase-js` использует библиотеку [`cross-fetch`](https://www.npmjs.com/package/cross-fetch). Это можно изменить следующим образом:

```js
const supabase = createClient('https://my-app.supabase.co', 'public-anon-key', {
 fetch: fetch.bind(globalThis)
})
```

### Аутентификация (Auth)

__Регистрация__

Для регистрации нового пользователя используется метод `signUp`:

```js
async function registerUser({ email, password, first_name, last_name, age }) {
 try {
   const { user, session, error } = await supabase.auth.signUp({
     // обязательно
     email,
     password
   }, {
     // опционально
     data: {
       // такой синтаксис является валидным в JS
       // и более подходящим для Postgres
       first_name,
       last_name,
       age
     },
     // дефолтная настройка
     redirectTo: window.location.origin
   })
   if (error) throw error
   return { user, session }
 } catch (e) {
   throw e
 }
}
```

Такая сигнатура позволяет вызывать данный метод следующим образом (на примере `React-приложения`):

```js
// предположим, что `registerUser` возвращает только пользователя
const onSubmit = (e) => {
 e.preventDefault()
 if (submitDisabled) return

 setLoading(true)
 userApi
   .registerUser(formData)
   .then(setUser)
   .catch(setError)
   .finally(() => {
     setLoading(false)
   })
}
```

В `TypeScript` можно использовать такую сигнатуру:

```js
async function registerUser({ first_name, last_name, age, email, password }: UserData): ResponseData {
 let data = { user: null, error: null }
 try {
   const { user, error } = await supabase.auth.signUp({
     email,
     password
   }, {
     data: {
       first_name,
       last_name,
       age
     }
   })
   if (error) {
     data.error = error
   } else {
     data.user = user
   }
 } catch (e) {
   data.error = e
 } finally {
   return data
 }
}
```

_Обратите внимание_: по умолчанию после регистрации пользователь должен подтвердить свой email. Это можно отключить в разделе `Authentication -> Settings`.

__Авторизация__

Для авторизации, в том числе с помощью сторонних провайдеров, используется метод `signIn`:

```js
async function loginUser({ email, password }) {
 try {
   const { user, session, error } = await supabase.auth.singIn({
     // обязательно
     email,
     password
   }, {
     // опционально
     returnTo: window.location.pathname
   })
   if (error) throw error
   return { user, session }
 } catch (e) {
   throw e
 }
}
```

Если авторизация выполняется только через email, пользователю отправляется так называемая `магическая ссылка/magic link`.

Пример авторизации с помощью аккаунта `GitHub`:

```js
async function loginWithGitHub() {
 try {
   const { user, session, error } = await supabase.auth.signIn({
     // провайдером может быть `google`, `github`, `gitlab` или `bitbucket`
     provider: 'github'
   }, {
     scopes: 'repo gist'
   })
   if (error) throw error
   // для доступа к `API` провайдера используется `session.provider_token`
   return { user, session }
 } catch (e) {
   throw e
 }
}
```

__Выход из системы__

Для выхода из системы используется метод `signOut`:

```js
async function logoutUser() {
 try {
   const { error } = await supabase.auth.signOut()
   if (error) throw error
 } catch (e) {
   throw e
 }
}
```

Для того, чтобы сообщить серверу о необходимости завершения сессии используется метод `auth.api.signOut(jwt)`.

__Сессия__

Метод `session` используется для получения данных активной сессии:

```js
const session = supabase.auth.session()
```

__Пользователь__

Метод `user` возвращает данные авторизованного пользователя:

```js
const user = supabase.auth.user()
```

В данном случае возвращается объект из локального хранилища.

Для получения данных пользователя из БД используется метод `auth.api.getUser(jwt)`.

На стороне сервера для этого используется метод `auth.api.getUserByCookie`.

__Обновление данных пользователя__

Для обновления данных пользователя используется метод `update`:

```js
async function updateUser({ age }) {
 try {
   const { user, error } = await supabase.auth.update({
     data: {
       age
     }
   })
   if (error) throw error
   return user
 } catch (e) {
   throw e
 }
}
```

_Обратите внимание_: можно обновлять либо основные данные (`email`, `password`), либо дополнительные (`data`).

__Регистрация изменения состояния авторизации__

```js
supabase.auth.onAuthStateChange((event, session) => {
 console.log(event, session)
})
```

__Сброс пароля__

```js
const { data, error } = supabase.auth.api.resetPasswordForEmail(email, { redirectTo: window.location.origin })
```

После вызова этого метода на email пользователя отправляется ссылка для сброса пароля. Когда пользователь кликает по ссылке, он переходит по адресу: `SITE_URL/#access_token=X&refresh_token=Y&expires_in=Z&token_type=bearer&type=recovery`. Мы регистрируем `type=recovery` и отображаем форму для сброса пароля. Затем используем `access_token` из `URL` и новый пароль для обновления пользовательских данных:

```js
async function resetPassword(access_token, new_password) {
 try {
   const { data, error } = await supabase.auth.api.updateUser(access_token, { password: new_password })
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

# База данных (Database)

__Извлечение (выборка) данных__

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .select(column_names, options)
```

- `table_name` - название таблицы (обязательно);
- `column_names` - список разделенных через запятую названий колонок (столбцов) или `'*'` для выборки всех полей;
- `options` - дополнительные настройки:
 - `head` - если имеет значение `true`, данные аннулируются (см. пример ниже);
 - `count` - алгоритм для подсчета количества строк в таблице: `null | exact | planned | estimated`.

Пример:

```js
async function getUsers() {
 try {
   const { data, error } = await supabase
     .from('users')
     .select('id, first_name, last_name, age, email')
   if (error) throw error
   return data
 } catch (e) {
   throw(e)
 }
}
```

По умолчанию максимальное количество возвращаемых строк равняется `1000`. Это можно изменить в настройках.

`select()` может использоваться совместно с модификаторами и фильтрами (будут рассмотрены позже).

_Получение данных из связанных таблиц_

```js
async function getUsersAndPosts() {
 try {
   const { data, error } = await supabase
     .from('users')
     .select(`
       id,
       first_name,
       last_name,
       age,
       email,
       posts (
         id,
         title,
         content
       )
     `)
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

_Фильтрация данных с помощью внутреннего соединения (inner join)_

Предположим, что мы хотим извлечь сообщения (messages), принадлежащие пользователю с определенным именем (username):

```js
async function getMessagesByUsername(username) {
 try {
   const { data, error } = await supabase
     .from('messages')
     // для такой фильтрации используется функция `!inner()`
     .select('*, users!inner(*)')
     .eq('users.username', username)
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

_Получение количества строк_

```js
async function getUsersAndUserCount() {
 try {
   const { data, error, count } = await supabase
     .from('users')
     // для получения только количества строк используется `{ count: 'exact', head: true }`
     .select('id, first_name, last_name, email', { count: 'exact' })
   if (error) throw error
   return { data, count }
 } catch(e) {
   throw e
 }
}
```

_Получение данных из `JSONB-столбцов`_

```js
async function getUsersWithTheirCitiesByCountry(country) {
 try {
   const { data, error } = await supabase
     .from('users')
     .select(`
       id, first_name, last_name, email,
       address->city
     `)
     .eq('address->country', country)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

_Получение данных в формате `CSV`_

```js
async function getUsersInCSV() {
 try {
   const { data, error } = await supabase
     .from('users')
     .select()
     .csv()
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

__Запись (добавление, вставка) данных__

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .insert(data_array, options)
```

- `table_name` - название таблицы;
- `data_array` - массив записываемых данных;
- `options` - дополнительные настройки, например:
 - `returning: 'minimal'` - не возвращать данные после записи;
 - `upsert: true` - обновить существующую строку вместо создания новой.

Пример:

```js
async function createPost({ title, body, author_id }) {
 try {
   const { data, error } = await supabase
     .from('posts')
     .insert([{
       title, body, author_id
     }])

   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

Разумеется, можно создавать несколько записей одновременно:

```js
// предположим, что `messages` - массив объектов `{ title, body, user_id, room_id }`
async function saveMessagesForRoom(messages) {
 try {
   const { error } = await supabase
     .from('messages')
     .insert(messages, { returning: 'minimal' })
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

_Обратите внимание_: для обновления строк с помощью `upsert: true` данные должны содержать `первичные или основные ключи/primary keys` соответствующей таблицы.

__Модификация данных__

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .update({ column_name: 'column_value' }, options)
 .match(condition)
```

- `table_name` - название таблицы;
- `column_name: 'column_value'` - название обновляемой колонки и ее новое значение;
- `options` - дополнительные настройки:
 - `returning` - определяет, возвращаются ли данные после обновления: `minimal | presentation`;
 - `count` - алгоритм для подсчета количества обновленных строк;
- `condition` - условие для поиска обновляемой колонки.

Пример:

```js
async function updateUser({ changes, user_id }) {
 try {
   const { data, error } = await supabase
     .from('users')
     .update({ ...changes })
     .match({ id: user_id })
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

_Обратите внимание_: метод `update` должен всегда использоваться совместно с фильтрами.

_Пример обновления `JSON-колонки`_

```js
async function updateUsersCity({ address, user_id }) {
 try {
   const { error } = await supabase
     .from('users')
     .update(`address: ${address}`, { returning: 'minimal' })
     .match({ id: user_id })
   if (error) throw error
 } catch (e) {
   throw e
 }
}
```

В настоящее время поддерживается обновление только объекта целиком.

_Модификация или запись данных_

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .upsert({ primary_key_name: 'primary_key_value', column_name: 'column_value' }, options)
```

- `options` - дополнительные настройки:
 - `returning`;
 - `count`;
 - `onConflict: string` - позволяет работать с колонками, имеющими ограничение `UNIQUE`;
 - `ignoreDuplicates: boolean` - определяет, должны ли игнорироваться дубликаты.

Пример:

```js
async function updateOrCreatePost({ id, title, body, author_id }) {
 try {
   const { data, error } = await supabase
     .from('posts')
     .upsert({ id, title, body, author_id })
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

Разумеется, можно обновлять или создавать несколько записей за раз.

_Обратите внимание_ на 2 вещи:

- данные должны содержать первичные ключи;
- первичные ключи могут быть только натуральными (не суррогатными).

__Удаление данных__

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .delete(options)
 .match(condition)
```

- `options`:
 - `returning`;
 - `count`.

Пример:

```js
async function removeUser(user_id) {
 try {
   const { error } = await supabase
     .from('users')
     .delete({ returning: 'minimal' })
     .match({ id: user_id })
   if (error) throw error
 } catch (e) {
   throw e
 }
}
```

__Вызов функций Postgres__

Сигнатура:

```js
const { data, error } = await supabase
 .rpc(fn, params, options)
```

- `fn` - название функции;
- `params` - параметры, передаваемые функции;
- `options`:
 - `head`;
 - `count`.

Предположим, что мы определили такую функцию:

```sql
CREATE FUNCTION check_password(username_or_email TEXT, password_hash TEXT)
RETURNS BOOLEAN AS
$$
DECLARE is_password_correct BOOLEAN;
BEGIN
 SELECT (hashed_password = $2) INTO is_password_correct
 FROM users
 WHERE username = $1 OR email = $1;
 RETURN is_password_correct;
END;
$$
LANGUAGE plpgsql
```

Данную функцию можно вызвать следующим образом:

```js
async function checkPassword(username_or_email, password) {
 let password_hash
 try {
   password_hash = await bcrypt.hash(password, 10)
 } catch (e) {
   throw e
 }

 try {
   const { data, error } = await supabase
     .rpc('check_password', { username_or_email, password_hash })
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Метод `rpc` может использоваться совместно с модификаторами и фильтрами, например:

```js
const { data, error } = await supabase
 .rpc('get_all_cities')
 .select('city_name', 'population')
 .eq('city_name', 'The Shire')
```

### Модификаторы (Modifiers)

Модификаторы используются в запросах на выборку данных (`select`). Они также могут использоваться совместно с методом `rpc`, когда он возвращает таблицу.

__`limit()`__

Модификатор `limit` ограничивает количество возвращаемых строк.

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .select(column_names)
 .limit(count, options)
```

- `count`: количество возвращаемых строк;
- `options`:
 - `foreignTable`: внешняя таблица (для колонок с внешним ключом).

Пример:

```js
async function getTop10Users() {
 try {
   const { data, error } = await supabase
     .from('users')
     .select('id, user_name, email')
     .limit(10)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Пример с внешней таблицей:

```js
async function getTop10CitiesByCountry(country_name) {
 try {
   const { data, error } = await supabase
     .from('countries')
     .select('country_name, cities(city_name)')
     .eq('country_name', 'Rus')
     .limit(10, { foreignTable: 'cities' })
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

__`order()`__

Модификатор `order` сортирует строки в указанном порядке.

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .select(column_names)
 .order(column_name, options)
```

- `column_name`: название колонки, по которой выполняется сортировка;
- `options`:
 - `ascending`: если имеет значение `true`, сортировка выполняется по возрастанию;
 - `nullsFirst`: если `true`, колонки со значением `null` идут впереди;
 - `foreignTable`: название внешней таблицы.

Пример:

```js
async function getMostLikedPosts(limit) {
 try {
   const { data, error } = await supabase
     .from('posts')
     .select()
     .order('like_count', { ascending: true })
     .limit(limit)
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

__`range()`__

Модификатор `range` возвращает диапазон строк (включительно).

Сигнатура:

```js
const { data, error } = await supabase
 .from(table_name)
 .select(column_names)
 .range(start, end, options)
```

- `start`: начало диапазона;
- `end`: конец диапазона;
- `options`:
 - `foreignTable`.

Пример:

```js
async function getPostSlice(from, to) {
 try {
   const { data, error } = await supabase
     .from('posts')
     .select()
     .range(from, to)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

__`single()`__

Модификатор `single` возвращает одну строку.

Пример:

```js
async function getUserById(user_id) {
 try {
   // в данном случае мы получим объект вместо массива
   const { data, error } = await supabase
     .from('users')
     .select('id, user_name, email')
     .eq('id', user_id)
     .single()
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Существует также модификатор `maybeSingle`, возвращающий хотя бы одну строку.

### Фильтры (Filters)

Фильтры могут использоваться в запросах `select`, `update` и `delete`, а также в методе `rpc`, когда функция возвращает таблицу.

Фильтры должны применяться в конце запроса. Их можно объединять в цепочки и применять условно.

Примеры:

```js
const { data, error } = await supabase
 .from('cities')
 .select()
 .eq('id', '1342')
 .single()

const { data, error } = await supabase
 .from('cities')
 .select()
 .gte('population', 1000)
 .lt('population', 10000)

const filterByName = null
const filterPopLow = 1000
const filterPopHigh = 10000

let query = supabase
 .from('cities')
 .select()

if (filterByName)  { query = query.eq('name', filterByName) }
if (filterPopLow)  { query = query.gte('population', filterPopLow) }
if (filterPopHigh) { query = query.lt('population', filterPopHigh) }

const { data, error } = await query
```

Виды фильтров:

- `or('filter1, filter2, ...filterN', { foreignTable })` - значение колонки должно удовлетворять хотя бы одному условию, например: `or('population.gt.1000, population.lte.100000')`; может использоваться в сочетании с фильтром `and`;
- `not(column_name, operator, value)` - значение колонки не должно удовлетворять условию, например: `not('population', 'gte', 100000)`;
- `match(query)` - строка должна точно соответствовать объекту, например: `match({ user_name: 'Harry', life_style: 'webdev' })`;
- `eq(column_name, column_value)` - строка должна соответствовать условию, например: `eq('user_name', 'Harry')`
- `neq(column_name, column_value)` - противоположность `eq`;
- `gt(column_name, value)` - строка должна содержать колонку, которая имеет значение, большее чем указанное (greater than), например: `gt('age', 17)`;
- `gte(column_name, value)`, `lt(column_name, value)`, `lte(column_name, value)` - больше или равно, меньше и меньше или равно, соответственно;
- `like(column_name, pattern)` и `ilike(column_name, pattern)` - возвращает все строки, значения указанной колонки которых совпадает с паттерном (шаблоном), например, `like('user_name', '%oh%')` ;
- `is(column_name, value)` - значение колонки должно точно совпадать с указанным значением, например, `is('married', false)`;
- `in(column_name, column_value[])` - значение колонки должно совпадать хотя бы с одним из указанных в виде массива значений, например, `in('city_name', ['Paris', 'Tokyo'])`;
- `contains(column_name, [column_value])` - `contains('main_lang', ['javascript'])`;
- `overlaps(column_name, column_value[])` - `overlaps('hobby', ['code', 'guitar'])`;
- `textSearch(column_name, query, options)` - возвращает все строки, значения указанной колонки которой соответствуют запросу `to_tsquery`, например:

```js
const { data, error } = await supabase
 .from('quotes')
 .select('catchphrase')
 .textSearch('catchphrase', `'fat' & 'cat'`, {
   config: 'english'
 })
```

Настройки также принимают второй параметр `type`, возможными значениями которого являются `plain` и `phrase`, определяющие базовую и полную нормализацию, соответственно.

- `filter(column_name, operator, value)` - значение колонки должно удовлетворять фильтру. `filter` должен использоваться в последнюю очередь, когда других фильтров оказалось недостаточно:

```js
const { data, error } = await supabase
 .from('cities')
 .select('city_name, countries(city_name)')
 .filter('countries.city_name', 'in', '("France", "Japan")')
```

Также имеется несколько других (более специфичных) фильтров.

### Хранилище (Storage)

Для _создания_ файлового хранилища используется метод `createBucket`:

```js
async function createAvatarBucket() {
 try {
   const { data, error } = await supabase
     .storage
     // createBucket(id, options)
     .createBucket('avatars', { public: false })
   if (error) throw error
   return data
 } catch (e) {
   throw e
 }
}
```

Для создания хранилища требуются следующие разрешения (permissions policy):

- `buckets`: `insert`;
- `objects`: `none`.

В `Supabase` безопасность работы с данными и файлами обеспечивается установкой и настройкой [row level security](https://postgrespro.ru/docs/postgrespro/9.6/ddl-rowsecurity) (политик защиты строк). Мы рассмотрим их в следующей статье.

Для _получения данных_ о хранилище используется метод `getBucket`:

```js
const { data, error } = await supabase
 .storage
 // getBucket(id)
 .getBucket('avatars')
```

Требуются следующие разрешения:

- `buckets`: `select`;
- `objects`: `none`.

Для _получения списка_ хранилищ используется метод `listBuckets`:

```js
const { data, error } = await supabase
 .storage
 .listBuckets()
```

Требуются аналогичные разрешения.

Для обновления хранилища используется метод `updateBucket(id, options)` (разрешение `buckets`: `update`), а для удаления - метод `deleteBucket(id)` (`buckets`: `select` и `delete`).

_Обратите внимание_: непустое хранилище не может быть удалено без его предварительной очистки с помощью метода `emptyBucket(id)` (`buckets`: `select`, `objects`: `select` и `delete`).

__Загрузка файлов__

Для загрузки файлов в хранилище используется метод `upload`.

_Сигнатура_

```js
await supabase
 .storage
 .from(bucket_name)
 .upload(path, file, options)
```

- `bucket_name` - названия хранилища;
- `path` - относительный путь к файлу. Должен иметь формат `folder/subfolder/fileName.fileExtension`. Разумеется, записывать файлы можно только в существующие хранилища;
- `file` - загружаемый в хранилище файл: ArrayBuffer | ArrayBufferView | Blob | Buffer | File | FormData | ReadableStream | URLSearchParams | string (т.е. практически что угодно);
- `options` - дополнительные настройки:
 - `cacheControl`: HTTP-заголовок `Cache-Control`;
 - `contentType`: тип содержимого, по умолчанию имеет значение `text/plain;charset=utf-8`;
 - `upsert`: логический индикатор вставки (upsert) файла.

Разрешения:

- `buckets`: `none`;
- `objects`: `insert`.

_Пример_

```js
async function uploadAvatar({ userId, file }) {
 // получаем расширение файла
 const fileExt = file.name.split('.')[1]
 try {
   const { data, error } = await supabase
     .storage
     .from('users')
     .upload(`avatars/${userId}.${fileExt}`, file, {
       cacheControl: '3600',
       upsert: false
     })
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

__Скачивание файлов__

Для скачивания файлов используется метод `download`:

```js
async function downloadFile({ bucketName, filePath }) {
 try {
   const { data, error } = await supabase
     .storage
     .from(bucketName)
     .download(filePath)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select`.

__Получение списка файлов__

Для получения списка файлов используется метод `list`.

_Сигнатура_

```js
list(dir_name, options, parameters)
```

- `dir_name`: название директории;
- `options`:
 - `limit`: количество возвращаемых файлов;
 - `offset`: количество пропускаемых файлов;
 - `sortBy`:
   - `column_name`: название колонки для сортировки;
   - `order`: порядок сортировки.
- `parameters`:
 - `signal`: [`AbortController.signal`](https://developer.mozilla.org/ru/docs/Web/API/AbortController/signal).

_Пример_

```js
async function getAvatars({ limit = 100, offset = 0, sortBy = { column: 'name', order: 'asc' } }) {
 try {
   const { data, error } = await supabase
     .storage
     .from('users')
     .list('avatars', {
       limit,
       offset,
       sortBy
     })
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select`.

__Обновление файлов__

Для обновления файлов используется метод `update`.

_Сигнатура_

```js
update(path, file, options)
```

- `options`: настройки, аналогичные передаваемым `upload`.

_Пример_

```js
const defaultUpdateAvatarOptions = { cacheControl: '3600', upsert: false }
async function updateAvatar({ filePath, file, options = defaultUpdateAvatarOptions }) {
 try {
   const { data, error } = await supabase
     .storage
     .from('users')
     .update(`avatars/${filePath}`, file, options)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select` и `update`.

Для перемещения файла с его опциональным переименованием используется метод `move`:

```js
const { data, error } = await supabase
 .storage
 .from('avatars')
 .move('public/avatar1.png', 'private/moved_avatar.png')
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select` и `update`.

__Удаление файлов__

Для удаления файлов используется метод `remove`:

```js
// список удаляемых файлов - массив `filePathArr`
async function removeFile({ bucketName, filePathArr }) {
 try {
   const { data, error } = await supabase
     .storage
     .from(bucketName)
     .remove(filePathArr)
   if (error) throw error
   return data
 } catch(e) {
   throw e
 }
}
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select` и `delete`.

__Формирование пути к файлу__

Для формирования пути к файлу без разрешения используется метод `createSignedUrl`:

```js
createSignedUrl(path, expiresIn)
```

- `expiresIn` - количество секунд, в течение которых ссылка считается валидной.

```js
async function getSignedUrl({ bucketName, filePath, expiresIn = 60 }) {
 try {
   const { signedUrl, error } = await supabase
     .storage
     .from(bucketName)
     .createSignedUrl(filePath, expiresIn)
   if (error) throw error
   return signedUrl
 } catch(e) {
   throw e
 }
}
```

Разрешения:

- `buckets`: `none`;
- `objects`: `select`.

Для формирования пути к файлу, находящемуся в публичной директории, используется метод `getPublicUrl`:

```js
async function getFileUrl({ bucketName, filePath }) {
 try {
   const { publicUrl, error } = supabase
     .storage
     .from(bucketName)
     .getPublicUrl(filePath)
   if (error) throw error
   return publicUrl
 } catch(e) {
   throw e
 }
}
```

Разрешения не требуются.

### Обработка модификации данных в режиме реального времени (Realtime)

__Подписка на изменения__

Для подписки на изменения, происходящие в БД, используется метод `subscribe` в сочетании с методом `on`.

_Сигнатура_

```js
const subscription = supabase
 .from(table_name)
 .on(event, callback)
```

- `event` - регистрируемое событие. Для регистрации всех событий используется `'*'`;
- `callback` - функция обработки полезной нагрузки.

_Обратите внимание_:

- `realtime` отключена по умолчанию для новых проектов по причинам производительности и безопасности;
- для того, чтобы получать "предыдущие" данные для обновлений и удалений, необходимо установить `REPLICA IDENTITY` в значение `FULL`, например: `ALTER TABLE table_name REPLICA IDENTITY FULL;`.

_Примеры_

Регистрация всех изменений всех таблиц:

```js
const subscription = supabase
 .from('*')
 .on('*', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Регистрация изменений определенной таблицы:

```js
const subscription = supabase
 .from('posts')
 .on('*', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Регистрация записи данных в определенную таблицу:

```js
const subscription = supabase
 .from('posts')
 // INSERT | UPDATE | DELETE
 .on('INSERT', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Обработчики можно объединять в цепочки:

```js
const subscription = supabase
 .from('posts')
 .on('INSERT', insertHandler)
 .on('DELETE', deleteHandler)
 .subscribe()
```

Имеется возможность регистрации изменений определенных строк. Синтаксис:

```bash
table_name:column_name=eq.value
```

- `table_name`: название таблицы;
- `column_name`: название колонки;
- `value`: значение, которое должна содержать колонка.

```js
const subscription = supabase
 .from('countries.id=eq.123')
 .on('UPDATE', onUpdate)
 .subscribe()
```

__Отписка от изменений__

Метод `removeSubscription` удаляет активную подписку и возвращает количество открытых соединений.

```js
supabase.removeSubscription(subscription_name)
```

- `subscription_name` - название подписки.

Для удаления всех подписок и закрытия `WebSocket-соединения` используется метод `removeAllSubscriptions`.

__Получение списка подписок__

Для получения списка подписок используется метод `getSubscriptions`.

```js
const allSubscriptions = supabase.getSubscriptions()
```

## Разработка приложения

### Подготовка и настройка проекта

_Обратите внимание_: для разработки клиента я буду использовать [React](https://ru.reactjs.org/), но вы можете использовать свой любимый `JS-фреймворк` - функционал, связанный с `Supabase`, будет что называется `framework agnostic`. Также _обратите внимание_, что разработанное нами приложение не будет `production ready`, однако, по-возможности, я постараюсь акцентировать ваше внимание на необходимых доработках.

Создаем шаблон проекта с помощью [Vite](https://vitejs.dev/):

```bash
# supabase-social-app - название приложения
# --template react - используемый шаблон
yarn create vite supabase-social-app --template react
```

Регистрируемся или авторизуемся на [supabase.com](https://supabase.com/) и создаем новый проект:

<img src="https://habrastorage.org/webt/vy/nq/sr/vynqsroie4_pfj5uafccto74u1m.png" />
<br />

<img src="https://habrastorage.org/webt/j9/n-/sk/j9n-sk5svcil9pydtehwwf83hcu.png" />
<br />

Копируем ключ и `URL` на главной странице панели управления проектом:

<img src="https://habrastorage.org/webt/ce/e8/ig/cee8ig38ny_za1mfgyedf061apm.png" />
<br />

Записываем их в переменные среды окружения. Для этого создаем в корневой директории проекта (`supabase-social-app`) файл `.env` следующего содержания:

```bash
VITE_SUPABASE_URL=https://your-url.supabase.co
VITE_SUPABASE_KEY=your-key
```

_Обратите внимание_: префикс `VITE_` в данном случае является обязательным.

На странице `Authentication` панели управления в разделе `Settings` отключаем необходимость подтверждения адреса электронной почты новым пользователем (`Enable email confirmation`):

<img src="https://habrastorage.org/webt/4s/a2/sv/4sa2svpaiz51tai2hkxrucpw9vo.png" />
<br />

_Обратите внимание_: при разработке нашего приложения мы пропустим шаг подтверждения пользователями своего `email` после регистрации в целях экономии времени. В реальном приложении в объекте `user` будет содержаться поле `isEmailConfirmed`, например - индикатор того, подтвердил ли пользователь свой `email`. Значение данного поля будет определять логику работы приложения в части авторизации.

В базе данных нам потребуется 3 таблицы:

- `users` - пользователи;
- `posts` - посты пользователей;
- `comments` - комментарии к постам.

`Supabase` предоставляет графический интерфейс для работы с таблицами на странице `Table Editor`:

<img src="https://habrastorage.org/webt/vt/sv/01/vtsv01him07-j_t8opbcf0uthsy.png" />
<br />

Но мы воспользуемся редактором [SQL](https://ru.wikipedia.org/wiki/SQL) на странице `SQL Editor` (потому что не ищем легких путей)). Создаем новый запрос (`New query`) и вставляем такой `SQL`:

```sql
CREATE TABLE users (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL,
  first_name text,
  last_name text,
  age int,
  avatar_url text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  user_id text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  content text NOT NULL,
  user_id text NOT NULL,
  post_id int NOT NULL,
  created_at timestamp DEFAULT now()
);
```

_Обратите внимание_: мы не будем использовать внешние ключи (`FOREIGN KEY`) в полях `user_id` и `post_id`, поскольку это усложнит работу с `Supabase` на клиенте и потребует реализации дополнительной логики, связанной с редактированием и удалением связанных таблиц (`ON UPDATE` и `ON DELETE`).

Нажимаем на кнопку `Run`:

<img src="https://habrastorage.org/webt/e1/pr/hg/e1prhg0cepvhxpbzttfqb9nkpd0.png" />
<br />

Мы можем увидеть созданные нами таблицы на страницах `Table Editor` и `Database` панели управления:

<img src="https://habrastorage.org/webt/hh/lf/az/hhlfaz0juvuueylxwkpw70ldylq.png" />
<br />

<img src="https://habrastorage.org/webt/pi/7a/ye/pi7ayenyuqulz8jy_hy2lqtado8.png" />
<br />

_Обратите внимание_ на предупреждение `RLS not enabled` на странице `Table Editor`. Для доступа к таблицам рекомендуется устанавливать политики безопасности на уровне строк/политики защиты строк ([Row Level Security](https://postgrespro.ru/docs/postgresql/14/ddl-rowsecurity)). Для таблиц мы этого делать не будем, но нам придется сделать это для хранилища, в котором будут находиться аватары пользователей.

Создаем новый "бакет" на странице `Storage` панели управления (`Create new bucket`):

<img src="https://habrastorage.org/webt/rb/wx/dh/rbwxdhlc-ne6uycyhm2voc2kfke.png" />
<br />

Делаем его публичным (`Make public`):

<img src="https://habrastorage.org/webt/fn/sd/rv/fnsdrvpmmmqtrd8uc09ovcwsbgw.png" />
<br />

В разделе `Policies` создаем новую политику (`New policy`). Выбираем шаблон `Give users access to a folder only to authenticated users` (предоставление доступа к директории только для аутентифицированных пользователей) - `Use this template`:

<img src="https://habrastorage.org/webt/xv/rb/hp/xvrbhpcrhrlysu9rt2kywcpoyr0.png" />
<br />

Выбираем `SELECT`, `INSERT` и `UPDATE` и немного редактируем определение политики:

<img src="https://habrastorage.org/webt/fp/mc/js/fpmcjsj4bc5tksmnro6zwq31kiw.png" />
<br />

Нажимаем `Review` и затем `Create policy`.

Последнее, что нам осталось сделать для настройки проекта - включить регистрацию изменений данных для всех таблиц.

По умолчанию `Supabase` создает публикацию (`publication`) `supabase_realtime`. Нам нужно только добавить в нее наши таблицы. Для этого переходим в редактор `SQL` и вставляем такую строку:

```sql
alter publication supabase_realtime
add table users, posts, comments;
```

Нажимаем `RUN`.

Устанавливаем несколько дополнительных зависимостей для клиента:

```bash
# производственные зависимости
yarn add @supabase/supabase-js dotenv react-icons react-router-dom zustand

# зависимость для разработки
yarn add -D sass
```

- [@supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js) - `SDK` для взаимодействия с `Supabase`;
- [dotenv](https://www.npmjs.com/package/dotenv) - утилита для доступа к переменным среды окружения;
- [react-icons](https://react-icons.github.io/react-icons/) - большая коллекция иконок в виде `React-компонентов`;
- [react-router-dom](https://reactrouter.com/docs/en/v6/getting-started/overview) - библиотека для маршрутизации в `React-приложениях`;
- [zustand](https://github.com/pmndrs/zustand) - инструмент для управления состоянием `React-приложений`;
- [sass](https://sass-scss.ru/) - `CSS-препроцессор`.

На этом подготовка и настройка проекта завершены. Переходим к разработке клиента.

### Клиент

Структура директории `src` будет следующей:

```
- api - `API` для взаимодействия с `Supabase`
  - comment.js
  - db.js
  - post.js
  - user.js
- components - компоненты
  - AvatarUploader.jsx - для загрузки аватара пользователя
  - CommentList.jsx - список комментариев
  - Error.jsx - ошибка (не надо так делать в продакшне))
  - Field.jsx - поле формы
  - Form.jsx - форма
  - Layout.jsx - макет страницы
  - Loader.jsx - индикатор загрузки
  - Nav.jsx - панель навигации
  - PostList.jsx - список постов
  - PostTabs.jsx - вкладки постов
  - Protected.jsx - защищенная страница
  - UserUpdater.jsx - для обновления данных пользователя
- hooks - хуки
  - useForm.js - для формы
  - useStore.js - для управления состоянием приложения
- pages - страницы
  - About.jsx
  - Blog.jsx - для всех постов
  - Home.jsx
  - Login.jsx - для авторизации
  - Post.jsx - для одного поста
  - Profile.jsx - для профиля пользователя
  - Register.jsx - для регистрации
- styles - стили
- supabase
  - index.js - создание и экспорт клиента `Supabase`
- utils - утилиты
  - serializeUser.js
- App.jsx - основной компонент приложения
- main.jsx - основной файл клиента
```

С вашего позволения, я не буду останавливаться на стилях: там нет ничего особенного, просто скопируйте их из репозитория.

Настроим алиасы (alias - синоним) для облегчения импорта компонентов в `vite.config.js`:

```javascript
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// абсолютный путь к текущей директории
const _dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(_dirname, './src'),
      a: resolve(_dirname, './src/api'),
      c: resolve(_dirname, './src/components'),
      h: resolve(_dirname, './src/hooks'),
      p: resolve(_dirname, './src/pages'),
      s: resolve(_dirname, './src/supabase'),
      u: resolve(_dirname, './src/utils')
    }
  }
})
```

Начнем создание нашего клиента с разработки `API`.

#### API

Для работы `API` нужен клиент для взаимодействия с `Supabase`.

Создаем и экспортируем его в `supabase/index.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  // такой способ доступа к переменным среды окружения является уникальным для `vite`
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

export default supabase
```

`API` для работы со всеми таблицами базы данных (`api/db.js`):

```javascript
import supabase from 's'

// метод для получения данных из всех таблиц
async function fetchAllData() {
  try {
    // пользователи
    const { data: users } = await supabase
      .from('users')
      .select('id, email, user_name')
    // посты
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, content, user_id, created_at')
    // комментарии
    const { data: comments } = await supabase
      .from('comments')
      .select('id, content, user_id, post_id, created_at')
    return { users, posts, comments }
  } catch (e) {
    console.error(e)
  }
}

const dbApi = { fetchAllData }

export default dbApi
```

Утилита для сериализации объекта пользователя (`utils/serializeUser.js`):

```javascript
const serializeUser = (user) =>
  user
    ? {
        id: user.id,
        email: user.email,
        ...user.user_metadata
      }
    : null

export default serializeUser
```

Все данные пользователей, указываемые при регистрации, кроме `email` и `password`, записываются в поле `user_metadata`, что не очень удобно.

`API` для работы с таблицей `users` - пользователи (`api/user.js`):

```javascript
import supabase from 's'
import serializeUser from 'u/serializeUser'

// метод для получения данных пользователя из базы при наличии аутентифицированного пользователя
// объект, возвращаемый методом `auth.user`, извлекается из локального хранилища
const get = async () => {
  const user = supabase.auth.user()
  if (user) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .match({ id: user.id })
        .single()
      if (error) throw error
      console.log(data)
      return data
    } catch (e) {
      throw e
    }
  }
  return null
}

// метод для регистрации пользователя
const register = async (data) => {
  const { email, password, user_name } = data
  try {
    // регистрируем пользователя
    const { user, error } = await supabase.auth.signUp(
      // основные/обязательные данные
      {
        email,
        password
      },
      // дополнительные/опциональные данные
      {
        data: {
          user_name
        }
      }
    )
    if (error) throw error
    // записываем пользователя в базу
    const { data: _user, error: _error } = await supabase
      .from('users')
      // сериализуем объект пользователя
      .insert([serializeUser(user)])
      .single()
    if (_error) throw _error
    return _user
  } catch (e) {
    throw e
  }
}

// метод для авторизации пользователя
const login = async (data) => {
  try {
    // авторизуем пользователя
    const { user, error } = await supabase.auth.signIn(data)
    if (error) throw error
    // получаем данные пользователя из базы
    const { data: _user, error: _error } = await supabase
      .from('users')
      .select()
      .match({ id: user.id })
      .single()
    if (_error) throw _error
    return _user
  } catch (e) {
    throw e
  }
}

// метод для выхода из системы
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return null
  } catch (e) {
    throw e
  }
}

// метод для обновления данных пользователя
const update = async (data) => {
  // получаем объект с данными пользователя
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data: _user, error } = await supabase
      .from('users')
      .update(data)
      .match({ id: user.id })
      .single()
    if (error) throw error
    return _user
  } catch (e) {
    throw e
  }
}

// метод для сохранения аватара пользователя
// см. ниже

const userApi = { get, register, login, logout, update, uploadAvatar }

export default userApi
```

Метод для сохранения аватара пользователя:

```javascript
// адрес хранилища
const STORAGE_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/`

// метод принимает файл - аватар пользователя
const uploadAvatar = async (file) => {
  const user = supabase.auth.user()
  if (!user) return
  const { id } = user
  // извлекаем расширение из названия файла
  // метод `at` появился в `ECMAScript` в этом году
  // он позволяет простым способом извлекать элементы массива с конца
  const ext = file.name.split('.').at(-1)
  // формируем название аватара
  const name = id + '.' + ext
  try {
    // загружаем файл в хранилище
    const {
      // возвращаемый объект имеет довольно странную форму
      data: { Key },
      error
    } = await supabase.storage.from('avatars').upload(name, file, {
      // не кешировать файл - это важно!
      cacheControl: 'no-cache',
      // перезаписывать аватар при наличии
      upsert: true
    })
    if (error) throw error
    // формируем путь к файлу
    const avatar_url = STORAGE_URL + Key
    // обновляем данные пользователя -
    // записываем путь к аватару
    const { data: _user, error: _error } = await supabase
      .from('users')
      .update({ avatar_url })
      .match({ id })
      .single()
    if (_error) throw _error
    // возвращаем обновленного пользователя
    return _user
  } catch (e) {
    throw e
  }
}
```

`API` для работы с таблицей `posts` - посты (`api/post.js`):

```javascript
import supabase from 's'

// метод для создания поста
const create = async (postData) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .single()
    if (error) throw error
    return data
  } catch (e) {
    throw e
  }
}

// для обновления поста
const update = async (data) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data: _data, error } = await supabase
      .from('posts')
      .update({ ...postData })
      .match({ id: data.id, user_id: user.id })
    if (error) throw error
    return _data
  } catch (e) {
    throw e
  }
}

// для удаления поста
const remove = async (id) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    // удаляем пост
    const { error } = await supabase
      .from('posts')
      .delete()
      .match({ id, user_id: user.id })
    if (error) throw error
    // удаляем комментарии к этому посту
    const { error: _error } = await supabase
      .from('comments')
      .delete()
      .match({ post_id: id })
    if (_error) throw _error
  } catch (e) {
    throw e
  }
}

const postApi = { create, update, remove }

export default postApi
```

`API` для работы с таблицей `comments` - комментарии (`api/comment.js`):

```javascript
import supabase from 's'

// метод для создания комментария
const create = async (commentData) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ ...commentData, user_id: user.id }])
      .single()
    if (error) throw error
    return data
  } catch (e) {
    throw e
  }
}

// для обновления комментария
const update = async (commentData) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ ...commentData })
      .match({ id: commentData.id, user_id: user.id })
    if (error) throw error
    return data
  } catch (e) {
    throw e
  }
}

// для удаления комментария
const remove = async (id) => {
  const user = supabase.auth.user()
  if (!user) return
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .match({ id, user_id: user.id })
    if (error) throw error
  } catch (e) {
    throw e
  }
}

const commentApi = { create, update, remove }

export default commentApi
```

### Хуки

Для управления состоянием нашего приложения мы будем использовать `zustand`, который позволяет создавать хранилище в форме хука.

Создаем хранилище в файле `hooks/useStore.js`:

```javascript
import create from 'zustand'
import dbApi from 'a/db'
import postApi from 'a/post'

const useStore = create((set, get) => ({
  // состояние загрузки
  loading: true,
  // функция для его обновления
  setLoading: (loading) => set({ loading }),
  // состояние ошибки
  error: null,
  // функция для его обновления
  setError: (error) => set({ loading: false, error }),
  // состояние пользователя
  user: null,
  // функция для его обновления
  setUser: (user) => set({ user }),

  // пользователи
  users: [],
  // посты
  posts: [],
  // комментарии
  comments: [],

  // мы можем "тасовать" наши данные как угодно,
  // например, так:
  // объект постов с доступом по `id` поста
  postsById: {},
  // объект постов с доступом по `id` пользователя
  postsByUser: {},
  // карта "имя пользователя - `id` поста"
  userByPost: {},
  // объект комментариев с доступом по `id` поста
  commentsByPost: {},
  // массив всех постов с авторами и количеством комментариев
  allPostsWithCommentCount: [],
  // далее важно определить правильный порядок формирования данных

  // формируем объект комментариев с доступом по `id` поста
  getCommentsByPost() {
    const { users, posts, comments } = get()
    const commentsByPost = posts.reduce((obj, post) => {
      obj[post.id] = comments
        .filter((comment) => comment.post_id === post.id)
        .map((comment) => ({
          ...comment,
          // добавляем в объект автора
          author: users.find((user) => user.id === comment.user_id).user_name
        }))
      return obj
    }, {})
    set({ commentsByPost })
  },
  // формируем карту "имя пользователя - `id` поста"
  getUserByPost() {
    const { users, posts } = get()
    const userByPost = posts.reduce((obj, post) => {
      obj[post.id] = users.find((user) => user.id === post.user_id).user_name
      return obj
    }, {})
    set({ userByPost })
  },
  // формируем объект постов с доступом по `id` пользователя
  getPostsByUser() {
    // здесь мы используем ранее сформированный объект `commentsByPost`
    const { users, posts, commentsByPost } = get()
    const postsByUser = users.reduce((obj, user) => {
      obj[user.id] = posts
        .filter((post) => post.user_id === user.id)
        .map((post) => ({
          ...post,
          // пользователь может редактировать и удалять свои посты
          editable: true,
          // добавляем в объект количество комментариев
          commentCount: commentsByPost[post.id].length
        }))
      return obj
    }, {})
    set({ postsByUser })
  },
  // формируем объект постов с доступом по `id` поста
  getPostsById() {
    // здесь мы используем ранее сформированные объекты `userByPost` и `commentsByPost`
    const { posts, user, userByPost, commentsByPost } = get()
    const postsById = posts.reduce((obj, post) => {
      obj[post.id] = {
        ...post,
        // добавляем в объект комментарии
        comments: commentsByPost[post.id],
        // и их количество
        commentCount: commentsByPost[post.id].length
      }
      // обратите внимание на оператор опциональной последовательности (`?.`)
      // пользователь может отсутствовать (`null`)

      // если пользователь является автором поста
      if (post.user_id === user?.id) {
        // значит, он может его редактировать и удалять
        obj[post.id].editable = true
      // иначе
      } else {
        // добавляем в объект имя автора поста
        obj[post.id].author = userByPost[post.id]
      }
      return obj
    }, {})
    set({ postsById })
  },
  // формируем массив всех постов с авторами и комментариями
  getAllPostsWithCommentCount() {
    // здесь мы используем ранее сформированные объекты `userByPost` и `commentsByPost`
    const { posts, user, userByPost, commentsByPost } = get()
    const allPostsWithCommentCount = posts.map((post) => ({
      ...post,
      // является ли пост редактируемым
      editable: user?.id === post.user_id,
      // добавляем в объект автора
      author: userByPost[post.id],
      // и количество комментариев
      commentCount: commentsByPost[post.id].length
    }))
    set({ allPostsWithCommentCount })
  },

  // метод для получения всех данных и формирования вспомогательных объектов и массива
  async fetchAllData() {
    set({ loading: true })

    const {
      getCommentsByPost,
      getUserByPost,
      getPostsByUser,
      getPostsById,
      getAllPostsWithCommentCount
    } = get()

    const { users, posts, comments } = await dbApi.fetchAllData()

    set({ users, posts, comments })

    getCommentsByPost()
    getPostsByUser()
    getUserByPost()
    getPostsById()
    getAllPostsWithCommentCount()

    set({ loading: false })
  },

  // метод для удаления поста
  // данный метод является глобальным, поскольку вызывается на разных уровнях приложения
  removePost(id) {
    set({ loading: true })
    postApi.remove(id).catch((error) => set({ error }))
  }
}))

export default useStore
```

Хук для работы с формами (`hooks/useForm.js`):

```javascript
import { useState, useEffect } from 'react'

// хук принимает начальное состояние формы
// чтобы немного облегчить себе жизнь,
// мы будем исходить из предположения,
// что все поля формы являются обязательными
export default function useForm(initialData) {
  const [data, setData] = useState(initialData)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    // если какое-либо из полей является пустым
    setDisabled(!Object.values(data).every(Boolean))
  }, [data])

  // метод для изменения полей формы
  const change = ({ target: { name, value } }) => {
    setData({ ...data, [name]: value })
  }

  return { data, change, disabled }
}
```

Компонент поля формы выглядит следующим образом (`components/Field.jsx`):

```javascript
export const Field = ({ label, value, change, id, type, ...rest }) => (
  <div className='field'>
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      required
      value={value}
      onChange={change}
      {...rest}
    />
  </div>
)
```

А компонент формы так (`components/Form.jsx`):

```javascript
import useForm from 'h/useForm'
import { Field } from './Field'

// функция принимает массив полей формы, функцию для отправки формы и подпись к кнопке для отправки формы
export const Form = ({ fields, submit, button }) => {
  // некоторые поля могут иметь начальные значения,
  // например, при обновлении данных пользователя
  const initialData = fields.reduce((o, f) => {
    o[f.id] = f.value || ''
    return o
  }, {})
  // используем хук
  const { data, change, disabled } = useForm(initialData)

  // функция для отправки формы
  const onSubmit = (e) => {
    if (disabled) return
    e.preventDefault()
    submit(data)
  }

  return (
    <form onSubmit={onSubmit}>
      {fields.map((f) => (
        <Field key={f.id} {...f} value={data[f.id]} change={change} />
      ))}
      <button disabled={disabled} className='success'>
        {button}
      </button>
    </form>
  )
}
```

Рассмотрим пример использования хука для работы с хранилищем состояния и компонента формы на странице для регистрации пользователя (`pages/Register.jsx`):

```javascript
import userApi from 'a/user'
import { Form } from 'c'
import useStore from 'h/useStore'
import { useNavigate } from 'react-router-dom'

// начальное состояние формы
const fields = [
  {
    id: 'user_name',
    label: 'Username',
    type: 'text'
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email'
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password'
  },
  {
    id: 'confirm_password',
    label: 'Confirm password',
    type: 'password'
  }
]

export const Register = () => {
  // извлекаем из состояния методы для установки пользователя, загрузки и ошибки
  const { setUser, setLoading, setError } = useStore(
    ({ setUser, setLoading, setError }) => ({ setUser, setLoading, setError })
  )
  // метод для ручного перенаправления
  const navigate = useNavigate()

  // метод для регистрации
  const register = async (data) => {
    setLoading(true)
    userApi
      // данный метод возвращает объект пользователя
      .register(data)
      .then((user) => {
        // устанавливаем пользователя
        setUser(user)
        // выполняем перенаправление на главную страницу
        navigate('/')
      })
      // ошибка
      .catch(setError)
  }

  return (
    <div className='page register'>
      <h1>Register</h1>
      <Form fields={fields} submit={register} button='Register' />
    </div>
  )
}
```

Страница для авторизации пользователя выглядит похожим образом (`pages/Login.jsx`):

```javascript
import userApi from 'a/user'
import { Form } from 'c'
import useStore from 'h/useStore'
import { useNavigate } from 'react-router-dom'

const fields = [
  {
    id: 'email',
    label: 'Email',
    type: 'email'
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password'
  }
]

export const Login = () => {
  const { setUser, setLoading, setError } = useStore(
    ({ setUser, setLoading, setError }) => ({ setUser, setLoading, setError })
  )
  const navigate = useNavigate()

  const register = async (data) => {
    setLoading(true)
    userApi
      .login(data)
      .then((user) => {
        setUser(user)
        navigate('/')
      })
      .catch(setError)
  }

  return (
    <div className='page login'>
      <h1>Login</h1>
      <Form fields={fields} submit={register} button='Login' />
    </div>
  )
}
```

### Обработка изменения данных в режиме реального времени

Вы могли заметить, что на страницах для регистрации и авторизации пользователя мы обновляем состояние загрузки только один раз (`setLoading(true)`). Разве это не приведет к тому, что все время будет отображаться индикатор загрузки? Именно так. Давайте это исправим.

При регистрации/авторизации, а также при любых операциях чтения/записи в БД мы хотим вызывать метод `fetchAllData` из хранилища (в продакшне так делать не надо).

Для регистрации изменения состояния аутентификации клиент `Supabase` предоставляет метод `auth.onAuthStateChanged`, а для регистрации операций по работе с БД - метод `from(tableNames).on(eventTypes, callback).subscribe`.

Обновляем файл `supabase/index.js`:

```javascript
import { createClient } from '@supabase/supabase-js'
import useStore from 'h/useStore'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

// регистрация обновления состояния аутентификации
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
  // одной из прелестей `zustand` является то,
  // что методы из хранилища могут вызываться где угодно
  useStore.getState().fetchAllData()
})

// регистрация обновления данных в базе
supabase
  // нас интересуют все таблицы
  .from('*')
  // и все операции
  .on('*', (payload) => {
    console.log(payload)

    useStore.getState().fetchAllData()
  })
  .subscribe()

export default supabase
```

Как мы помним, на последней строке кода метода `fetchAllData` вызывается `set({ loading: false })`. Таким образом, индикатор загрузки будет отображаться до тех пор, пока приложение не получит все необходимые данные и не сформирует все вспомогательные объекты и массив. В свою очередь, пользователь всегда будет иметь дело с актуальными данными.

_Обратите внимание_ на то, разработанная нами архитектура приложения не подходит для реальных приложений, в которых используется большое количество данных: большое количество данных означает долгое время их получения и обработки. В реальных приложениях вместо прямой записи данных в базу следует применять оптимистические обновления.

### Страницы и компоненты

С вашего позволения, я расскажу только о тех страницах приложения, на которых происходит что-нибудь интересное.

Начнем со страницы профиля пользователя (`pages/Profile.jsx`):

```javascript
import { Protected, UserUpdater } from 'c'
import useStore from 'h/useStore'

export const Profile = () => {
  // извлекаем из хранилища объект пользователя
  const user = useStore(({ user }) => user)
  // копируем его
  const userCopy = { ...user }
  // и удаляем поле с адресом аватара -
  // он слишком длинный и ломает разметку
  delete userCopy.avatar_url

  return (
    // страница является защищенной
    <Protected className='page profile'>
      <h1>Profile</h1>
      <div className='user-data'>
        {/* отображаем данные пользователя */}
        <pre>{JSON.stringify(userCopy, null, 2)}</pre>
      </div>
      {/* компонент для обновления данных пользователя */}
      <UserUpdater />
    </Protected>
  )
}
```

Компонент `Protected` перенаправляет неавторизованного пользователя на главную страницу после завершения загрузки приложения (`components/Protected.jsx`):

```javascript
import useStore from 'h/useStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const Protected = ({ children, className }) => {
  const { user, loading } = useStore(({ user, loading }) => ({ user, loading }))
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading])

  // ничего не рендерим при отсутствии пользователя
  if (!user) return null

  return <div className={className ? className : ''}>{children}</div>
}
```

Компонент для обновления данных пользователя (`components/UserUpdater.jsx`):

```javascript
import { Form, AvatarUploader } from 'c'
import useStore from 'h/useStore'
import userApi from 'a/user'

export const UserUpdater = () => {
  const { user, setUser, setLoading, setError } = useStore(
    ({ user, setUser, setLoading, setError }) => ({
      user,
      setUser,
      setLoading,
      setError
    })
  )

  // метод для обновления данных пользователя
  const updateUser = async (data) => {
    setLoading(true)
    userApi.update(data).then(setUser).catch(setError)
  }

  // начальное состояние
  // с данными из объекта пользователя
  const fields = [
    {
      id: 'first_name',
      label: 'First Name',
      type: 'text',
      value: user.first_name
    },
    {
      id: 'last_name',
      label: 'Last Name',
      type: 'text',
      value: user.last_name
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      value: user.age
    }
  ]

  return (
    <div className='user-updater'>
      <h2>Update User</h2>
      {/* компонент для загрузки аватара */}
      <AvatarUploader />
      <h3>User Bio</h3>
      <Form fields={fields} submit={updateUser} button='Update' />
    </div>
  )
}
```

Компонент для загрузки аватара (`components/AvatarUploader.jsx`):

```javascript
import { useState, useEffect } from 'react'
import userApi from 'a/user'
import useStore from 'h/useStore'

export const AvatarUploader = () => {
  const { user, setUser, setLoading, setError } = useStore(
    ({ user, setUser, setLoading, setError }) => ({
      user,
      setUser,
      setLoading,
      setError
    })
  )
  // состояние для файла
  const [file, setFile] = useState('')
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(!file)
  }, [file])

  const upload = (e) => {
    e.preventDefault()
    if (disabled) return
    setLoading(true)
    userApi.uploadAvatar(file).then(setUser).catch(setError)
  }

  return (
    <div className='avatar-uploader'>
      <form className='avatar-uploader' onSubmit={upload}>
        <label htmlFor='avatar'>Avatar:</label>
        <input
          type='file'
          // инпут принимает только изображения
          accept='image/*'
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0])
            }
          }}
        />
        <button disabled={disabled}>Upload</button>
      </form>
    </div>
  )
}
```

Рассмотрим страницу для постов (`pages/Blog.jsx`):

```javascript
import postApi from 'a/post'
import { Form, PostList, PostTabs, Protected } from 'c'
import useStore from 'h/useStore'
import { useEffect, useState } from 'react'

// начальное состояние нового поста
const fields = [
  {
    id: 'title',
    label: 'Title',
    type: 'text'
  },
  {
    id: 'content',
    label: 'Content',
    type: 'text'
  }
]

export const Blog = () => {
  const { user, allPostsWithCommentCount, postsByUser, setLoading, setError } =
    useStore(
      ({
        user,
        allPostsWithCommentCount,
        postsByUser,
        setLoading,
        setError
      }) => ({
        user,
        allPostsWithCommentCount,
        postsByUser,
        setLoading,
        setError
      })
    )
  // выбранная вкладка
  const [tab, setTab] = useState('all')
  // состояние для отфильтрованных на основании выбранной вкладки постов
  const [_posts, setPosts] = useState([])

  // метод для создания нового поста
  const create = (data) => {
    setLoading(true)
    postApi
      .create(data)
      .then(() => {
        // переключаем вкладку
        setTab('my')
      })
      .catch(setError)
  }

  useEffect(() => {
    if (tab === 'new') return
    // фильтруем посты на основании выбранной вкладки
    const _posts =
      tab === 'my' ? postsByUser[user.id] : allPostsWithCommentCount
    setPosts(_posts)
  }, [tab, allPostsWithCommentCount])

  // если значением выбранной вкладки является `new`,
  // возвращаем форму для создания нового поста
  // данная вкладка является защищенной
  if (tab === 'new') {
    return (
      <Protected className='page new-post'>
        <h1>Blog</h1>
        <PostTabs tab={tab} setTab={setTab} />
        <h2>New post</h2>
        <Form fields={fields} submit={create} button='Create' />
      </Protected>
    )
  }

  return (
    <div className='page blog'>
      <h1>Blog</h1>
      <PostTabs tab={tab} setTab={setTab} />
      <h2>{tab === 'my' ? 'My' : 'All'} posts</h2>
      <PostList posts={_posts} />
    </div>
  )
}
```

Вкладки постов (`components/PostTabs.jsx`):

```javascript
import useStore from 'h/useStore'

// вкладки
// свойство `protected` определяет,
// какие вкладки доступны пользователю
const tabs = [
  {
    name: 'All'
  },
  {
    name: 'My',
    protected: true
  },
  {
    name: 'New',
    protected: true
  }
]

export const PostTabs = ({ tab, setTab }) => {
  const user = useStore(({ user }) => user)

  return (
    <nav className='post-tabs'>
      <ul>
        {tabs.map((t) => {
          const tabId = t.name.toLowerCase()
          if (t.protected) {
            return user ? (
              <li key={tabId}>
                <button
                  className={tab === tabId ? 'active' : ''}
                  onClick={() => setTab(tabId)}
                >
                  {t.name}
                </button>
              </li>
            ) : null
          }
          return (
            <li key={tabId}>
              <button
                className={tab === tabId ? 'active' : ''}
                onClick={() => setTab(tabId)}
              >
                {t.name}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

Список постов (`components/PostList.jsx`):

```javascript
import { Link, useNavigate } from 'react-router-dom'
import useStore from 'h/useStore'
import { VscComment, VscEdit, VscTrash } from 'react-icons/vsc'

// элемент поста
const PostItem = ({ post }) => {
  const removePost = useStore(({ removePost }) => removePost)
  const navigate = useNavigate()

  // каждый пост - это ссылка на его страницу
  return (
    <Link
      to={`/blog/post/${post.id}`}
      className='post-item'
      onClick={(e) => {
        // отключаем переход на страницу поста
        // при клике по кнопке или иконке
        if (e.target.localName === 'button' || e.target.localName === 'svg') {
          e.preventDefault()
        }
      }}
    >
      <h3>{post.title}</h3>
      {/* если пост является редактируемым - принадлежит текущему пользователю */}
      {post.editable && (
        <div>
          <button
            onClick={() => {
              // строка запроса `edit=true` определяет,
              // что пост находится в состоянии редактирования
              navigate(`/blog/post/${post.id}?edit=true`)
            }}
            className='info'
          >
            <VscEdit />
          </button>
          <button
            onClick={() => {
              removePost(post.id)
            }}
            className='danger'
          >
            <VscTrash />
          </button>
        </div>
      )}
      <p>Author: {post.author}</p>
      <p className='date'>{new Date(post.created_at).toLocaleString()}</p>
      {/* количество комментариев к посту */}
      {post.commentCount > 0 && (
        <p>
          <VscComment />
          <span className='badge'>
            <sup>{post.commentCount}</sup>
          </span>
        </p>
      )}
    </Link>
  )
}

// список постов
export const PostList = ({ posts }) => (
  <div className='post-list'>
    {posts.length > 0 ? (
      posts.map((post) => <PostItem key={post.id} post={post} />)
    ) : (
      <h3>No posts</h3>
    )}
  </div>
)
```

Последняя страница, которую мы рассмотрим - это страница поста (`pages/Post.jsx`):

```javascript
import postApi from 'a/post'
import commentApi from 'a/comment'
import { Form, Protected, CommentList } from 'c'
import useStore from 'h/useStore'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { VscEdit, VscTrash } from 'react-icons/vsc'

// начальное состояние для нового комментария
const createCommentFields = [
  {
    id: 'content',
    label: 'Content',
    type: 'text'
  }
]

export const Post = () => {
  const { user, setLoading, setError, postsById, removePost } = useStore(
    ({ user, setLoading, setError, postsById, removePost }) => ({
      user,
      setLoading,
      setError,
      postsById,
      removePost
    })
  )
  // извлекаем `id` поста из параметров
  const { id } = useParams()
  const { search } = useLocation()
  // извлекаем индикатор редактирования поста из строки запроса
  const edit = new URLSearchParams(search).get('edit')
  // извлекаем пост по его `id`
  const post = postsById[id]
  const navigate = useNavigate()

  // метод для обновления поста
  const updatePost = (data) => {
    setLoading(true)
    data.id = post.id
    postApi
      .update(data)
      .then(() => {
        // та же страница, но без строки запроса
        navigate(`/blog/post/${post.id}`)
      })
      .catch(setError)
  }

  // метод для создания комментария
  const createComment = (data) => {
    setLoading(true)
    data.post_id = post.id
    commentApi.create(data).catch(setError)
  }

  // если пост находится в состоянии редактирования
  if (edit) {
    const editPostFields = [
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        value: post.title
      },
      {
        id: 'content',
        label: 'Content',
        type: 'text',
        value: post.content
      }
    ]

    return (
      <Protected>
        <h2>Update post</h2>
        <Form fields={editPostFields} submit={updatePost} button='Update' />
      </Protected>
    )
  }

  return (
    <div className='page post'>
      <h1>Post</h1>
      {post && (
        <div className='post-item' style={{ width: '512px' }}>
          <h2>{post.title}</h2>
          {post.editable ? (
            <div>
              <button
                onClick={() => {
                  navigate(`/blog/post/${post.id}?edit=true`)
                }}
                className='info'
              >
                <VscEdit />
              </button>
              <button
                onClick={() => {
                  removePost(post.id)
                  navigate('/blog')
                }}
                className='danger'
              >
                <VscTrash />
              </button>
            </div>
          ) : (
            <p>Author: {post.author}</p>
          )}
          <p className='date'>{new Date(post.created_at).toLocaleString()}</p>
          <p>{post.content}</p>
          {user && (
            <div className='new-comment'>
              <h3>New comment</h3>
              <Form
                fields={createCommentFields}
                submit={createComment}
                button='Create'
              />
            </div>
          )}
          {/* комментарии к посту */}
          {post.comments.length > 0 && <CommentList comments={post.comments} />}
        </div>
      )}
    </div>
  )
}
```

Компонент для комментариев к посту (`components/CommentList.jsx`):

```javascript
import { useState } from 'react'
import useStore from 'h/useStore'
import commentApi from 'a/comment'
import { Form, Protected } from 'c'
import { VscEdit, VscTrash } from 'react-icons/vsc'

export const CommentList = ({ comments }) => {
  const { user, setLoading, setError } = useStore(
    ({ user, setLoading, setError }) => ({ user, setLoading, setError })
  )
  // индикатор редактирования комментария
  const [editComment, setEditComment] = useState(null)

  // метод для удаления комментария
  const remove = (id) => {
    setLoading(true)
    commentApi.remove(id).catch(setError)
  }

  // метод для обновления комментария
  const update = (data) => {
    setLoading(true)
    data.id = editComment.id
    commentApi.update(data).catch(setError)
  }

  // если комментарий находится в состоянии редактирования
  if (editComment) {
    const fields = [
      {
        id: 'content',
        label: 'Content',
        type: 'text',
        value: editComment.content
      }
    ]

    return (
      <Protected>
        <h3>Update comment</h3>
        <Form fields={fields} submit={update} button='Update' />
      </Protected>
    )
  }

  return (
    <div className='comment-list'>
      <h3>Comments</h3>
      {comments.map((comment) => (
        <div className='comment-item' key={comment.id}>
          <p>{comment.content}</p>
          {/* является ли комментарий редактируемым - принадлежит ли текущему пользователю? */}
          {comment.user_id === user?.id ? (
            <div>
              <button onClick={() => setEditComment(comment)} className='info'>
                <VscEdit />
              </button>
              <button onClick={() => remove(comment.id)} className='danger'>
                <VscTrash />
              </button>
            </div>
          ) : (
            <p className='author'>Author: {comment.author}</p>
          )}
          <p className='date'>
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
```

И основной компонент приложения (`App.jsx`):

```javascript
import './styles/app.scss'
import { Routes, Route } from 'react-router-dom'
import { Home, About, Register, Login, Profile, Blog, Post } from 'p'
import { Nav, Layout } from 'c'
import { useEffect } from 'react'
import useStore from 'h/useStore'
import userApi from 'a/user'

function App() {
  const { user, setUser, setLoading, setError, fetchAllData } = useStore(
    ({ user, setUser, setLoading, setError, fetchAllData }) => ({
      user,
      setUser,
      setLoading,
      setError,
      fetchAllData
    })
  )

  useEffect(() => {
    // запрашиваем данные пользователя при их отсутствии
    if (!user) {
      setLoading(true)
      userApi
        .get()
        .then((user) => {
          // устанавливаем пользователя
          // `user` может иметь значение `null`
          setUser(user)
          // получаем данные из всех таблиц
          fetchAllData()
        })
        .catch(setError)
    }
  }, [])

  return (
    <div className='app'>
      <header>
        <Nav />
      </header>
      <main>
        <Layout>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/blog/post/:id' element={<Post />} />
            <Route path='/about' element={<About />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
        </Layout>
      </main>
      <footer>
        <p>&copy; 2022. Not all rights reserved</p>
      </footer>
    </div>
  )
}

export default App
```

Таким образом, мы рассмотрели все основные страницы и компоненты приложения.

### Проверка работоспособности приложения

Давайте убедимся в том, что приложение работает, как ожидается.

Определим функцию для наполнения базы фиктивными данными. В директории `src` создаем файл `seedDb.js` следующего содержания:

```javascript
import { createClient } from '@supabase/supabase-js'
import serializeUser from '../utils/serializeUser.js'
import { config } from 'dotenv'

// получаем доступ к переменным среды окружения
config()

// создаем клиента `Supabase`
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
)

// создаем 2 пользователей, `Alice` и `Bob` с постами и комментариями
async function seedDb() {
  try {
    const { user: aliceAuth } = await supabase.auth.signUp(
      {
        email: 'alice@mail.com',
        password: 'password'
      },
      {
        data: {
          user_name: 'Alice'
        }
      }
    )
    const { user: bobAuth } = await supabase.auth.signUp(
      {
        email: 'bob@mail.com',
        password: 'password'
      },
      {
        data: {
          user_name: 'Bob'
        }
      }
    )
    const {
      data: [alice, bob]
    } = await supabase
      .from('users')
      .insert([serializeUser(aliceAuth), serializeUser(bobAuth)])

    const { data: alicePosts } = await supabase.from('posts').insert([
      {
        title: `Alice's first post`,
        content: `This is Alice's first post`,
        user_id: alice.id
      },
      {
        title: `Alice's second post`,
        content: `This is Alice's second post`,
        user_id: alice.id
      }
    ])
    const { data: bobPosts } = await supabase.from('posts').insert([
      {
        title: `Bob's's first post`,
        content: `This is Bob's first post`,
        user_id: bob.id
      },
      {
        title: `Bob's's second post`,
        content: `This is Bob's second post`,
        user_id: bob.id
      }
    ])
    for (const post of alicePosts) {
      await supabase.from('comments').insert([
        {
          user_id: alice.id,
          post_id: post.id,
          content: `This is Alice's comment on Alice's post "${post.title}"`
        },
        {
          user_id: bob.id,
          post_id: post.id,
          content: `This is Bob's comment on Alice's post "${post.title}"`
        }
      ])
    }
    for (const post of bobPosts) {
      await supabase.from('comments').insert([
        {
          user_id: alice.id,
          post_id: post.id,
          content: `This is Alice's comment on Bob's post "${post.title}"`
        },
        {
          user_id: bob.id,
          post_id: post.id,
          content: `This is Bob's comment on Bob's post "${post.title}"`
        }
      ])
    }
    console.log('Done')
  } catch (e) {
    console.error(e)
  }
}
seedDb()
```

Выполняем этот код с помощью `node src/seed_db.js`. Получаем сообщение об успехе операции (`Done`). В БД появилось 2 пользователя, 4 поста и 8 комментариев.

Находясь в корневой директории проекта (`supabase-social-app`), выполняем команду `yarn dev` для запуска сервера для разработки.

<img src="https://habrastorage.org/webt/rz/gx/se/rzgxsedpo8chvapson3m_aqjhnm.png" />
<br />

Переходим на страницу регистрации (`Register`) и создаем нового пользователя. _Обратите внимание_: `Supabase` требует, чтобы пароль состоял как минимум из 6 символов.

<img src="https://habrastorage.org/webt/si/9p/hz/si9phzhpguhvkfyl6casfkl8dt0.png" />
<br />

<img src="https://habrastorage.org/webt/iv/5u/-x/iv5u-xvbr6mpqawnlhfp3s0nupa.png" />
<br />

На панели навигации появилась кнопка для выхода из системы и ссылка на страницу профиля.

Переходим на страницу профиля (`Profile`), загружаем аватар и обновляем данные.

<img src="https://habrastorage.org/webt/hz/6a/fe/hz6afebw09el8jylqdt0xocjw4s.png" />
<br />

<img src="https://habrastorage.org/webt/4l/8y/bf/4l8ybf0rh91j9852mbvur-01wb8.png" />
<br />

Вместо ссылки на страницу профиля у нас теперь имеется аватар пользователя, а в объекте `user` - заполненные поля `first_name`, `last_name` и `age`.

Переходим на страницу блога (`Blog`), "проваливаемся" в какой-нибудь пост и добавляем к нему комментарий.

<img src="https://habrastorage.org/webt/vk/0w/rv/vk0wrvizoh_zypvw05seuqnx9hw.png" />
<br />

<img src="https://habrastorage.org/webt/h2/tc/2z/h2tc2zwnne6pvnvnu2_awbe1y0e.png" />
<br />

<img src="https://habrastorage.org/webt/ol/at/bb/olatbbuqjx8oqedcluskylesd8w.png" />
<br />

Добавленный комментарий можно редактировать и удалять.

Возвращаемся на страницу блога, переключаемся на вкладку для создания нового поста (`New`) и создаем его.

<img src="https://habrastorage.org/webt/em/dm/ku/emdmkufq97axx4klhnrrdhyqdyg.png" />
<br />

<img src="https://habrastorage.org/webt/oy/pk/ei/oypkeijn4xvinpm9gtbazbuters.png" />
<br />

На вкладке `My` страницы блога можно увидеть все созданные нами посты.

<img src="https://habrastorage.org/webt/jy/c9/pe/jyc9pewh3hasdn9bpaia4unohj8.png" />
<br />

Их также можно редактировать и удалять.

Круто! Все работает, как часы.

Таким образом, `Supabase` предоставляет разработчикам интересные возможности по созданию фулстек-приложений, позволяя практически полностью сосредоточиться на клиентской части. So give it a chance!
