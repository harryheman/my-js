---
sidebar_position: 18
---

# Supabase

> `Supabase`, как и `Firebase` - это [`SaaS`](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BD%D0%BE%D0%B5_%D0%BE%D0%B1%D0%B5%D1%81%D0%BF%D0%B5%D1%87%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BA%D0%B0%D0%BA_%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B0) или [`BaaS`](https://ru.bmstu.wiki/BaaS_(Backend-as-a-Service)). Что это означает? Это означает, что в случае с fullstack app мы разрабатываем только клиентскую часть, а все остальное предоставляется `Supabase` через пользовательские комплекты для разработки программного обеспечения (SDK) и интерфейсы прикладного программирования (API). Под "всем остальным" подразумевается сервис аутентификации (включая возможность использования сторонних провайдеров), база данных (PostgreSQL), файловое хранилище, realtime (регистрацию модификации данных в реальном времени), и сервер, который все это обслуживает.

## Содержание

- [Клиент (Client)](#клиент-client)
- [Аутентификация (Auth)](#аутентификация-auth)
- [База данных (Database)](#база-данных-database)
- [Модификаторы (Modifiers)](#модификаторы-modifiers)
- [Фильтры (Filters)](#фильтры-filters)
- [Хранилище (Storage)](#хранилище-storage)
- [Регистрация модификации данных в режиме реального времени (Realtime)](#регистрация-модификации-данных-в-режиме-реального-времени-realtime)

_Установка_

```bash
yarn add @supabase/supabase-js
```

_Импорт_

```javascript
import supabase from '@supabase/supabase-js'
```

# Клиент (Client)

_Инициализация_

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key, options)
```

- `url` - путь, предоставляемый после создания проекта, доступный в настройках панели управления проектом;
- `key` - ключ, предоставляемый после создания проекта, доступный в настройках панели управления проектом;
- `options` - дополнительные настройки.

```javascript
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

```javascript
const supabase = createClient('https://my-app.supabase.co', 'public-anon-key', {
 fetch: fetch.bind(globalThis)
})
```

# Аутентификация (Auth)

__Регистрация__

Для регистрации нового пользователя используется метод `signUp`:

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
const session = supabase.auth.session()
```

__Пользователь__

Метод `user` возвращает данные авторизованного пользователя:

```javascript
const user = supabase.auth.user()
```

В данном случае возвращается объект из локального хранилища.

Для получения данных пользователя из БД используется метод `auth.api.getUser(jwt)`.

На стороне сервера для этого используется метод `auth.api.getUserByCookie`.

__Обновление данных пользователя__

Для обновления данных пользователя используется метод `update`:

```javascript
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

```javascript
supabase.auth.onAuthStateChange((event, session) => {
 console.log(event, session)
})
```

__Сброс пароля__

```javascript
const { data, error } = supabase.auth.api.resetPasswordForEmail(email, { redirectTo: window.location.origin })
```

После вызова этого метода на email пользователя отправляется ссылка для сброса пароля. Когда пользователь кликает по ссылке, он переходит по адресу: `SITE_URL/#access_token=X&refresh_token=Y&expires_in=Z&token_type=bearer&type=recovery`. Мы регистрируем `type=recovery` и отображаем форму для сброса пароля. Затем используем `access_token` из `URL` и новый пароль для обновления пользовательских данных:

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
const { data, error } = await supabase
 .from(table_name)
 .delete(options)
 .match(condition)
```

- `options`:
 - `returning`;
 - `count`.

Пример:

```javascript
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

```javascript
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

```javascript
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

```javascript
const { data, error } = await supabase
 .rpc('get_all_cities')
 .select('city_name', 'population')
 .eq('city_name', 'The Shire')
```

# Модификаторы (Modifiers)

Модификаторы используются в запросах на выборку данных (`select`). Они также могут использоваться совместно с методом `rpc`, когда он возвращает таблицу.

__`limit()`__

Модификатор `limit` ограничивает количество возвращаемых строк.

Сигнатура:

```javascript
const { data, error } = await supabase
 .from(table_name)
 .select(column_names)
 .limit(count, options)
```

- `count`: количество возвращаемых строк;
- `options`:
 - `foreignTable`: внешняя таблица (для колонок с внешним ключом).

Пример:

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

# Фильтры (Filters)

Фильтры могут использоваться в запросах `select`, `update` и `delete`, а также в методе `rpc`, когда функция возвращает таблицу.

Фильтры должны применяться в конце запроса. Их можно объединять в цепочки и применять условно.

Примеры:

```javascript
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

```javascript
const { data, error } = await supabase
 .from('quotes')
 .select('catchphrase')
 .textSearch('catchphrase', `'fat' & 'cat'`, {
   config: 'english'
 })
```

Настройки также принимают второй параметр `type`, возможными значениями которого являются `plain` и `phrase`, определяющие базовую и полную нормализацию, соответственно.

- `filter(column_name, operator, value)` - значение колонки должно удовлетворять фильтру. `filter` должен использоваться в последнюю очередь, когда других фильтров оказалось недостаточно:

```javascript
const { data, error } = await supabase
 .from('cities')
 .select('city_name, countries(city_name)')
 .filter('countries.city_name', 'in', '("France", "Japan")')
```

Также имеется несколько других (более специфичных) фильтров.

# Хранилище (Storage)

Для _создания_ файлового хранилища используется метод `createBucket`:

```javascript
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

```javascript
const { data, error } = await supabase
 .storage
 // getBucket(id)
 .getBucket('avatars')
```

Требуются следующие разрешения:

- `buckets`: `select`;
- `objects`: `none`.

Для _получения списка_ хранилищ используется метод `listBuckets`:

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
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

```javascript
update(path, file, options)
```

- `options`: настройки, аналогичные передаваемым `upload`.

_Пример_

```javascript
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

```javascript
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

```javascript
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

```javascript
createSignedUrl(path, expiresIn)
```

- `expiresIn` - количество секунд, в течение которых ссылка считается валидной.

```javascript
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

```javascript
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

# Регистрация модификации данных в режиме реального времени (Realtime)

__Подписка на изменения__

Для подписки на изменения, происходящие в БД, используется метод `subscribe` в сочетании с методом `on`.

_Сигнатура_

```javascript
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

```javascript
const subscription = supabase
 .from('*')
 .on('*', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Регистрация изменений определенной таблицы:

```javascript
const subscription = supabase
 .from('posts')
 .on('*', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Регистрация записи данных в определенную таблицу:

```javascript
const subscription = supabase
 .from('posts')
 // INSERT | UPDATE | DELETE
 .on('INSERT', payload => {
   console.log('***', payload)
 })
 .subscribe()
```

Обработчики можно объединять в цепочки:

```javascript
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

```javascript
const subscription = supabase
 .from('countries.id=eq.123')
 .on('UPDATE', onUpdate)
 .subscribe()
```

__Отписка от изменений__

Метод `removeSubscription` удаляет активную подписку и возвращает количество открытых соединений.

```javascript
supabase.removeSubscription(subscription_name)
```

- `subscription_name` - название подписки.

Для удаления всех подписок и закрытия `WebSocket-соединения` используется метод `removeAllSubscriptions`.

__Получение списка подписок__

Для получения списка подписок используется метод `getSubscriptions`.

```javascript
const allSubscriptions = supabase.getSubscriptions()
```

The End.