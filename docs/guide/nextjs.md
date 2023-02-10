---
sidebar_position: 2
title: Руководство по Next.js
description: Руководство по Next.js
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'next.js', 'nextjs', 'next', 'guide', 'руководство', 'мета-фреймворк']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'next.js', 'nextjs', 'next', 'guide', 'руководство', 'мета-фреймворк']
---

# Next.js

> [Next.js](https://nextjs.org/) - это мета-фреймворк для разработки фулстек-приложений, основанный на [React](https://ru.reactjs.org/). Особенностями `Next.js` являются: гибридный статический и серверный рендеринг, встроенная поддержка [TypeScript](https://www.typescriptlang.org/), умная сборка, предварительное разрешение маршрутов и др.

[Примеры использования](https://github.com/vercel/next.js/tree/canary/examples).

## Начало работы

Для создания проекта рекомендуется использовать `create-next-app`:

```bash
yarn create next-app app-name
# typescript
yarn create next-app app-name --typescript
```

Ручная установка:

- устанавливаем зависимости

```bash
yarn add next react react-dom
```

- обновляем `package.json`

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Запуск сервера для разработки:

```bash
yarn dev
```

## Основные возможности

### Страницы (Pages)

Страница - это компонент `React`, который экспортируется из файла с расширением `.js`, `.jsx`, `.ts` или `.tsx`, находящегося в директории `pages`. Каждая страница ассоциируется с маршрутом (роутом) по названию. Например, страница `pages/about.js` будет доступна по адресу `/about`. _Обратите внимание_, что страница должна экспортироваться по умолчанию (`export default`):

```js
export default function About() {
  return <div>О нас</div>
}
```

Маршрут для страницы `pages/posts/[id].js` будет динамическим, т.е. такая страница будет доступна по адресам `posts/1`, `posts/2` и т.д.

По умолчанию все страницы рендерятся предварительно (pre-rendering). Это приводит к лучшей производительности и `SEO`. Каждая страница ассоциируется с минимальным количеством `JS`. При загрузке страницы запускается JS-код, который делает ее интерактивной (данный процесс называется гидратацией - hydration).

Существует 2 формы предварительного рендеринга: генерация статической разметки (static generation, SSG, рекомендуемый подход) и рендеринг на стороне сервера (server-side rendering, SSR). Первая форма предусматривает генерацию `HTML` во время сборки и его повторное использование при каждом запросе. Вторая - генерацию разметки при каждом запросе. Генерация статической разметки является рекомендуемым подходом по причинам производительности.

Кроме этого можно использовать рендеринг на стороне клиента (client-side rendering), когда определенные части страницы рендерятся клиентским `JS`.

__SSG__

Генерироваться могут как страницы с данными, так и страницы без данных.

_Без данных_

```js
export default function About() {
  return <div>О нас</div>
}
```

_С данными_

Существует 2 возможных сценария, при которых может потребоваться генерация статической страницы с данными:

1. Контент страницы зависит от внешних данных: используется `getStaticProps`
2. Пути (paths) страницы зависят от внешних данных: используется `getStaticPaths` (как правило, совместно с `getStaticProps`)

_Контент страницы зависит от внешних данных_

Предположим, что страница блога получает список постов от `CMS`:

```js
// TODO: запрос `posts`

export default function Blog({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

Для получения данных, необходимых для предварительного рендеринга, из файла должна экспортироваться асинхронная функция `getStaticProps`. Данная функция вызывается во время сборки и позволяет передавать полученные данные странице в виде `props`:

```js
export default function Blog({ posts }) {
  // ...
}

export async function getStaticProps() {
  const posts = await (await fetch('https://example.com/posts'))?.json()

  // обратите внимание на сигнатуру
  return {
    props: {
      posts
    }
  }
}
```

_Пути страницы зависят от внешних данных_

Для обработки предварительного рендеринга статической страницы, пути которой зависят от внешних данных, из динамической страницы (например, `pages/posts/[id].js`) должна экспортироваться асинхронная функция `getStaticPaths`. Данная функция вызывается во время сборки и позволяет определить пути для предварительного рендеринга:

```js
export default function Post({ post }) {
  // ...
}

export async function getStaticPaths() {
  const posts = await (await fetch('https://example.com/posts'))?.json()

  // обратите внимание на структуру возвращаемого массива
  const paths = posts.map((post) => ({
    params: { id: post.id }
  }))

  // `fallback: false` означает, что для ошибки 404 используется другой маршрут
  return {
    paths,
    fallback: false
  }
}
```

На странице `pages/posts/[id].js` также должна экспортироваться функция `getStaticProps` для получения данных поста с указанным `id`:

```js
export default function Post({ post }) {
  // ...
}

export async function getStaticPaths() {
  // ...
}

export async function getStaticProps({ params }) {
  const post = await (await fetch(`https://example.com/posts/${params.id}`)).json()

  return {
    props: {
      post
    }
  }
}
```

__SSR__

Для обработки рендеринга страницы на стороне сервера из файла должна экспортироваться асинхронная функция `getServerSideProps`. Данная функция будет вызываться при каждом запросе страницы.

```js
function Page({ data }) {
  // ...
}

export async function getServerSideProps() {
  const data = await (await fetch('https://example.com/data'))?.json()

  return {
    props: {
      data
    }
  }
}
```

### Получение данных (Data Fetching)

Существует 3 функции для получения данных, необходимых для предварительного рендеринга:

- `getStaticProps` (SSG): получение данных во время сборки
- `getStaticPaths` (SSG): определение динамических роутов для предварительного рендеринга страниц на основе данных
- `getServerSideProps` (SSR): получение данных при каждом запросе

__`getStaticProps`__

Страница, на которой экспортируется асинхронная функция `getStaticProps`, предварительно рендерится с помощью возвращаемых этой функцией пропов.

```js
export async function getStaticProps(context) {
  return {
    props: {}
  }
}
```

`context` - это объект со следующими свойствами:

- `params` - параметры роута для страниц с динамической маршрутизацией. Например, если названием страницы является `[id].js`, `params` будет иметь вид `{ id: ... }`
- `preview` - имеет значение `true`, если страница находится в режиме предварительного просмотра
- `previewData` - набор данных, установленный с помощью `setPreviewData`
- `locale` - текущая локаль (если включено)
- `locales` - поддерживаемые локали (если включено)
- `defaultLocale` - дефолтная локаль (если включено)

`getStaticProps` возвращает объект со следующими свойствами:

- `props` - опциональный объект с пропами для страницы
- `revalidate` - опциональное количество секунд, по истечении которых происходит повторная генерация страницы. По умолчанию имеет значение `false` - повторная генерация выполняется только при следующей сборке
- `notFound` - опциональное логическое значение, позволяющее вернуть статус 404 и соответствующую страницу, например:

```js
export async function getStaticProps(context) {
  const res = await fetch('/data')
  const data = await res.json()

  if (!data) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      data
    }
  }
}
```

_Обратите внимание_: `notFound` не требуется в режиме `fallback: false`, поскольку в этом режиме предварительно рендерятся только пути, возвращаемые `getStaticPaths`.

_Также обратите внимание_, что `notFound: true` означает возврат 404 даже в случае, если предыдущая страница была успешно сгенерирована. Это рассчитано на поддержку случаев удаления пользовательского контента.

- `redirect` - опциональный объект, позволяющий выполнять перенаправления на внутренние и внешние ресурсы, который должен иметь форму `{ destination: string, permanent: boolean }`:

```js
export async function getStaticProps(context) {
  const res = await fetch('/data')
  const data = await res.json()

  if (!data) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      data
    }
  }
}
```

_Замечание 1_: в настоящее время перенаправления во время сборки не разрешаются. Такие перенаправления должны быть добавлены в `next.config.js`.

_Замечание 2_: модули, импортируемые на верхнем уровне для использования в `getStaticProps`, не включаются в клиентскую сборку. Это означает, что серверный код, включая операции чтения из файловой системы или из базы данных, можно писать прямо в `getStaticProps`.

_Замечание 3_: `fetch()` в `getStaticProps` следует использовать только при получении ресурсов из внешних источников.

_Случаи использования_

- данные для рендеринга доступны во время сборки и не зависят от запроса пользователя
- данные приходят из безголовой (headless) `CMS`
- данные могут быть кешированы в открытом виде (не предназначены для конкретного пользователя)
- страница должна быть предварительно отрендерена (для `SEO`) и при этом должна быть очень быстрой - `getStaticProps` генерирует `HTML` и `JSON` файлы, которые могут быть кешированы с помощью `CDN`

_Использование с `TypeScript`_

```ts
import { GetStaticProps } from 'next'

export const getStaticProps: GetStaticProps = async (context) => {}
```

Для получения предполагаемых типов для пропов следует использовать `InferGetStaticPropsType<typeof getStaticProps>`:

```ts
import { InferGetStaticPropsType } from 'next'

type Post = {
  author: string
  content: string
}

export const getStaticProps = async () => {
  const res = await fetch('/posts')
  const posts: Post[] = await res.json()

  return {
    props: {
      posts
    }
  }
}

export default function Blog({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  // посты будут иметь тип `Post[]`
}
```

__Инкрементальная статическая регенерация__

Статические страницы можно обновлять после сборки приложения. Инкрементальная статическая регенерация позволяет использовать статическую генерацию на уровне отдельных страниц без необходимости повторной сборки всего проекта.

Пример:

```js
const Blog = ({ posts }) => (
  <ul>
    {posts.map((post) => (
      <li>{post.title}</li>
    ))}
  </ul>
)

// Данная функция вызывается во время сборки на сервере.
// Она может вызываться повторно как бессерверная функция
// при включенной инвалидации и поступлении нового запроса
export async function getStaticProps() {
  const res = await fetch('/posts')
  const posts = await res.json()

  return {
    props: {
      posts
    },
    // `Next.js` попытается регенерировать страницу:
    // - при поступлении нового запроса
    // - как минимум, один раз каждые 10 секунд
    revalidate: 10 // в секундах
  }
}

// Данная функция вызывается во время сборки на сервере.
// Она может вызываться повторно как бессерверная функция
// если путь не был сгенерирован предварительно
export async function getStaticPaths() {
  const res = await fetch('/posts')
  const posts = await res.json()

  // Получаем пути для предварительного рендеринга на основе постов
  const paths = posts.map((post) => ({
    params: { id: post.id }
  }))

  // Только эти пути будут предварительно отрендерены во время сборки
  // `{ fallback: 'blocking' }` будет рендерить страницы на сервере
  // при отсутствии соответствующего пути
  return { paths, fallback: 'blocking' }
}

export default Blog
```

При запросе страницы, которая была предварительно отрендерена во время сборки, отображается кешированная страница.

- Ответ на любой запрос к такой странице до истечения 10 секунд также мгновенно возвращается из кеша
- По истечении 10 секунд следующий запрос также получает в ответ кешированную версию страницы
- После этого в фоновом режиме запускается регенерация страницы
- После успешной регенерации кеш инвалидируется и отображается новая страница. При провале регенерации старая страница остается неизменной

__Чтение файлов__

Для получения абсолютного пути к текущей рабочей директории следует использовать `process.cwd()`:

```js
import { promises as fs } from 'fs'
import { join } from 'path'

const Blog = ({ posts }) => (
  <ul>
    {posts.map((post) => (
      <li key={post.id}>
        <h3>{post.filename}</h3>
        <p>{post.content}</p>
      </li>
    ))}
  </ul>
)

// Данная функция вызывается на сервере, так что
// в ней можно напрямую обращаться к БД
export async function getStaticProps() {
  const postsDir = join(process.cwd(), 'posts')
  const filenames = await fs.readdir(postsDir)

  const posts = filenames.map(async (filename) => {
    const filePath = join(postsDir, filename)
    const fileContent = await fs.readFile(filePath, 'utf-8')

    // Обычно, здесь выполняется преобразование контента,
    // например, разбор `markdown` в `HTML`

    return {
      filename,
      content: fileContent
    }
  })

  return {
    props: {
      posts: await Promise.all(posts)
    }
  }
}
export default Blog
```

__Технические подробности__

- Поскольку `getStaticProps` запускается во время сборки, она не может использовать данные из запроса, такие как параметры строки запроса (query params) или HTTP-заголовки (headers)
- `getStaticProps` запускается только на сервере, поэтому ее нельзя использовать для обращения к внутренним роутам
- при использовании `getStaticProps` генерируется не только `HTML`, но и файл в формате `JSON`. Данный файл содержит результаты выполнения `getStaticProps` и используется механизмом маршрутизации на стороне клиента для передачи пропов компонентам
- `getStaticProps` может использовать только в компоненте-странице. Это объясняется тем, что все данные, необходимые для рендеринга страницы, должны быть доступными
- в режиме для разработки `getStaticProps` вызывается при каждом запросе
- режим предварительного просмотра (preview mode) используется для рендеринга страницы при каждом запросе

__`getStaticPaths`__

Страницы с динамической маршрутизацией, из которых экспортируется асинхронная функция `getStaticPaths`, будут предварительно сгенерированы для всех путей, возвращаемых этой функцией.

```js
export async function getStaticPaths() {
  return {
    paths: [
      { params: {} }
    ],
    fallback: true | false | 'blocking'
  }
}
```

_Ключ `paths`_

`paths` определяет, какие пути будут предварительно отрендерены. Например, если у нас имеется страница с динамической маршрутизацией, которая называется `pages/posts/[id].js`, и экспортируемая на этой странице `getStaticPaths` возвращает такой `paths`:

```js
return {
  paths: [
    { params: { id: '1' } },
    { params: { id: '2' } },
  ]
}
```

Тогда будут статически сгенерированы страницы `posts/1` и `posts/2` на основе компонента `pages/posts/[id].js`.

_Обратите внимание_, что название каждого `params` должно совпадать с параметрами, используемыми на странице:

- если названием страницы является `pages/posts/[postId]/[commentId]`, тогда `params` должен содержать `postId` и `commentId`
- если на странице используется перехватчик роутов, например, `pages/[...slug]`, `params` должен содержать `slug` в виде массива. Например, если такой массив будет выглядеть как `['foo', 'bar']`, то будет сгенерирована страница `/foo/bar`
- если на странице используется опциональный перехватчик роутов, применение `null`, `[]`, `undefined` или `false`, приведет к рендерингу роута верхнего уровня. Например, при применении `slug: false` к `pages/[[...slug]]`, будет сгенерирована страница `/`

_Ключ `fallback`_

- если `fallback` имеет значение `false`, отсутствующий путь будет разрешаться страницей `404`
- если `fallback` имеет значение `true`, поведение `getStaticProps` будет таким:
  - пути из `getStaticPaths` будут сгенерированы во время сборки с помощью `getStaticProps`
  - отсутствующий путь не будет разрешаться страницей `404`. Вместо этого в ответ на запрос будет возвращена резервная страница
  - в фоновом режиме выполняется генерация запрошенного `HTML` и `JSON`. Это включает в себя вызов `getStaticProps`
  - браузер получает `JSON` для сгенерированного пути. Этот `JSON` используется для автоматического рендеринга страницы с обязательными пропами. Со стороны пользователя это выглядит как переключение между резервной и полной страницами
  - новый путь добавляется в список предварительно отрендеренных страниц

_Обратите внимание_: `fallback: true` не поддерживается при использовании `next export`.

__Резервные страницы__

В резервной версии страницы:

- пропы страницы будут пустыми
- определить, что рендерится резервная страница, можно с помощью роутера: `router.isFallback` будет иметь значение `true`

```js
// pages/posts/[id].js
import { useRouter } from 'next/router'

function Post({ post }) {
  const router = useRouter()

  // Если страница еще не сгенерирована, будет отображаться это
  // До тех пор, пока `getStaticProps` не закончит свою работу
  if (router.isFallback) {
    return <div>Загрузка...</div>
  }

  // рендеринг поста
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } }
    ],
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  const res = await fetch(`/posts/${params.id}`)
  const post = await res.json()

  return {
    props: {
      post
    },
    revalidate: 1
  }
}

export default Post
```

_В каких случаях может быть полезен `fallback: true`?_

`fallback: true` может быть полезен при очень большом количестве статических страниц, которые зависят от данных (например, очень большой интернет-магазин). Мы хотим предварительно рендерить все страницы, но понимаем, что сборка будет длиться целую вечность.

Вместо этого мы генерируем небольшой набор статических страниц и используем `fallback: true` для остальных. При запросе отсутствующей страницы пользователь какое-то время будет наблюдать индикатор загрузки (пока `getStaticProps` делает свое дело), затем увидит саму страницу. И после этого новая страница будет возвращаться в ответ на каждый запрос.

_Обратите внимание_: `fallback: true` не обновляет сгенерированные страницы. Для этого используется инкрементальная статическая регенерация.

Если `fallback` имеет значение `blocking`, отсутствующий путь также не будет разрешаться страницей `404`, но и перехода между резервной и нормальной страницами не будет. Вместо этого запрашиваемая страница будет сгенерирована на сервере и отправлена браузеру, а пользователь после некоторого ожидания сразу увидит готовую страницу

_Случаи использования `getStaticPaths`_

`getStaticPaths` используется для предварительного рендеринга страниц с динамической маршрутизацией.

_Использование с `TypeScript`_

```ts
import { GetStaticPaths } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {}
```

_Технические подробности_

- `getStaticPaths` должна использоваться совместно с `getStaticProps`. Она не может использоваться вместе с `getServerSideProps`
- `getStaticPaths` запускается только на сервере во время сборки
- `getStaticPaths` может экспортироваться только в компоненте-странице
- в режиме для разработки `getStaticPaths` запускается при каждом запросе

__`getServerSideProps`__

Страница, из которой экспортируется асинхронная функция `getServerSideProps`, будет рендерится при каждом запросе с помощью возвращаемых этой функцией пропов.

```js
export async function getServerSideProps(context) {
  return {
    props: {}
  }
}
```

`context` - это объект со следующими свойствами:

- `params`: см. `getStaticProps`
- `req`: объект `HTTP IncomingMessage` (входящее сообщение, запрос)
- `res`: объект HTTP-ответа
- `query`: объектное представление строки запроса
- `preview`: см. `getStaticProps`
- `previewData`: см. `getStaticProps`
- `resolveUrl`: нормализованная версия запрашиваемого `URL`, из которой удален префикс `_next/data` и включены значения оригинальной строки запроса
- `locale`: см. `getStaticProps`
- `locales`: см. `getStaticProps`
- `defaultLocale`: см. `getStaticProps`

`getServerSideProps` должна возвращать объект с такими полями:

- `props` - см. `getStaticProps`
- `notFound` - см. `getStaticProps`

```js
export async function getServerSideProps(context) {
  const res = await fetch('/data')
  const data = await res.json()

  if (!data) {
    return {
      notFound: true
    }
  }

  return {
    props: {}
  }
}
```

- `redirect` - см. `getStaticProps`

```js
export async function getServerSideProps(context) {
  const res = await fetch('/data')
  const data = await res.json()

  if (!data) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}
```

Для `getServerSideProps` характерны те же особенности и ограничения, что и для `getStaticProps`.

_Случа использования `getServerSideProps`_

`getServerSideProps` следует использовать только при необходимости предварительного рендеринга страницы на основе данных, зависящих от запроса.

_Использование с `TypeScript`_

```ts
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => {}
```

Для получения предполагаемых типов для пропов следует использовать `InferGetServerSidePropsType<typeof getServerSideProps>`:

```ts
import { InferGetServerSidePropsType } from 'next'

type Data = {}

export async function getServerSideProps() {
  const res = await fetch('/data')
  const data = await res.json()

  return {
    props: {
      data
    }
  }
}

function Page({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // ...
}

export default Page
```

_Технические подробности_

- `getServerSideProps` запускается только на сервере
- `getServerSideProps` может экспортироваться только в компоненте-странице

__Получение данных на стороне клиента__

Если на странице имеются часто обновляемые данные, но страница не нуждается в предварительном рендеринге (по соображениям, связанным с `SEO`), тогда можно запрашивать такие данные на стороне клиента.

Команда `Next.js` рекомендует использовать для этого разработанный ими хук [`useSWR`](https://swr.vercel.app/ru), который предоставляет такие возможности, как кеширование данных, инвалидация кеша, отслеживание фокуса, периодическое выполнение повторных запросов и т.д.

```js
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)

  if (error) return <div>При загрузке данных возникла ошибка</div>
  if (!data) return <div>Загрузка...</div>

  return <div>Привет, {data.name}!</div>
}
```

### Встроенная поддержка `CSS`

__Импорт глобальных стилей__

Для добавления глобальных стилей соответствующую таблицу следует импортировать в файл `pages/_app.js` (_обратите внимание_ на нижнее подчеркивание):

```js
// pages/_app.js
import './style.css'

// Данный экспорт по умолчанию является обязательным
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

Такие стили будут применяться ко всем страницам и компонентам в приложении. _Обратите внимание_: во избежание конфликтов глобальные стили могут импортироваться только в `pages/_app.js`.

При сборке приложения все стили объединяются в один минифицированный CSS-файл.

__Импорт стилей из директории `node_modules`__

Стили могут импортироваться из `node_modules`.

Пример импорта глобальных стилей:

```js
// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

Пример импорта стилей для стороннего компонента:

```js
// components/Dialog.js
import { useState } from 'react'
import { Dialog } from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import '@reach/dialog/styles.css'

export function MyDialog(props) {
  const [show, setShow] = useState(false)
  const open = () => setShow(true)
  const close = () => setShow(false)

  return (
    <div>
      <button onClick={open} className='btn-open'>Открыть</button>
      <Dialog>
        <button onClick={close} className='btn-close'>
          <VisuallyHidden>Закрыть</VisuallyHidden>
          <span>X</span>
        </button>
        <p>Привет!</p>
      </Dialog>
    </div>
  )
}
```

__Добавление стилей на уровне компонента__

`Next.js` из коробки поддерживает [CSS-модули](https://github.com/css-modules/css-modules). CSS-модули должны иметь название `[name].module.css`. Они создают локальную область видимости для соответствующих стилей, что позволяет использовать одинаковые названия классов без риска возникновения коллизий. CSS-модуль импортируется как объект (обычно, именуемый `styles`), ключами которого являются названия соответствующих классов.

Пример использования CSS-модулей:

```css
/* components/Button/Button.module.css */
.danger {
  background-color: red;
  color: white;
}
```

```js
// components/Button/Button.js
import styles from './Button.module.css'

export const Button = () => (
  <button className={styles.danger}>
    Удалить
  </button>
)
```

При сборке CSS-модули конкатенируются и разделяются на отдельные минифицированные CSS-файлы, что позволяет загружать только необходимые стили.

__Поддержка `SASS`__

`Next.js` поддерживает файлы с расширением `.scss` и `.sass`. `SASS` также может использоваться на уровне компонентов (`.module.scss` и `.module.sass`). Для компиляции `SASS` в `CSS` необходимо установить [`sass`](https://github.com/sass/sass):

```bash
yarn add sass
```

Поведение компилятора `SASS` может быть кастомизировано в файле `next.config.js`, например:

```js
const path = require('path')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
}
```

__CSS-в-JS__

В `Next.js` можно использовать любое решение `CSS-в-JS`. Простейшим примером является использование встроенных стилей:

```js
export const Hi = ({ name }) => <p style={{ color: 'green' }}>Привет, {name}!</p>
```

`Next.js` также имеет встроенную поддержку [`styled-jsx`](https://github.com/vercel/styled-jsx):

```js
export const Bye = ({ name }) => (
  <div>
    <p>Пока, {name}. Скоро увидимся!</p>
    <style jsx>{`
      div {
        background-color: #3c3c3c;
      }
      p {
        color: #f0f0f0;
      }
      @media (max-width: 768px) {
        div {
          backround-color: #f0f0f0;
        }
        p {
          color: #3c3c3c;
        }
      }
    `}</style>
    <style global jsx>{`
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
    `}</style>
  </div>
)
```

### Макеты (Layouts)

Разработка `React-приложения` предполагает разделение страницы на отдельные компоненты. Многие компоненты используются на нескольких страницах. Предположим, что на каждой странице используется панель навигации и подвал:

```js
// components/layout.js
import Navbar from './navbar'
import Footer from './footer'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

__Примеры__

_Единственный макет_

Если в приложении используется только один макет, мы можем создать кастомное приложение (custom app) и обернуть приложение в макет. Поскольку компонент-макет будет переиспользоваться при изменении страниц, его состояние (например, значения инпутов) будет сохраняться:

```js
// pages/_app.js
import Layout from '../components/layout'

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
```

_Макеты на уровне страниц_

Свойство `getLayout` страницы позволяет возвращать компонент для макета. Это позволяет определять макеты на уровне страниц. Возвращаемая функция позволяет конструировать вложенные макеты:

```js
// pages/index.js
import Layout from '../components/layout'
import Nested from '../components/nested'

export default function Page() {
  return {
    // ...
  }
}

Page.getLayout = (page) => (
  <Layout>
    <Nested>{page}</Nested>
  </Layout>
)

// pages/_app.js
export default function App({ Component, pageProps }) {
  // использовать макет, определенный на уровне страницы, при наличии такового
  const getLayout = Component.getLayout || ((page) => page)

  return getLayout(<Component {...pageProps} />)
}
```

При переключении страниц состояние каждой из них (значения инпутов, позиция прокрутки и т.п.) будет сохраняться.

_Использование с `TypeScript`_

При использовании `TypeScript` сначала создается новый тип для страницы, включающей `getLayout`. Затем следует создать новый тип для `AppProps`, который перезаписывает свойство `Component` для обеспечения возможности использования созданного ранее типа:

```tsx
// pages/index.tsx
import type { ReactElement } from 'react'
import Layout from '../components/layout'
import Nested from '../components/nested'

export default function Page() {
  return {
    // ...
  }
}

Page.getLayout = (page: ReactElement) => (
  <Layout>
    <Nested>{page}</Nested>
  </Layout>
)

// pages/_app.tsx
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(<Component  {...pageProps} />)
}
```

_Получение данных_

Данные в макете можно получать на стороне клиента с помощью `useEffect` или утилит вроде `SWR`. Поскольку макет - это не страница, в нем в настоящее время нельзя использовать `getStaticProps` или `getServerSideProps`:

```js
import useSWR from 'swr'
import Navbar from './navbar'
import Footer from './footer'

export default function Layout({ children }) {
  const { data, error } = useSWR('/data', fetcher)

  if (error) return <div>Ошибка</div>
  if (!data) return <div>Загрузка...</div>

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

### Компонент `Image` и оптимизация изображений

Компонент `Image`, импортируемый из `next/image`, является расширением HTML-тега `img`, предназначенным для современного веба. Он включает несколько встроенных оптимизаций, позволяющих добиться хороших показателей `Core Web Vitals`. Эти оптимизации включают в себя следующее:

- улучшение производительности
- обеспечение визуальной стабильности
- ускорение загрузки страницы
- обеспечение гибкости (масштабируемости) изображений

_Пример использования локального изображения_

```js
import Image from 'next/image'
import imgSrc from '../public/some-image.png'

export default function Home() {
  return (
    <>
      <h1>Главная страница</h1>
      <Image
        src={imgSrc}
        alt=""
        role="presentation"
      />
    </h1>
  )
}
```

_Пример использования удаленного изображения_

_Обратите внимание_ на необходимость установки ширины и высоты изображения:

```js
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <h1>Главная страница</h1>
      <Image
        src="/some-image.png"
        alt=""
        role="presentation"
        width={500}
        height={500}
      />
    </h1>
  )
}
```

_Определение размеров изображения_

`Image` ожидает получение ширины и высоты изображения:

- в случае статического импорта (локальное изображение) ширина и высота вычисляются автоматически
- ширина и высота могут указываться явно с помощью соответствующих пропов
- если размеры изображения неизвестны, можно использовать проп `layout` со значением `fill`

Существует 3 способа решения проблемы неизвестных размеров изображения:

- использование режима макетирования `fill`: этот режим позволяет управлять размерами изображения с помощью родительского элемента. В этом случае размеры родительского элемента определяются с помощью `CSS`, а размеры изображения с помощью свойств `object-fit` и `object-position`
- нормализация изображений: если источник изображений находится под нашим контролем, мы можем добавить изменение размеров изображения при его возвращении в ответ на запрос
- модификация вызовов к `API`: в ответ на запрос может включаться не только само изображение, но и его размеры

_Правила стилизации изображений_

- выбирайте правильный режим макетирования
- используйте `className` - он устанавливается соответствующему элементу `img`. _Обратите внимание_: проп `style` не передается
- при использовании `layout="fill"` родительский элемент должен иметь `position: relative`
- при использовании `layout="responsive"` родительский элемент должен иметь `display: block`

Подробнее о компоненте `Image` см. ниже.

### Оптимизация шрифтов

`Next.js` автоматически встраивает шрифты в `CSS` во время сборки:

```js
// было
<link
  href="https://fonts.googleapis.com/css2?family=Inter"
  rel="stylesheet"
/>

// стало
<style data-href="https://fonts.googleapis.com/css2?family=Inter">
  @font-face{font-family:'Inter';font-style:normal...}
</style>
```

Для добавления на страницу шрифта используется компонент `Head`, импортируемый из `next/head`:

```js
// pages/index.js
import Head from 'next/head'

export default function IndexPage() {
  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter&display=optional"
        />
      </Head>
      <p>Привет, народ!</p>
    </div>
  )
}
```

Для добавления шрифта в приложение следует создать кастомный документ:

```js
// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDoc extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter&display=optional"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```

Автоматическую оптимизацию шрифтов можно отключить:

```js
// next.config.js
module.exports = {
  optimizeFonts: false
}
```

Подробнее о компоненте `Head` см. ниже.

### Компонент `Script`

Компонент `Script` позволяет разработчикам определять приоритет загрузки сторонних скриптов, что экономит время и улучшает производительность.

Приоритет загрузки скрипта определяется с помощью пропа `strategy`, который принимает одно из следующих значений:

- `beforeInteractive`: предназначено для важных скриптов, которые должны быть загружены и выполнены до того, как страница станет интерактивной. К таким скриптам относятся, например, обнаружение ботов и запрос разрешений. Такие скрипты внедряются в первоначальный `HTML` и запускаются перед остальным `JS`
- `afterInteractive`: для скриптов, которые могут загружаться и выполняться после того, как страница стала интерактивной. К таким скриптам относятся, например, менеджеры тегов и аналитика. Такие скрипты выполняются на стороне клиента и запускаются после гидратации
- `lazyOnload`: для скриптов, которые могут быть загружены в период простоя. К таким скриптам относятся, например, поддержка чатов и виджеты социальных сетей

_Обратите внимание_:

- `Script` поддерживает встроенные скрипты со стратегиями `afterInteractive` и `lazyOnload`
- встроенные скрипты, обернутые в `Script`, должны иметь атрибут `id` для их отслеживания и оптимизации

__Примеры__

_Обратите внимание_: компонент `Script` не должен помещаться внутрь компонента `Head` или кастомного документа.

_Загрузка полифилов_

```js
import Script from 'next/script'

export default function Home() {
  return (
    <>
      <Script
        src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserverEntry%2CIntersectionObserver"
        strategy="beforeInteractive"
      />
    </>
  )
}
```

_Отложенная загрузка_

```js
import Script from 'next/script'

export default function Home() {
  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="lazyOnload"
      />
    </>
  )
}
```

_Выполнение кода после полной загрузки страницы_

```js
import { useState } from 'react'
import Script from 'next/script'

export default function Home() {
  const [stripe, setStripe] = useState(null)

  return (
    <>
      <Script
        id="stripe-js"
        src="https://js.stripe.com/v3/"
        onLoad={() => {
          setStripe({ stripe: window.Stripe('pk_test_12345') })
        }}
      />
    </>
  )
}
```

_Встроенные скрипты_

```js
import Script from 'next/script'

<Script id="show-banner" strategy="lazyOnload">
  {`document.getElementById('banner').classList.remove('hidden')`}
</Script>

// или
<Script
  id="show-banner"
  dangerouslySetInnerHTML={{
    __html: `document.getElementById('banner').classList.remove('hidden')`
  }}
/>
```

_Передача атрибутов_

```js
import Script from 'next/script'

export default function Home() {
  return (
    <>
      <Script
        src="https://www.google-analytics.com/analytics.js"
        id="analytics"
        nonce="XUENAJFW"
        data-test="analytics"
      />
    </>
  )
}
```

### Обслуживание статических файлов

Статические ресурсы должны размещаться в директории `public`, находящейся в корневой директории проекта. Файлы, находящиеся в директории `public`, доступны по базовой ссылке `/`:

```js
import Image from 'next/image'

export default function Avatar() {
  return <Image src="/me.png" alt="me" width="64" height="64" >
}
```

Данная директория также отлично подходит для хранения таких файлов, как `robots.txt`, `favicon.png`, файлов, необходимых для верификации сайта Гуглом и другой статики (включая `.html`).

### Обновление в режиме реального времени

`Next.js` поддерживает обновление компонентов в режиме реального времени с сохранением локального состояния в большинстве случаев (это относится только к функциональным компонентам и хукам). Состояние компонента также сохраняется при возникновении ошибок (не связанных с рендерингом).

Для перезагрузки компонента достаточно в любом месте добавить `// @refresh reset`.

### `TypeScript`

`Next.js` поддерживает `TypeScript` из коробки:

```bash
yarn create next-app --typescript app-name
# или
yarn create next-app --ts app-name
```

Для `getStaticProps`, `getStaticPaths` и `getServerSideProps` существуют специальные типы `GetStaticProps`, `GetStaticPaths` и `GetServerSideProps`:

```tsx
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'

export const getStaticProps: GetStaticProps = async (context) => {
  // ...
}

export const getStaticPaths: GetStaticPaths = async () => {
  // ...
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // ...
}
```

Пример использования встроенных типов для интерфейса маршрутизации (API Routes):

```ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ message: 'Привет!' })
}
```

Ничто не мешает нам типизировать данные, содержащиеся в ответе:

```ts
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.status(200).json({ message: 'Пока!' })
}
```

Для кастомного приложения существует специальный тип `AppProps`:

```tsx
// import App from 'next/app'
import type { AppProps /*, AppContext */ } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Данный метод следует использовать только в случае, когда все страницы приложения
// должны предварительно рендериться на сервере
MyApp.getInitialProps = async (context: AppContext) => {
  // вызывает функцию `getInitialProps`, определенную на странице
  // и заполняет `appProps.pageProps`
  const props = await App.getInitialProps(context)

  return { ...props }
}
```

`Next.js` поддерживает настройки `paths` и `baseUrl`, определяемые в `tsconfig.json`.

### Переменные среды окружения

`Next.js` имеет встроенную поддержку переменных среды окружения, что позволяет делать следующее:

- использовать `.env.local` для загрузки переменных
- экстраполировать переменные в браузер с помощью префикса `NEXT_PUBLIC_`

Предположим, что у нас имеется такой файл `.env.local`:

```bash
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

Это приведет к автоматической загрузке `process.env.DB_HOST`, `process.env.DB_USER` и `process.env.DB_PASS` в среду выполнения `Node.js`, позволяя использовать их в методах получения данных и интерфейсе маршрутизации:

```js
// pages/index.js
export async function getStaticProps() {
  const db = await myDB.connect({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  })

  // ...
}
```

`Next.js` позволяет использовать переменные внутри файлов `.env`:

```bash
HOSTNAME=localhost
PORT=8080
HOST=http://$HOSTNAME:$PORT
```

Для того, чтобы передать переменную среды окружения в браузер к ней нужно добавить префикс `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
```

```js
// pages/index.js
import setupAnalyticsService from '../lib/my-analytics-service'

setupAnalyticsService(process.env.NEXT_PUBLIC_ANALYTICS_ID)

function HomePage() {
  return <h1>Привет, народ!</h1>
}

export default HomePage
```

В дополнение к `.env.local` можно создавать файлы `.env` (для обоих режимов), `.env.development` (для режима разработки) и `.env.production` (для производственного режима). _Обратите внимание_: `.env.local` всегда имеет приоритет над другими файлами, содержащими переменные среды окружения.

## Маршрутизация

### Введение

Маршрутизация в `Next.js` основана на концепции страниц.

Файл, помещаемый в директорию `pages`, автоматически становится роутом.

Файлы `index.js` привязываются к корневой директории:

- `pages/index.js` -> `/`
- `pages/blog/index.js` -> `/blog`

Роутер поддерживает вложенные файлы:

- `pages/blog/first-post.js` -> `/blog/first-post`
- `pages/dashboard/settings/username.js` -> `/dashboard/settings/username`

Динамические сегменты маршрутов определяются с помощью квадратных скобок:

- `pages/blog/[slug].js` -> `/blog/:slug` (`blog/first-post`)
- `pages/[username]/settings.js` -> `/:username/settings` (`/johnsmith/settings`)
- `pages/post/[...all].js` -> `/post/*` (`/post/2021/id/title`)

__Связь между страницами__

Для маршрутизации на стороне клиента используется компонент `Link`:

```js
import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/">
          Главная
        </Link>
      </li>
      <li>
        <Link href="/about">
          О нас
        </Link>
      </li>
      <li>
        <Link href="/blog/first-post">
          Пост номер раз
        </Link>
      </li>
    </ul>
  )
}
```

Здесь:

- `/` → `pages/index.js`
- `/about` → `pages/about.js`
- `/blog/first-post` → `pages/blog/[slug].js`

Для динамических сегментов можно использовать интерполяцию:

```js
import Link from 'next/link'

export default function Post({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

Или объект `URL`:

```js
import Link from 'next/link'

export default function Post({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={{
              pathname: '/blog/[slug]',
              query: { slug: post.slug },
            }}
          >
            <a>{post.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

Здесь:

- `pathname` - это название страницы в директории `pages` (`/blog/[slug]` в данном случае)
- `query` - это объект с динамическим сегментом (`slug` в данном случае)

Для доступа к объекту `router` в компоненте можно использовать хук `useRouter` или утилиту `withRouter`. Рекомендуется использовать `useRouter`.

### Динамические роуты

Для создания динамического роута в путь страницы необходимо добавить `[param]`.

Рассмотрим страницу `pages/post/[pid].jd`:

```js
import { useRouter } from 'next/router'

export default function Post() {
  const router = useRouter()
  const { pid } = router.query

  return <p>Пост: {pid}</p>
}
```

Роуты `/post/1`, `/post/abc` и т.д. будут совпадать с `pages/post/[pid].js`. Совпавший параметр передается странице как параметр строки запроса, объединяясь с другими параметрами.

Например, для роута `/post/abc` объект `query` будет выглядеть так:

```json
{ "pid": "abc" }
```

А для роута `/post/abc?foo=bar` так:

```json
{ "pid": "abc", "foo": "bar" }
```

Параметры роута перезаписывают параметры строки запроса, поэтому объект `query` для роута `/post/abc?pid=123` будет выглядеть так:

```json
{ "pid": "abc" }
```

Для роутов с несколькими динамическими сегментами `query` формируется точно также. Например, страница `pages/post/[pid]/[cid].js` будет совпадать с роутом `/post/123/456`, а `query` будет выглядеть так:

```json
{ "pid": "123", "cid": "456" }
```

Навигация между динамическими роутами на стороне клиента обрабатывается с помощью `next/link`:

```js
import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/post/abc">
          Ведет на страницу `pages/post/[pid].js`
        </Link>
      </li>
      <li>
        <Link href="/post/abc?foo=bar">
          Также ведет на страницу `pages/post/[pid].js`
        </Link>
      </li>
      <li>
        <Link href="/post/123/456">
          <a>Ведет на страницу `pages/post/[pid]/[cid].js`</a>
        </Link>
      </li>
    </ul>
  )
}
```

__Перехват всех путей__

Динамические роуты могут быть расширены для перехвата всех путей посредством добавления многоточия (`...`) в квадратные скобки. Например `pages/post/[...slug].js` будет совпадать с `/post/a`, `/post/a/b`, `/post/a/b/c` и т.д.

_Обратите внимание_: вместо `slug` можно использовать любое другое название, например, `[...param]`.

Совпавшие параметры передаются странице как параметры строки запроса (`slug` в данном случае) со значением в виде массива. Например, `query` для `/post/a` будет иметь такую форму:

```json
{ "slug": ["a"] }
```

А для `/post/a/b` такую:

```json
{ "slug": ["a", "b"] }
```

Роуты для перехвата всех путей могут быть опциональными - для этого параметр необходимо обернуть еще в одни квадратные скобки (`[[...slug]]`).

Например, `pages/post/[[...slug]].js` будет совпадать с `/post`, `/post/a`, `/post/a/b` и т.д.

Основное отличие между обычным и опциональным перехватчиками состоит в том, что с опциональным перехватчиком совпадает роут без параметров (`/post` в нашем случае).

Примеры объекта `query`:

```json
{ } // GET `/post` (пустой объект)
{ "slug": ["a"] } // `GET /post/a` (массив с одним элементом)
{ "slug": ["a", "b"] } // `GET /post/a/b` (массив с несколькими элементами)
```

_Обратите внимание_ на следующие особенности:

- статические роуты имеют приоритет над динамическими, а динамические - над перехватчиками, например:
  - `pages/post/create.js` - будет совпадать `/post/create`
  - `pages/post/[pid].js` - будут совпадать `/post/1`, `/post/abc` и т.д., но не с `/post/create`
  - `pages/post/[...slug].js` - будут совпадать с `/post/1/2`, `/post/a/b/c` и т.д., но не с `/post/create` и `/post/abc`
- страницы, обработанные с помощью автоматической статической оптимизации, будут гидратированы без параметров роутов, т.е. `query` будет пустым объектом (`{}`). После гидратации будет запущено обновление приложения для заполнения `query`

### Императивный подход к навигации на стороне клиента

В большинстве случаев для реализации навигации на стороне клиента достаточно компонента `Link` из `next/link`. Однако, для этого можно использовать и роутер из `next/router`:

```js
import { useRouter } from 'next/router'

export default function ReadMore() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/about')}>
      Читать подробнее
    </button>
  )
}
```

### Поверхностная (тихая) маршрутизация (Shallow Routing)

Тихий роутинг позволяет менять `URL` без перезапуска методов для получения данных, включая функции `getServerSideProps` и `getStaticProps`.

Мы получаем обновленные `pathname` и `query` через объект `router` (получаемый с помощью `useRouter()` или `withRouter()`) без потери состояния компонента.

Для включения тихого роутинга используется настройка `{ shallow: true }`:

```js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// текущий `URL` имеет значение `/`
export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // выполнить навигацию после первого рендеринга
    router.push('?counter=1', undefined, { shallow: true })
  }, [])

  useEffect(() => {
    // значение `counter` изменилось!
  }, [router.query.counter])
}
```

При обновлении `URL` изменится только состояние роута.

_Обратите внимание_: тихий роутинг работает только в пределах одной страницы. Предположим, что у нас имеется страница `pages/about.js` и мы выполняем следующее:

```js
router.push('?counter=1', '/about?counter=1', { shallow: true })
```

В этом случае текущая страница выгружается, загружается новая, методы для получения данных перезапускаются (несмотря на наличие `{ shallow: true }`).

## Интерфейс маршрутизации (API Routes)

### Введение

Любой файл, находящийся в директории `pages/api`, привязывается к `/api/*` и считается конечной точкой (endpoint) `API`, а не страницей. Код интерфейса маршрутизации остается на сервере и не влияет на размер клиентской сборки.

Следующий пример роута `pages/api/user.js` возвращает статус-код `200` и данные в формате `JSON`:

```js
export default function handler(req, res) {
  res.status(200).json({ name: 'Иван Петров' })
}
```

Функция `handler` принимает два параметра:

- `req` - экземпляр `http.IncomingMessage` + несколько встроенных посредников (см. ниже)
- `res` - экземпляр `http.ServerResponse` + несколько вспомогательных функций (см. ниже)

Для обработки различных методов можно использовать `req.method`:

```js
export default function handler(req, res) {
  if (req.method === 'POST') {
    // работаем с POST-запросом
  } else {
    // работаем с другим запросом
  }
}
```

__Случаи использования__

В новом проекте весь `API` может быть построен с помощью интерфейса маршрутизации. Существующий `API` не требуется обновлять. Другие случаи:

- маскировка `URL` внешнего сервиса
- использование переменных среды окружения, хранящихся на сервере, для безопасного доступа к внешним сервисам

__Особенности__

- интерфейс маршрутизации не определяет CORS-заголовки по умолчанию. Это делается с помощью посредников (см. ниже)
- интерфейс маршрутизации не может использоваться вместе с `next export`

Что касается динамических сегментов в роутах интерфейса маршрутизации, то они подчиняются тем же правилам, что и динамические части роутов страниц.

### Посредники (Middlewares)

Интерфейс маршрутизации включает следующих посредников, преобразующих входящий запрос (`req`):

- `req.cookies` - объект, содержащий куки, включенные в запрос (значением по умолчанию является `{}`)
- `req.query` - объект, содержащий строку запроса (значением по умолчанию является `{}`)
- `req.body` - объект, содержащий тело запроса, преобразованное на основе заголовка `Content-Type`, или `null`

__Кастомизация посредников__

Каждый роут может экспортировать объект `config` с настройками для посредников:

```js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}
```

- `bodyParser: false` - отключает разбор ответа (возвращается сырой поток данных - `Stream`)
- `bodyParser.sizeLimit` - максимальный размер тела запроса в любом формате, поддерживаемом [`bytes`](https://github.com/visionmedia/bytes.js)
- `externalResolver: true` - сообщает серверу, что данный роут обрабатывается внешним резолвером, таким как `express` или `connect`

__Добавление посредников__

Рассмотрим добавление промежуточного обработчика [`cors`](https://www.npmjs.com/package/cors).

Устанавливаем модуль:

```bash
yarn add cors
```

Добавляем `cors` в роут:

```js
import Cors from 'cors'

// инициализируем посредника
const cors = Cors({
  methods: ['GET', 'HEAD']
})

// вспомогательная функция для ожидания успешного разрешения посредника
// перед выполнением другого кода
// или для выбрасывания исключения при возникновении ошибки в посреднике
const runMiddleware = (req, res, next) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    )
  })

export default async function handler(req, res) {
  // запускаем посредника
  await runMiddleware(req, res, cors)

  // остальная логика `API`
  res.json({ message: 'Всем привет!' })
}
```

### Вспомогательные функции

Объект ответа (`res`) включает набор методов для улучшения опыта разработки и повышения скорости создания новых конечных точек.

Этот набор включает в себя следующее:

- `res.status(code)` - функция для установки статус-кода ответа
- `res.json(body)` - для отправки ответа в формате `JSON`, `body` - любой сериализуемый объект
- `res.send(body)` - для отправки ответа, `body` - `string`, `object` или `Buffer`
- `res.redirect([status,] path)` - для перенаправления на указанную страницу, `status` по умолчанию имеет значение `307` (временное перенаправление)

## Подготовка к продакшну

- используйте кеширование (см. ниже) везде, где это возможно
- убедитесь в том, что сервер и база данных находятся (развернуты) в одном регионе
- минимизируйте количество `JavaScript-кода`
- откладывайте загрузку "тяжелого" `JS` до момента его фактического использования
- убедитесь в правильной настройке логгирования
- убедитесь в правильной обработке ошибок
- настройте страницы `500` (ошибка сервера) и `404` (страница отсутствует)
- убедитесь, что приложение отвечает лучшим критериям производительности
- запустите `Lighthouse` для проверки производительности, лучших практик, доступности и поисковой оптимизации. Используйте производственную сборку и режим "Инкогнито" в браузере, чтобы ничто постороннее не влияло на результаты
- убедитесь, что используемые в вашем приложении фичи поддерживаются современными браузерами
- для повышения производительности используйте следующее:
  - `next/image` и автоматическую оптимизацию изображений
  - автоматическую оптимизацию шрифтов
  - оптимизацию скриптов

### Кеширование

Кеширование уменьшает время ответа и количество запросов к внешним сервисам. `Next.js` автоматически добавляет заголовки кеширования к иммутабельным ресурсам, доставляемым из `_next/static`, включая `JS`, `CSS`, изображения и другие медиа.

```bash
Cache-Control: public, max-age=31536000, immutable
```

Для ревалидации кеша страницы, которая была предварительно отрендерена в статическую разметку, используется настройка `revalidate` в функции `getStaticProps`.

_Обратите внимание_: запуск приложения в режиме разработки с помощью `next dev` отключает кеширование.

```bash
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
```

Заголовки кеширования также можно использовать в `getServerSideProps` и интерфейсе маршрутизации для динамических ответов. Пример использования `stale-while-revalidate`:

```js
// Значение считается свежим в течение 10 сек (s-maxage=10).
// Если запрос повторяется в течение 10 сек, предыдущее кешированное значение
// считается свежим. Если запрос повторяется в течение 59 сек,
// кешированное значение считается устаревшим, но все равно используется для рендеринга
// (stale-while-revalidate=59)
// После этого запрос выполняется в фоновом режиме и кеш заполняется свежими данными.
// После обновления на странице будут отображаться новое значение
export async function getServerSideProps({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  return {
    props: {}
  }
}
```

### Уменьшение количества используемого `JavaScript`

Для определения того, что включается в каждый `JS-бандл` можно воспользоваться следующими инструментами:

- [`Import Cost`](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) - расширение для `VSCode`, показывающее размер импортируемого пакета
- [`Package Phobia`](https://packagephobia.com/) - сервис для определения "стоимости" добавления в проект новой зависимости для разработки (dev dependency)
- [`Bundle Phobia`](https://bundlephobia.com/) - сервис для определения того, насколько добавление зависимости увеличит размер сборки
- [`Webpack Bundle Analyzer`](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer) - `Webpack-плагин` для визуализации сборки в виде интерактивной, масштабируемой древовидной структуры

Каждый файл в директории `pages` выделяется в отдельную сборку в процессе выполнения команды `next build`. Для ленивой загрузки компонентов и библиотек можно использовать динамический импорт.

## Аутентификация (Authentication)

Аутентификация - это процесс определения того, кем является пользователь, а авторизация - процесс определения его полномочий, т.е. того, к чему пользователь имеет доступ. `Next.js` поддерживает несколько паттернов аутентификации.

### Паттерны аутентификации

Паттерн аутентификации определяет стратегию получения данных. Далее необходимо выбрать провайдера аутентификации, который поддерживает выбранную стратегию. Основных паттерна аутентификации два:

- использование статической генерации для серверной загрузки состояния и получения данных пользователя на стороне клиента
- получение данных пользователя от сервера во избежание "вспышки" (flush) неаутентифицированного контента (имеется ввиду видимое пользователю переключение состояний приложения)

__Аутентификация при статической генерации__

`Next.js` автоматически определяет, что страница является статической, если на этой странице отсутствуют блокирующие методы для получения данных. Это означает отсутствие на странице `getServerSideProps`. В этом случае на странице рендерится начальное состояние, полученное от сервера, а затем на стороне клиента запрашиваются данные пользователя.

Одним из преимуществ использования данного паттерна является возможность доставки страниц из глобального `CDN` и их предварительная загрузка с помощью `next/link`. Это приводит к уменьшению времени до интерактивности (Time to Interactive, TTI).

Рассмотрим пример страницы профиля пользователя. На этой странице сначала рендерится шаблон (скелет), а после выполнения запроса на получения данных пользователя, отображаются эти данные:

```js
// pages/profile.js
import useUser from '../lib/useUser'
import Layout from './components/Layout'

export default function Profile() {
  // получаем данные пользователя на стороне клиента
  const { user } = useUser({ redirectTo: '/login' })

  // состояние загрузки, полученное от сервера
  if (!user || user.isLoggedIn === false) {
    return <Layout>Загрузка...</Layout>
  }

  // после выполнения запроса отображаются данные пользователя
  return (
    <Layout>
      <h1>Ваш профиль</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  )
}
```

__Аутентификация при рендеринге на стороне сервера__

Если на странице имеется асинхронная функция `getServerSideProps`, `Next.js` будет рендерить такую страницу при каждом запросе с использованием данных из этой функции.

```js
export async function getServerSideProps(context) {
  return {
    props: {} // будут переданы компоненту страницы как пропы
  }
}
```

Перепишем приведенный выше пример. При наличии сессии компонент `Profile` получит проп `user`. _Обратите внимание_ на отсутствие шаблона:

```js
// pages/profile.js
import withSession from '../lib/session'
import Layout from '../components/Layout'

export const getServerSideProps = withSession(async (req, res) => {
  const user = req.session.get('user')

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  return {
    props: {
      user
    }
  }
})

export default function Profile({ user }) {
  // отображаем данные пользователя, состояния загрузки не требуется
  return (
    <Layout>
      <h1>Ваш профиль</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  )
}
```

Преимуществом данного подхода является предотвращение вспышки неаутентифицированного контента перед выполнением перенаправления. Важно отметить, что запрос данных пользователя в `getServerSideProps` блокирует рендеринг до разрешения запроса. Поэтому во избежание создания узких мест и увеличения времени до первого байта (Time to Fist Byte, TTFB), следует убедиться в хорошей производительности сервиса аутентификации.

### Провайдеры аутентификации

Если у вас имеется база данных с пользователями, рассмотрите возможность использования одного из следующих решений:

- [`next-iron-session`](https://github.com/vercel/next.js/tree/canary/examples/with-iron-session) - низкоуровневая закодированная сессия без состояния
- [`next-auth`](https://github.com/nextauthjs/next-auth-example) - полноценная система аутентификации со встроенными провайдерами (Google, Facebook, GitHub и т.д.), JWT, JWE, email/пароль, магическими ссылками и др.

Если вы предпочитаете старый-добрый [`passport`](http://www.passportjs.org/):

- [`with-passport`](https://github.com/vercel/next.js/tree/canary/examples/with-passport)
- [`with-passport-and-next-connect`](https://github.com/vercel/next.js/tree/canary/examples/with-passport-and-next-connect)

## Продвинутые возможности

### Динамическая маршрутизация

`Next.js` поддерживает динамический `import`. Он позволяет загружать модули по необходимости. Это таккже работает с `SSR`.

В следующем примере мы реализуем неточный (fuzzy) поиск с помощью [`fuse.js`](https://fusejs.io/), загружая этот модуль динамически после того, как пользователь начинает вводить данные в поле для поиска:

```js
import { useState } from 'react'

const names = ['John', 'Jane', 'Alice', 'Bob', 'Harry']

export default function Page() {
  const [results, setResults] = useState([])

  return (
    <div>
      <input
        type="text"
        placeholder="Поиск"
        onChange={async ({ currentTarget: { value } }) => {
          // загружаем модуль динамически
          const Fuse = (await import('fuse.js')).default
          const fuse = new Fuse(names)

          setResults(fuse.search(value))
        }}
      />
      <pre>Результаты поиска: {JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
```

Динамический импорт - это способ разделения кода на части (code splitting), позволяющий загружать только тот код, который фактически используется на текущей странице.

Для динамического импорта `React-компонентов` рекомендуется использовать `next/dynamic`.

__Обычное использование__

В следующем примере мы динамически загружаем модель `../components/Hello`:

```js
import dynamic from 'next/dynamic'
import Header from '../components/Header'

const DynamicHello = dynamic(() => import('../components/Hello'))

export default function Home() {
  return (
    <div>
      <Header />
      <DynamicHello />
      <h1>Главная страница</h1>
    </div>
  )
}
```

__Динамический импорт именованного компонента__

Предположим, что у нас имеется такой компонент:

```js
// components/Hello.js
export const Hello = () => <p>Привет!</p>
```

Для его динамического импорта его необходимо вернуть из `Promise`, возвращаемого `import`:

```js
import dynamic from 'next/dynamic'
import Header from '../components/Header'

const DynamicHello = dynamic(() =>
  import('../components/Hello')
    .then((module) => module.Hello)
)

export default function Home() {
  return (
    <div>
      <Header />
      <DynamicHello />
      <h1>Главная страница</h1>
    </div>
  )
}
```

__Индикатор загрузки__

Для рендеринга состояния загрузки можно использовать настройку `loading`:

```js
import dynamic from 'next/dynamic'
import Header from '../components/Header'

const DynamicHelloWithCustomLoading = dynamic(
  () => import('../components/Hello'),
  { loading: () => <p>Загрузка...</p> }
)

export default function Home() {
  return (
    <div>
      <Header />
      <DynamicHelloWithCustomLoading />
      <h1>Главная страница</h1>
    </div>
  )
}
```

__Отключение `SSR`__

Для отключения импорта модуля на стороне сервера можно использовать настройку `ssr`:

```js
import dynamic from 'next/dynamic'
import Header from '../components/Header'

const DynamicHelloWithNoSSR = dynamic(
  () => import('../components/Hello'),
  { ssr: false }
)

export default function Home() {
  return (
    <div>
      <Header />
      <DynamicHelloWithNoSSR />
      <h1>Главная страница</h1>
    </div>
  )
}
```

Настройка `suspense` позволяет загружать компонент лениво подобно тому, как это делает сочетание `React.lazy` и `<Suspense>`. _Обратите внимание_, что это работает только на клиенте или на сервере с `fallback`. Полная поддержка `SSR` в конкурентном режиме находится в процессе разработки:

```js
import dynamic from 'next/dynamic'
import Header from '../components/Header'

const DynamicLazyHello = dynamic(() => import('../components/Hello'), { suspense: true })

export default function Home() {
  return (
    <div>
      <Header />
      <DynamicLazyHello />
      <h1>Главная страница</h1>
    </div>
  )
}
```

### Автоматическая статическая оптимизация

Если на странице присутствуют `getServerSideProps`, `Next.js` будет рендерить страницу при каждом запросе (рендеринг на стороне сервера).

В противном случае, `Next.js` выполняет предварительный рендеринг страницы в статическую разметку.

В процессе предварительного рендеринга объект роутера `query` будет пустым. После гидратации `Next.js` запускает обновление приложения для заполнения `query` параметрами маршрутизации.

`next build` генерирует HTML-файлы для статически оптимизированных страниц. Например, результатом для `pages/about.js` будет:

```bash
.next/server/pages/about.html
```

А если на эту страницу добавить `getServerSideProps`, то результат будет таким:

```bash
.next/server/pages/about.js
```

__Заметки__

- при наличии кастомного `App` оптимизация для страниц без статической генерации отключается
- при наличии кастомного `Document` с `getInitialProps` убедитесь в определении `ctx.req` перед рендерингом страницы на стороне сервера. Для страниц, которые рендерятся предварительно, `ctx.req` будет иметь значение `undefined`

### Экспорт статической разметки

`next export` позволяет экспортировать приложение в статический `HTML`. Такое приложение может запускаться без сервера.

Такое приложение поддерживает почти все возможности, предоставляемые `Next.js`, включая динамическую маршрутизацию, предварительный запрос и получение данных и динамический импорт.

`next export` работает за счет предварительного рендеринга всех страниц в `HTML`. Для динамических роутов страница может экспортировать функцию `getStaticPaths`, чтобы `Next.js` мог определить, какие страницы следует рендерить для данного роута.

`next export` рассчитан для приложений без рендеринга на стороне сервера или инкрементального рендеринга. Такие фичи, как инкрементальная статическая генерация и регенерация при использовании `next export` будут отключены.

Для экспорта приложения в статику после разработки приложения следует выполнить команду:

```bash
next build && next export
```

Статическая версия приложения будет записана в директорию `out`.

По умолчанию `next export` не требует настройки. HTML-файлы генерируются для всех страниц, определенных в директории `pages`. Для более продвинутых сценариев можно определить параметр `exportPathMap` в `next.config.js` для настройки генерируемых страниц.

__Заметки__

- с помощью `next export` мы генерируем HTML-версию приложения. Во время сборки для каждой страницы вызывается функция `getStaticProps`, результаты выполнения которой передаются компоненту страницы в виде пропов. Вместо `getStaticProps` можно использовать старый интерфейс `getInitialProps`, но это имеет некоторые ограничения
- режим `fallback: true` в `getStaticProps` не поддерживается
- интерфейс маршрутизации не поддерживается
- `getServerSideProps` не поддерживается
- локализованный роутинг не поддерживается
- дефолтный индикатор загрузки компонента `Image` не поддерживается (другие настройки `loader` поддерживаются)

### Абсолютный импорт и синонимы путей модулей

`Next.js` поддерживает настройки `baseUrl` и `paths` в файлах `tsconfig.json` и `jsconfig.json`.

`baseUrl` позволяет импортировать модули напрямую из корневой директории.

Пример:

```json
// `tsconfig.json` или `jsconfig.json`
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

```js
// components/button.js
export const Button = () => <button>Click Me</button>

// pages/index.js
import { Button } from 'components/button'

export default function Index() {
  return (
    <>
      <h1>Привет, народ!</h1>
      <Button />
    </>
  )
}
```

`paths` позволяет определять синонимы для путей модулей. Например:

```json
// `tsconfig.json` или `jsconfig.json`
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["components/*"]
    }
  }
}
```

```js
// components/button.js
export const Button = () => <button>Click Me</button>

// pages/index.js
import { Button } from '@/button'

export default function Index() {
  return (
    <>
      <h1>Привет, народ!</h1>
      <Button />
    </>
  )
}
```

### Кастомный сервер

Пример кастомного сервера:

```js
// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    // `true` обеспечивает разбор строки запроса
    const parseUrl = parse(req.url, true)
    const { pathname, query } = parseUrl

    switch (pathname) {
      case '/a':
        return app.render(req, res, '/a', query)
      case '/b':
        return app.render(req, res, '/b', query)
      default:
        handle(req, res, parsedUrl)
    }
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('Запущен по адресу: http://localhost:3000')
  })
})
```

Для запуска этого сервера необходимо обновить раздел `scripts` в файле `package.json` следующим образом:

```json
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

Кастомный сервер использует такой импорт для подключения к `Next.js-приложению`:

```js
const next = require('next')
const app = next({})
```

`next` - это функция, которая принимает объект со следующими настройками:

- `dev: boolean` - запуск сервера в режиме для разработки
- `dir: string` - корневая диретория проекта (по умолчанию `.`)
- `quiet: boolean` - если `true`, ошибки сервера не отображаются (по умолчанию `false`)
- `conf: object` - такой же объект, что используется в `next.config.js`

После этого `app` может использоваться для обработки входящих запросов.

По умолчанию `Next.js` обслуживает каждый файл в директории `pages` по пути, совпадающему с названием файла. При использовании кастомного сервера это может привести к возвращению одинакового контента для разных путей.

Для отключения маршрутизации, основанной на файлах в `pages`, используется настройка `useFileSystemPublicRoutes` в `next.config.js`:

```js
module.exports = {
  useFileSystemPublicRoutes: false
}
```

_Обратите внимание_: это отключает роутинг по названиям файлов только для `SSR`. Маршрутизация на стороне клиента по-прежнему будет иметь доступ к этим путям.

### Кастомное приложение

`Next.js` использует компонент `App` для инициализации страниц. Кастомизация этого компонента позволяет делать следующее:

- распределять макет (layout) между страницами
- сохранять состояние при переключении между страницами
- обрабатывать ошибки с помощью `componentDidCatch`
- внедрять в страницы дополнительные данные
- добавлять глобальные стили

Для перезаписи дефолтного `App` необходимо создать файл `pages/_app.js` следующего содержания:

```js
// pages/_app.js
import App from 'next/app'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)

  return { ...appProps }
}

export default MyApp
```

Проп `Component` - это активная страница. `pageProps` - это объект с начальными пропами, которые предварительно загружаются для страницы с помощью одного из методов для получения данных, в противном случае, данный объект будет пустым.

__Заметки__

- при добавлении кастомного `App` (создании файла `pages/_app.js`) при запущенном приложении может потребоваться перезапуск сервера для разработки
- добавление кастомного `getInitialProps` в `App` отключает автоматическую статическую оптимизацию страниц без статической генерации
- при добавлении `getInitialProps` в кастомное приложение следует `import App from 'next/app'`, вызвать `App.getInitialProps(appContext)` внутри `getInitialProps` и объединить объект ответа с возвращаемым значением
- в настоящее время `App` не поддерживает такие методы для получения данных, как `getStaticProps` или `getServerSideProps`

### Кастомные страницы ошибок

`Next.js` предоставляет дефолтные страницы для ошибок `404` и `500`. Для кастомизации этих страниц используются файлы `pages/404.js` и `pages/500.js`, соответственно:

```js
// pages/404.js
export default function Custom404() {
  return <h1>404 - Страница не найдена</h1>
}

// pages/500.js
export default function Custom500() {
  return <h1>500 - Ошибка на сервере</h1>
}
```

Для получения данных во время сборки на этих страницах может использоваться `getStaticProps`.

Ошибки 500 обслуживаются как на стороне клиента, так и на стороне сервера компонентом `Error`. Для перезаписи этого компонента необходимо создать файл `pages/_error.js` и добавить в него код вроде следующего:

```js
export default function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `На сервере возникла ошибка ${statusCode}`
        : `Ошибка возникла на клиенте`}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}
```

_Обратите внимание_: `pages/_error.js` используется только в продакшне. В режиме для разработки ошибка возвращается вместе со стеком вызовов для обеспечения возможности определения места ее возникновения.

Для рендеринга встроенной страницы ошибки также можно использовать компонент `Error`:

```js
import Error from 'next/error'

export async function getServerSideProps() {
  const res = await fetch('https://api.github.com/repos/harryheman/react-total')
  const errorCode = res.ok ? false : res.statusCode
  const data = await res.json()

  return {
    props: {
      errorCode,
      stars: data.stergazers_count
    }
  }
}

export default function Page({ errorCode, stars }) {
  if (errorCode) {
    return <Error statusCode={errorCode} />
  }

  return <div>Количество звезд: {stars}</div>
}
```

Компонент `Error` также принимает проп `title` для передачи текстового сообщения в дополнение к статус-коду.

### Директория `src`

Страницы приложения могут помещаться в директорию `src/pages` вместо корневой директории `pages`.

__Заметки__

- `src/pages` будет игнорироваться при наличии `pages`
- файлы с настройками, такие как `next.config.js` и `tsconfig.json` должны находиться в корневой директории проекта. То же самое касается директории `public`

### Локализованная маршрутизация (интернационализация)

`Next.js` имеет встроенную поддержку локализованного роутинга. Достаточно указать список локалей, дефолтную локаль и привязанные к домену локали.

Поддержа роутинга `i18n` означает интеграцию с такими библиотеками, как `react-intl`, `react-i18next`, `lingui`, `rosetta`, `next-intl` и др.

__Начало работы__

Для начала работы необходимо настроить `i18n` в файле `next.config.js`. Идентификатор локали выглядит как `язык-регион-скрипт`, например:

- `en-US` - американский английский
- `nl-NL` - нидерландский (голландский)
- `nl` - нидерландский без учета региона

```js
// next.config.js
module.exports = {
  i18n: {
    // Локали, поддерживаемые приложением
    locales: ['en-US', 'fr', 'nl-NL'],
    // Дефолтная локаль, которая будет использоваться
    // при посещении пользователем пути без префикса,
    // например, `/hello`
    defaultLocale: 'en-US',
    // Список доменов и привязанных к ним локалей
    // (требуется только в случае настройки маршрутизации на основе доменов)
    // Обратите внимание: поддомены должны включаться в значение домена,
    // например, `fr.example.com`
    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en-US'
      },
      {
        domain: 'example.nl',
        defaultLocale: 'nl-NL'
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
        // Опциональное поле `http` может использоваться для локального тестирования
        // локали, привязанной к домену (т.е. по `http` вместо `https`)
        http: true
      }
    ]
  }
}
```

__Стратегии локализации__

Существует 2 стратегии локализации: маршрутизация на основе субпутей (subpaths) и роутинг на основе доменов.

_Роутинг на основе субпутей_

В этом случае локаль помещается в `url`:

```js
// next.config.js
module.exports = {
  i18n: {
    locales: ['en-US', 'fr', 'nl-NL'],
    defaultLocale: 'en-US'
  }
}
```

Здесь `en-US`, `fr` и `nl-NL` будет доступны для перехода, а `en-US` будет использоваться по умолчанию. Для страницы `pages/blog` будут доступны следующие `url`:

- `/blog`
- `/fr/blog`
- `/nl-nl/blog`

Дефолтная локаль не имеет префикса.

_Роутинг на основе доменов_

В этом случае локали будут обслуживаться разными доменами:

```js
// next.config.js
module.exports = {
  i18n: {
    locales: ['en-US', 'fr', 'nl-NL', 'nl-BE'],
    defaultLocale: 'en-US',

    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en-US',
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
      },
      {
        domain: 'example.nl',
        defaultLocale: 'nl-NL',
        // Список указанных локалей будет обслуживаться этим доменом
        locales: ['nl-BE']
      }
    ]
  }
}
```

Для страницы `pages/blog` будут доступны следующие `url`:

- `example.com/blog`
- `example.fr/blog`
- `example.nl/blog`
- `example.nl/nl-BE/blog`

__Автоматическое определение локали__

Когда пользователь запускает приложение, `Next.js` пытается автоматически определить его локаль на основе заголовка `Accept-Language` и текущего домена. При обнаружении локали, отличающейся от дефолтной, выполняется перенаправление.

Если при посещении `example.com` запрос содержит заголовок `Accept-Language: fr;q=0.9`, в случае роутинга на основе домена выполняется перенаправление на `example.fr`, а в случае роутинга на основе субпутей - на `/fr`.

__Отключение автоматического определения локали__

```js
// next.config.js
module.exports = {
  i18n: {
    localeDetection: false
  }
}
```

__Доступ к информации о локали__

Информация о локали содержится в роутере, доступ к которому можно получить с помощью хука `useRouter`. Доступны следующие свойства:

- `locale` - текущая локаль
- `locales` - доступные локали
- `defaultLocale` - локаль по умолчанию

В случае предварительного рендеринга страниц с помощью `getStaticProps` или `getServerSideProps` информация о локали содержится в контексте, передаваемом функции.

При использовании `getStaticPaths` локали также содержатся в параметре `context`, передаваемом функции, в свойствах `locales` и `defaultLocale`.

__Переключение между локалями__

Для переключения между локалями можно использовать `next/link` или `next/router`.

Для `next/link` может быть указан проп `locale` для переключения на другую локаль. Если такой проп не указан, используется текущая локаль:

```js
import Link from 'next/link'

export default function IndexPage(props) {
  return (
    <Link href="/another" locale="fr">
      <a>Перейти к `/fr/another`</a>
    </Link>
  )
}
```

При использовании `next/router` локаль указывается в настройках:

```js
import { useRouter } from 'next/router'

export default function IndexPage(props) {
  const router = useRouter()

  return (
    <div
      onClick={() => {
        router.push('/another', '/another', { locale: 'fr' })
      }}
    >
      Перейти к `/fr/another`
    </div>
  )
}
```

_Обратите внимание_: для переключения локали с сохранением информации, хранящейся в роутере, такой так значения динамической строки запроса или значения скрытой строки запроса, в качестве значения пропа `href` можно использовать объект:

```js
import { useRouter } from 'next/router'
const router = useRouter()
const { pathname, asPath, query } = router
// Переключаем локаль с сохранением другой информации
router.push({ pathname, query }, asPath, { locale: nextLocale })
```

Если `href` включает локаль, автоматическое добавления префикса можно отключить:

```js
import Link from 'next/link'

export default function IndexPage(props) {
  return (
    <Link href="/fr/another" locale={false}>
      <a>Перейти к `/fr/another`</a>
    </Link>
  )
}
```

__Заметки__

- `Next.js` позволяет перезаписывать значение заголовка `Accept-Language` с помощью куки `NEXT_LOCALE=локаль`. При установке такой куки, `Accept-Language` будет игнорироваться.
- `Next.js` автоматически добавляет атрибут `lang` к тегу `html`. Однако, он не знает о возможных вариантах страницы, поэтому добавление мета-тега `hreflang` - задача разработчика (это можно сделать с помощью `next/head`).

__Статическая генерация__

_Динамические роуты и `getStaticProps`_

Для страниц, на которых используется динамическая маршрутизация с помощью `getStaticProps`, все локали, которые должны быть предварительно отрендерены, должны возвращаться из `getStaticPaths`. Вместе с объектом `params` возвращается поле `locale`, определяющее локаль для рендеринга:

```js
// pages/blog/[slug].js
export const getStaticPaths = ({ locales }) => {
  return {
    paths: [
      // При отсутствии `locale` генерируется только локаль по умолчанию
      { params: { slug: 'post-1' }, locale: 'en-US' },
      { params: { slug: 'post-1' }, locale: 'fr' },
    ],
    fallback: true
  }
}
```

Для автоматической статической оптимизации и нединамических страниц с `getStaticProps`, для каждой локали генерируется отдельная версия страницы. Это может существенно повлиять на время сборки в зависимости от количества локалей, определенных в `getStaticProps`.

Для решения этой проблемы следует использовать режим `fallback`. Это позволяет возвращать из `getStaticPaths` только самые популярные пути и локали для предварительного рендеринга во время сборки. Остальные страницы будут рендерится во время выполнения по запросу.

Если из `getStaticProps` нединамической страницы вернуть `notFound: true`, то соответствующий вариант страницы сгенерирован не будет:

```js
export async function getStaticProps({ locale }) {
  // Получаем посты из внешнего `API`
  const res = await fetch(`https://example.com/posts?locale=${locale}`)
  const posts = await res.json()

  if (posts.length === 0) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      posts
    }
  }
}
```

__Ограничения__

- `locales`: максимум 100 локалей
- `domains`: максимум 100 доменов

### Заголовки безопасности

[Шпаргалка и туториал по заголовкам безопасности](https://github.com/harryheman/React-Total/blob/main/md/security/security.md).

Для улучшения безопасности приложения предназначена настройка `headers` в `next.config.js`. Данная настройка позволяет устанавливать HTTP-заголовки ответов для всех роутов в приложении:

```js
// next.config.js
// Список заголовков
const securityHeaders = []

module.exports = {
  async headers() {
    return [
      {
        // Данные заголовки буду применяться ко всем роутам в приложении
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

__Настройки__

_`X-DNS-Prefetch-Control`_

Данный заголовок управляет предварительной загрузкой (prefetching) `DNS`, позволяя браузерам заблаговременно разрешать названия доменов для внешних ссылок, изображений, `CSS`, `JS` и т.д. Предварительная загрузка выполняется в фоновом режиме и уменьшает время реакции на клик пользователя по ссылке:

```js
{
  key: 'X-DNS-Prefetch-Control',
  value: 'on'
}
```

_`Strict-Transport-Security`_

Данный заголовок указывает браузеру использовать `HTTPS` вместо `HTTP`:

```js
{
  key: 'Strict-Transport-Security',
  // 2 года
  value: 'max-age=63072000; includeSubDomains; preload'
}
```

_`X-XSS-Protection`_

Данный заголовок предназначен для блокировки межсайтового скриптинга в старых браузерах, не поддерживающих заголовок `Content-Security-Policy`:

```js
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
}
```

_`X-Frame-Options`_

Данный заголовок определяет, может ли сайт открываться в `iframe`. Он также предназначен для старых браузеров, не поддерживающих настройку `frame-ancestors` заголовка `CSP`:

```js
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
}
```

_`Permissions-Policy`_

Данный заголовок позволяет определять, какие возможности и `API` могут использоваться в браузере (раньше он назывался `Feature-Policy`):

```js
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()'
}
```

_`X-Content-Type-Options`_

Данный заголовок запрещает браузеру автоматически определять тип содержимого при отсутствии заголовка `Content-Type`:

```js
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
}
```

_`Referrer-Policy`_

Данный заголовок управляет тем, какая информация о предыдущем сайте включается в ответ:

```js
{
  key: 'Referrer-Policy',
  value: 'origin-when-cross-origin'
}
```

_`Content-Security-Policy`_

Данный заголовок определяет разрешенные источники для загрузки скриптов, стилей, изображений, шрифтов, медиа и др.:

```js
{
  key: 'Content-Security-Policy',
  value: // Политика `CSP`
}
```

## API

### Next CLI

`Next CLI` позволяет запускать, собирать и экспортировать приложение.

Команда для получения списка доступных команд:

```bash
npx next -h
```

Пример передачи аргументов:

```bash
NODE_OPTIONS='--throw-deprecation' next
NODE_OPTIONS='-r esm' next
NODE_OPTIONS='--inspect' next
```

__Сборка__

Команда `next build` создает оптимизированную производственную сборку приложения. Для каждого роута отображается:

- размер (size) - количество ресурсов, загружаемых при запросе страницы на стороне клиента
- первоначально загружаемый (first load) `JS` - количество ресурсов, загружаемых при получении страницы от сервера

Флаг `--profile` позволяет включить производственный профайлинг:

```bash
next build --profile
```

Флаг `--verbose` позволяет получить более подробный вывод:

```bash
next build --verbose
```

__Разработка__

Команда `next dev` запускает приложение в режиме разработки с быстрой перезагрузкой кода, отчетами об ошибках и т.д.

По умолчанию приложение запускается по адресу `http://localhost:3000`. Порт может быть изменен с помощью флага `-p`:

```bash
npx next dev -p 4000
```

Для этого также можно использовать переменную `PORT`:

```bash
PORT=4000 npx next dev
```

Дефолтный хост (`0.0.0.0`) можно изменить с помощью флага `-H`:

```bash
npx next dev -H 192.168.1.2
```

__Продакшн__

Команда `next start` запускает приложение в производственном режиме. Перед этим приложение должно быть скомпилировано с помощью `next build`.

__Линтер__

Команда `next lint` запускает `ESLint` для всех файлов в директориях `pages`, `components` и `lib`. Дополнительные директории для проверки могут быть определены с помощью флага `--dir`:

```bash
next lint --dir utils
```

### Create Next App

CLI `create-next-app` - это простейший способ создать болванку `Next-проекта`.

```bash
npx create-next-app [app-name]
# or
yarn create next-app [app-name]
```

Или, если вам требуется поддержка `TypeScript`:

```bash
npx create-next-app [app-name] --typescript
# or
yarn create next-app [app-name] --ts
```

__Настройки__

- `--ts | --typescript` - инициализация `TS-проекта`
- `-e, --example [example-name][github-url]` - инициализация проекта на основе примера. В `URL` может быть указана любая ветка и/или поддиректория
- `--example-path [path-to-example]`
- `--use-npm`

### `next/router`

__`useRouter`__

Хук `useRouter` позволяет получить доступ к объекту `router` в любом функциональном компоненте:

```js
import { useRouter } from 'next/router'

export const ActiveLink = ({ children, href }) => {
  const router = useRouter()

  const style = {
    marginRight: 10,
    color: router.asPath === href ? 'green' : 'blue',
  }

  const handleClick = (e) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} style={style}>
      {children}
    </a>
  )
}
```

_Объект `router`_

Объект `router` возвращается `useRouter` и `withRouter` и содержит следующие свойства:

- `pathname: string` - текущий роут, путь страницы из `/pages` без `basePath` или `locale`
- `query: object` - строка запроса, разобранная в объект. По умолчанию имеет значение `{}`
- `asPath: string` - путь (включая строку запроса), отображаемый в браузере, без `basePath` или `locale`
- `isFallback: boolean` - находится ли текущая страница в резервном режиме?
- `basePath: string` - активный базовый путь
- `locale: string` - активная локаль
- `locales: string[]` - поддерживаемые локали
- `defaultLocale: string` - дефолтная локаль
- `domainsLocales: Array<{ domain, defaultLocalem locales }>` - локали для доменов
- `isReady: boolean` - готовы ли поля роутера к использованию? Может использоваться только в `useEffect`
- `isPreview: boolean` - находится ли приложение в режиме предварительного просмотра?

__`router.push`__

Метод `router.push` предназначен для случаев, когда `next/link` оказывается недостаточно.

```bash
router.push(url, as, options)
```

- `url: string | object` - путь для навигации
- `as: string | object` - опциональный декоратор для адреса страницы при отображении в браузере
- `options` - опциональный объект со следующими свойствами:
  - `scroll: boolean` - выполнять ли прокрутку в верхнюю часть области просмотра при переключении страницы? По умолчанию имеет значение `true`
  - `shallow: boolean` - позволяет обновлять путь текущей страницы без использования `getStaticProps`, `getServerSideProps` или `getInitialProps`. По умолчанию имеет значение `false`
  - `locale: string` - локаль новой страницы

_Использование_

Переключение на страницу `pages/about.js`:

```js
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button className="link" onClick={() => router.push('/about')}>
      О нас
    </button>
  )
}
```

Переключение на страницу `pages/post/[pid].js`:

```js
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button className="link" onClick={() => router.push('/post/abc')}>
      Подробнее
    </button>
  )
}
```

Перенаправление пользователя на страницу `pages/login.js` (может использоваться для реализации защищенных страниц):

```js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Получаем данные пользователя
const useUser = () => ({ user: null, loading: false })

export default function Page() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  return user ? <p>Привет, {user.name}!</p> : <p>Загрузка...</p>
}
```

Пример использования объекта вместо строки:

```js
import { useRouter } from 'next/router'

export default function ReadMore({ post }) {
  const router = useRouter()

  return (
    <button
      className='link'
      onClick={() => {
        router.push({
          pathname: '/post/[pid]',
          query: { pid: post.id }
        })
      }}
    >
      Подробнее
    </button>
  )
}
```

__`router.replace`__

Метод `router.replace` обновляет путь текущей страницы без добавления `URL` в стек `history`.

```js
router.replace(url, as, options)
```

_Использование_

```js
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button className="link" onClick={() => router.replace('/home')}>
      Главная
    </button>
  )
}
```

__`router.prefetch`__

Метод `router.prefetch` позволяет выполнять предварительную загрузку страниц для ускорения навигации. _Обратите внимание_: `next/link` выполняет предварительную загрузку страниц автоматически.

```bash
router.prefetch(url, as)
```

_Использование_

Предположим, что после авторизации мы перенаправляем пользователя на страницу профиля. Для ускорения навигации мы можем предварительно загрузить страницу профиля:

```js
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        /* Данные пользователя */
      }),
    }).then((res) => {
      // Выполняем перенаправление на предварительно загруженную страницу профиля
      if (res.ok) router.push('/dashboard')
    })
  }, [])

  useEffect(() => {
    // Предварительно загружаем страницу профиля
    router.prefetch('/dashboard')
  }, [])

  return (
    <form onSubmit={handleSubmit}>
      {/* Поля формы */}
      <button type="submit">Войти</button>
    </form>
  )
}
```

__`router.beforePopState`__

Метод `router.beforePopState` позволяет реагировать на событие `popstate` перед обработкой пути роутером.

```js
router.beforePopState(cb)
```

`cb` - это функция, которая запускается при возникновении события `popstate`. Данная функция получает объект события со следующими свойствами:

- `url: string` - путь для нового состояния (как правило, название страницы)
- `as: string` - `URL`, который будет отображен в браузере
- `options: object` - дополнительные настройки из `router.push`

_Использование_

`beforePopState` может использоваться для модификации запроса или принудительного обновления `SSR`, как в следующем примере:

```js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.beforePopState(({ url, as, options }) => {
      // Разрешены только указанные пути
      if (as !== '/' && as !== '/other') {
        // Заставляем `SSR` рендерить страницу 404
        window.location.href = as
        return false
      }

      return true
    })
  }, [])

  return <p>Добро пожаловать!</p>
}
```

__`router.back`__

Данный метод позволяет вернуться к предыдущей странице. При его использовании выполняется `window.history.back()`:

```js
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button className="link" onClick={() => router.back()}>
      Назад
    </button>
  )
}
```

__`router.reload`__

Данный метод перезагружает текущий `URL`. При его использовании выполняется `window.location.reload()`:

```js
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  return (
    <button className="link" onClick={() => router.reload()}>
      Обновить
    </button>
  )
}
```

__`router.events`__

Использование роутера приводит к возникновению следующих событий:

- `routeChangeStart(url, { shallow })` - возникает в начале обновления роута
- `routeChangeComplete(url, { shallow })` - возникает в конце обновления роута
- `routeChangeError(err, url, { shallow })` - возникает при провале или отмене обновления роута
- `beforeHistoryChange(url, { shallow })` - возникает перед изменением истории браузера
- `hashChangeStart(url, { shallow })` - возникает в начале изменения хеш-части `URL` (но не самого `URL`)
- `hashChangeComplete(url, { shallow })` - возникает в конце изменения хеш-части `URL` (но не самого `URL`)

_Обратите внимание_: здесь `url` - это адрес страницы, отображаемый в браузере, включая `basePath`.

_Использование_

```js
// pages/_app.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      console.log(
        `Выполняется переключение на страницу ${url} ${
          shallow ? 'с' : 'без'
        } поверхностной маршрутизации`
      )
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // При размонтировании компонента
    // отписываемся от события с помощью метода `off`
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  return <Component {...pageProps} />
}
```

__`withRouter`__

Вместо `useRouter` может использоваться `withRouter`:

```js
import { withRouter } from 'next/router'

function Page({ router }) {
  return <p>{router.pathname}</p>
}

export default withRouter(Page)
```

__`TypeScript`__

```ts
import React from 'react'
import { withRouter, NextRouter } from 'next/router'

interface WithRouterProps {
  router: NextRouter
}

interface MyComponentProps extends WithRouterProps {}

class MyComponent extends React.Component<MyComponentProps> {
  render() {
    return <p>{this.props.router.pathname}</p>
  }
}

export default withRouter(MyComponent)
```

### `next/link`

Компонент `Link`, экспортируемый из `next/link`, позволяет переключаться между страницами на стороне клиента.

Предположим, что в директории `pages` содержатся следующие файлы:

- `pages/index.js`
- `pages/about.js`
- `pages/blog/[slug].js`

Пример навигации по этим страницам:

```js
import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/">
          <a>Главная</a>
        </Link>
      </li>
      <li>
        <Link href="/about">
          <a>О нас</a>
        </Link>
      </li>
      <li>
        <Link href="/blog/hello-world">
          <a>Пост</a>
        </Link>
      </li>
    </ul>
  )
}
```

`Link` принимает следующие пропы:

- `href` - путь или `URL` для навигации. Единственный обязательный проп
- `as` - опциональный декоратор пути, отображаемый в адресной строке браузера
- `passHref` - указывает `Link` передать проп `href` дочернему компоненту. По умолчанию имеет значение `false`
- `prefetch` - предварительная загрузка страницы в фоновом режиме. По умолчанию - `true`. Предварительная загрузка страницы выполняется для любого `Link`, находящегося в области просмотра (изначально или при прокрутке). Предварительная загрузка может быть отключена с помощью `prefetch={false}`. Однако даже в этом случае предварительная загрузка выполняется при наведении курсора на ссылку. Для страниц со статической генерацией загружается JSON-файл для более быстрого переключения страницы. Предварительная загрузка выполняется только в производственном режиме
- `replace` - заменяет текущее состояние истории вместо добавления нового `URL` в стек. По умолчанию - `false`
- `scroll` - выполнение прокрутки в верхнюю часть области просмотра. По умолчанию - `true`
- `shallow` - обновление пути текущей страницы без перезапуска `getStaticProps`, `getServerSideProps` или `getInitialProps`. По умолчанию - `false`
- `locale` - по умолчанию к пути добавляется активная локаль. `locale` позволяет определить другую локаль. Когда имеет значение `false`, проп `href` должен включать локаль

__Роут с динамическими сегментами__

Пример динамического роута для `pages/blog/[slug].js`:

```js
import Link from 'next/link'

export default function Posts({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${encodeURIComponent(post.slug)}`}>
            <a>{post.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

__Кастомный компонент - обертка для тега `a`__

Если дочерним компонентом `Link` является кастомный компонент, оборачивающий `a`, `Link` должен иметь проп `passHref`. Это необходимо при использовании таких библиотек как `styled-components`. Без этого тег `a` не получит атрибут `href`, что негативно скажется на доступности и `SEO`.

```js
import Link from 'next/link'
import styled from 'styled-components'

// Создаем кастомный компонент, оборачивающий `a`
const RedLink = styled.a`
  color: red;
`

export default function NavLink({ href, name }) {
  // Добавляем `passHref`
  return (
    <Link href={href} passHref>
      <RedLink>{name}</RedLink>
    </Link>
  )
}
```

__Функциональный компонент__

Если дочерним компонентом `Link` является функция, то кроме `passHref`, необходимо обернуть ее в `React.forwardRef`:

```js
import Link from 'next/link'
import { forwardRef } from 'react'

// `onClick`, `href` и `ref` должны быть переданы DOM-элементу
const MyButton = forwardRef(({ onClick, href }, ref) => {
  return (
    <a href={href} onClick={onClick} ref={ref}>
      Кликни
    </a>
  )
})

export default function Home() {
  return (
    <Link href="/about" passHref>
      <MyButton />
    </Link>
  )
}
```

__Объект `URL`__

`Link` также принимает объект `URL`. Данный объект автоматически преобразуется в строку:

```js
import Link from 'next/link'

export default function Home() {
  return (
    <ul>
      <li>
        <Link
          href={{
            pathname: '/about',
            query: { name: 'test' },
          }}
        >
          <a>О нас</a>
        </Link>
      </li>
      <li>
        <Link
          href={{
            pathname: '/blog/[slug]',
            query: { slug: 'my-post' },
          }}
        >
          <a>Пост</a>
        </Link>
      </li>
    </ul>
  )
}
```

В приведенном примере у нас имеются ссылки на:

- предопределенный роут: `/about?name=test`
- динамический роут: `/blog/my-post`

__Замена `URL`__

```js
<Link href="/about" replace>
  <a>О нас</a>
</Link>
```

__Отключение прокрутки__

```js
<Link href="/?page=2" scroll={false}>
  <a>Загрузить еще</a>
</Link>
```

### `next/image`

__Обязательные пропы__

Компонент `Image` принимает следующие обязательные пропы:

- `src` - статически импортированный файл или строка, которая может быть абсолютной ссылкой или относительным путем в зависимости от пропа `loader` или настроек загрузки. При использовании ссылок на внешние ресурсы, эти ресурсы должны быть указаны в разделе `domains` файла `next.config.js`
- `width` - ширина изображения в пикселях: целое число без единицы измерения
- `height` - высота изображения в пикселях: целое число без единицы измерения

__Опциональные пропы__

- `layout` - `intrinsic | fixed | responsive | fill`. Значением по умолчанию является `intrinsic`
- `loader` - кастомная функция для разрешения `URL`. Установка этого пропа перезаписывает настройки из раздела `images` в `next.config.js`. `loader` принимает параметры `src`, `width` и `quality`

```js
import Image from 'next/image'

const myLoader = ({ src, width, quality }) => `https://example.com/${src}?w=${width}&q=${quality || 75}`

const MyImage = (props) => (
  <Image
    loader={myLoader}
    src="me.png"
    alt=""
    role="presentation"
    width={500}
    height={500}
  />
)
```

- `sizes` - строка, содержащая информацию о ширине изображения на различных контрольных точках. По умолчанию имеет значение `100vw` при использовании `layout="responsive"` или `layout="fill"`
- `quality` - качество оптимизированного изображения: целое число от `1` до `100`, где `100` - лучшее качество. Значением по умолчанию является `75`
- `priority` - если `true`, изображение будет считаться приоритетным и загружаться предварительно. Ленивая загрузка для такого изображения будет отключена
- `placeholder` - заменитель изображения. Возможными значениями являются `blur` и `empty`. Значением по умолчанию является `empty`. Когда значением является `blur`, в качестве заменителя используется значение пропа `blurDataURL`. Если значением `src` является объект из статического импорта и импортированное изображение имеет формат `JPG`, `PNG`, `WebP` или `AVIF`, `blurDataURL` заполняется автоматически

__Пропы для продвинутого использования__

- `objectFit` - определяет, как изображение заполняет родительский контейнер при использовании `layout="fill"`
- `objectPosition` - определяет, как изображение позиционируется внутри родительского контейнера при использовании `layout="fill"`
- `onLoadingComplete` - фукнция, которая вызывается после полной загрузки изображения и удаления заменителя
- `lazyBoundary` - строка, определяющая ограничительную рамку для определения пересечения области просмотра с изображением для запуска его ленивой загрузки. По умолчанию имеет значение `200px`
- `unoptimized` - если `true`, источник изображения будет использоваться как есть, без изменения качества, размера или формата. Значением по умолчанию является `false`

__Другие пропы__

Любые другие пропы компонента `Image` передаются дочернему элементу `img`, кроме следующих:

- `style` - для стилизации изображения следует использовать `className`
- `srcSet` - следует использовать размеры устройства
- `ref` - следует использовать `onLoadingComplete`
- `decoding` - всегда `async`

__Настройки__

Настройки для обработки изображений определяются в файле `next.config.js`.

_Домены_

Настройка доменов для провайдеров изображений позволяет защитить приложение от атак, связанных с внедрением в изображение вредоносного кода.

```js
module.exports = {
  images: {
    domains: ['assets.acme.com']
  }
}
```

_Размеры устройств_

Настройка `deviceSizes` позволяет определить список контрольных точек для ширины устройств потенциальных пользователей. Эти контрольные точки предназначены для предоставления подходящего изображения при использовании `layout="responsive"` или `layout="fill"`.

```js
// настройки по умолчанию
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  }
}
```

_Размеры изображений_

Настройка `imageSizes` позволяет определить размеры изображений в виде списка. Этот список объединяется с массивом размеров устройств для формирования полного перечня размеров для генерации набора источников (srcset) изображения.

```js
module.exports = {
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

### `next/head`

Компонент `Head` позволяет добавлять элементы в `head` страницы:

```js
import Head from 'next/head'

export default function IndexPage() {
  return (
    <div>
      <Head>
        <title>Заголовок страницы</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <p>Привет, народ!</p>
    </div>
  )
}
```

Проп `key` позволяет дедуплицировать теги:

```js
import Head from 'next/head'

export default function IndexPage() {
  return (
    <div>
      <Head>
        <title>Заголовок страницы</title>
        <meta property="og:title" content="Заголовок страницы" key="title" />
      </Head>
      <Head>
        <meta property="og:title" content="Новый заголовок страницы" key="title" />
      </Head>
      <p>Привет, народ!</p>
    </div>
  )
}
```

В данном случае будет отрендерен только `<meta property="og:title" content="Новый заголовок страницы" key="title" />`.

Контент `head` удаляется при размонтировании компонента.

`title`, `meta` и другие элементы должны быть прямыми потомками `Head`. Они могут быть обернуты в один `<React.Fragment>` или рендериться из массива.

### `next/server`

Посредники создаются с помощью функции `middleware`, находящейся в файле `_middleware`. Интерфейс посредников основан на нативных объектах `FetchEvent`, `Response` и `Request`.

Эти нативные объекты расширены для предоставления большего контроля над формированием ответов на основе входящих запросов.

Сигнатура функции:

```ts
import type { NextRequest, NextFetchEvent } from 'next/server'

export type Middleware = (
  request: NextRequest,
  event: NextFetchEvent
) => Promise<Response | undefined> | Response | undefined
```

Функция не обязательно должна называться `middleware`. Это всего лишь соглашение. Функция также не обязательно должна быть асинхронной.

__`NextRequest`__

Объект `NextRequest` расширяет нативный интерфейс `Request` следующими методами и свойствами:

- `cookies` - куки запроса
- `nextUrl` - расширенный, разобранный объект `URL`, предоставляющий доступ к таким свойствам, как `pathname`, `basePath`, `trailingSlash` и `i18n`
- `geo` - геоинформация о запросе
  - `country` - код страны
  - `region` - код региона
  - `city` - город
  - `latitude` - долгота
  - `longitude` - широта
- `ip` - IP-адрес запроса
- `ua` - агент пользователя

`NextRequest` может использоваться вместо `Request`.

```ts
import type { NextRequest } from 'next/server'
```

__`NextFetchEvent`__

`NextFetchEvent` расширяет объект `FetchEvent` методом `waitUntil`.

Данный метод позволяет продолжить выполнение функции после отправки ответа.

Например, `waitUntil` может использоваться для интеграции с такими системами мониторинга ошибок, как `Sentry`.

```ts
import type { NextFetchEvent } from 'next/server'
```

__`NextResponse`__

`NextResponse` расширяет `Response` следующими методами и свойствами:

- `cookies` - куки ответа
- `redirect()` - возвращает `NextResponse` с набором перенаправлений (redirects)
- `rewrite()` - возвращает `NextResponse` с набором перезаписей (rewrites)
- `next()` - возвращает `NextResponse`, который является частью цепочки посредников

```ts
import { NextResponse } from 'next/server'
```

## `next.config.js`

Файл `next.config.js` или `next.config.mjs` предназначен для кастомной продвинутой настройки `Next.js`.

Пример `next.config.js`:

```js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* настройки */
}

module.exports = nextConfig
```

Пример `next.config.mjs`:

```js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* настройки */
}

export default nextConfig
```

Можно использовать функцию:

```js
module.exports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    /* настройки */
  }
  return nextConfig
}
```

`phase` - это текущий контекст, для которого загружаются настройки. Доступными фазами являются:

- `PHASE_EXPORT`
- `PHASE_PRODUCTION_BUILD`
- `PHASE_PRODUCTION_SERVER`
- `PHASE_DEVELOPMENT_SERVER`

Фазы импортируются из `next/constants`:

```js
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      /* настройки для разработки */
    }
  }

  return {
    /* другие настройки */
  }
}
```

__Переменные среды окружения__

_Пример_

```js
module.exports = {
  env: {
    someKey: 'some-value'
  }
}
```

_Использование_

```js
export default function Page() {
  return <h1>Значением `someKey` является `{process.env.someKey}`</h1>
}
```

_Результат_

```js
export default function Page() {
  return <h1>Значением `someKey` является `some-value`</h1>
}
```

__Заголовки__

Настройка `headers` позволяет устанавливать кастомные HTTP-заголовки для входящих запросов:

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/about',
        headers: [
          {
            key: 'x-custom-header',
            value: 'кастомное значение заголовка',
          },
          {
            key: 'x-another-custom-header',
            value: 'еще одно кастомное значение заголовка'
          }
        ]
      }
    ]
  }
}
```

`headers` - асинхронная функция, возвращающая массив объектов со свойствами `source` и `headers`:

- `source` - адрес входящего запроса
- `headers` - массив объектов со свойствами `key` и `value`

Дополнительные параметры:

- `basePath: false | undefined` - если `false`, `basePath` не будет учитываться при совпадении, может использоваться только для внешних перезаписей
- `locale: false | undefined` - определяет, должна ли при совпадении включаться локаль
- `has` - массив объектов со свойствами `type`, `key` и `value`

Если в настройках определены два кастомных заголовка с одинаковыми ключами, будет учитываться только значение последнего заголовка.

_Поиск совпадения путей_

Разрешен поиск совпадения путей. Например, путь `/blog/:slug` будет совпадать с `/blog/hello-world` (без вложенных путей):

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/blog/:slug',
        headers: [
          {
            key: 'x-slug',
            value: ':slug', // Совпавшие параметры могут использоваться в качестве значений
          },
          {
            key: 'x-slug-:slug', // Совпавшие параметры могут использоваться в качестве ключей
            value: 'кастомное значение заголовка'
          }
        ]
      }
    ]
  }
}
```

_Поиск всех совпадений путей_

Для поиска всех совпадений можно использовать `*` после параметра, например, `/blog/:slug*` будет совпадать с `/blog/a/b/c/d/hello-world`:

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/blog/:slug*',
        headers: [
          {
            key: 'x-slug',
            value: ':slug*',
          },
          {
            key: 'x-slug-:slug*',
            value: 'кастомное значение заголовка'
          }
        ]
      }
    ]
  }
}
```

_Поиск совпадений путей с помощью регулярных выражений_

Для поиска совпадений с помощью регулярок используются круглые скобки после параметра, например, `/blog/:slug(\\d{1,})` будет совпадать с `/blog/123`, но не с `/blog/abc`:

```js
module.exports = {
  async headers() {
    return [
      {
        source: '/blog/:post(\\d{1,})',
        headers: [
          {
            key: 'x-post',
            value: ':post'
          }
        ]
      }
    ]
  }
}
```

Символы `( ) { } : * + ?` считаются частью регулярного выражения, поэтому при использовании в `source` в качестве обычных символов они должны быть экранированы с помощью `\\`:

```js
module.exports = {
  async headers() {
    return [
      {
        // Это будет совпадать с `/english(default)/something`
        source: '/english\\(default\\)/:slug',
        headers: [
          {
            key: 'x-header',
            value: 'some-value'
          }
        ]
      }
    ]
  }
}
```

_Поиск совпадения на основе заголовка, куки и строки запроса_

Для этого используется поле `has`. Заголовок будет установлен только при совпадении полей `source` и `has`.

Значением `has` является массив объектов со следующими свойствами:

- `type: string` - `header | cookie | host | query`
- `key: string` - ключ для поиска совпадения
- `value: string | undefined` - значение для проверки. Если `undefined`, любое значение будет совпадать. Для захвата определенной части значения может использоваться регулярное выражение. Например, если для `hello-world` используется значение `hello-(?<param>.*)`, `world` можно использовать в качестве значения `destination` как `:param`:

```js
module.exports = {
  async headers() {
    return [
      // Если имеется заголовок `x-add-header`,
      // будет установлен заголовок `x-another-header`
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-add-header',
          },
        ],
        headers: [
          {
            key: 'x-another-header',
            value: 'hello'
          }
        ]
      },
      // Если совпадают `source`, `query` и `cookie`,
      // будет установлен заголовок `x-authorized`
      {
        source: '/specific/:path*',
        has: [
          {
            type: 'query',
            key: 'page',
            // Значение `page` будет недоступно в заголовке,
            // поскольку значение указано и при этом
            // не используются именованная группа захвата, например `(?<page>home)`
            value: 'home',
          },
          {
            type: 'cookie',
            key: 'authorized',
            value: 'true',
          },
        ],
        headers: [
          {
            key: 'x-authorized',
            value: ':authorized'
          }
        ]
      },
      // Если имеется заголовок `x-authorized` и он
      // содержит искомое значение, будет установлен заголовок `x-another-header`
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-authorized',
            value: '(?<authorized>yes|true)',
          },
        ],
        headers: [
          {
            key: 'x-another-header',
            value: ':authorized'
          }
        ]
      },
      // Если значением хоста является `example.com`,
      // будет установлен данный заголовок
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'example.com',
          },
        ],
        headers: [
          {
            key: 'x-another-header',
            value: ':authorized'
          }
        ]
      }
    ]
  }
}
```

_`basePath` и `i18n`_

При наличии `basePath`, его значение автоматически добавляется к значению `source`, если не определено `basePath: false`:

```js
module.exports = {
  basePath: '/docs',

  async headers() {
    return [
      {
        source: '/with-basePath', // становится /docs/with-basePath
        headers: [
          {
            key: 'x-hello',
            value: 'world'
          }
        ]
      },
      {
        source: '/without-basePath', // не модифицируется
        headers: [
          {
            key: 'x-hello',
            value: 'world'
          }
        ],
        basePath: false
      }
    ]
  }
}
```

При наличии `i18n` к значению `source` автоматически добавляются значения `locales`, если не определено `locale: false` - в этом случае значение `source` должно включать префикс локали:

```js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  },

  async headers() {
    return [
      {
        source: '/with-locale', // автоматическая обработка всех локалей
        headers: [
          {
            key: 'x-hello',
            value: 'world'
          }
        ]
      },
      {
        // ручная установка локали
        source: '/nl/with-locale-manual',
        locale: false,
        headers: [
          {
            key: 'x-hello',
            value: 'world'
          }
        ]
      },
      {
        // это совпадает с `/`, поскольку `en` является `defaultLocale`
        source: '/en',
        locale: false,
        headers: [
          {
            key: 'x-hello',
            value: 'world'
          }
        ]
      },
      {
        // это преобразуется в /(en|fr|de)/(.*), поэтому не будет совпадать с роутами верхнего уровня, такими как
        // `/` или `/fr`, а с `/:path*` будет
        source: '/(.*)',
        headers: [
          {
            key: 'x-hello',
            value: 'worlld'
          }
        ]
      }
    ]
  }
}
```

__Дополнительная настройка `Webpack`__

Перед кастомизацией Вебпака убедитесь, что `Next.js` не имеет поддержки необходимого функционала.

Пример определения функции для настройки `webpack`:

```js
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // не забудьте вернуть модифицированный конфиг
    return config
  }
}
```

Данная функция выполняется дважды: один раз для сервера и еще один для клиента. Это позволяет разделять настройки с помощью свойства `isServer`.

Вторым аргументом, передаваемым функции является объект со следующими свойствами:

- `buildId: string` - уникальный идентификатор сборки
- `dev: boolean` - индикатор компиляции в режиме разработки
- `isServer: boolean` - если `true`, значит, выполняется компиляция для сервера
- `defaultLocales: object` - дефолтные лоадеры:
  - `babel: object` - дефолтные настройки `babel-loader`

Пример использования `defaultLoaders.babel`:

```js
module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.mdx/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: pluginOptions.options
        }
      ]
    })

    return config
  }
}
```

Настройка `distDir` позволяет определять директорию для сборки:

```js
module.exports = {
  distDir: 'build'
}
```

Настройка `generateBuildId` позволяет определять идентификатор сборки:

```js
module.exports = {
  generateBuildId: async () => {
    // Здесь можно использовать, например, хеш последнего гит-коммита
    return 'my-build-id'
  }
}
```

Пример отключения проверки кода с помощью `eslint` при сборке проекта:

```js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true
  }
}
```

Пример отключения `typescript` при сборке проекта:

```js
module.exports = {
  typescript: {
    ignoreBuildErrors: true
  }
}
```
