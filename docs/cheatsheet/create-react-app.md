---
sidebar_position: 11
title: Шпаргалка по Create React App
description: Шпаргалка по Create React App
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'create react app', 'cra', 'cli', 'cheatsheet', 'интерфейс командной строки']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'create react app', 'cra', 'cli', 'cheatsheet', 'интерфейс командной строки']
---

# Create React App

> [Create React App](https://create-react-app.dev/) - это [интерфейс командной строки](https://ru.wikipedia.org/wiki/%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81_%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%BD%D0%BE%D0%B9_%D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B8) (Command Line Interface, CLI), позволяющий создавать предварительно настроенные `React-проекты`. Предварительная настройка включает в себя, но не исчерпывается, настройкой сборщика модулей `Webpack` и транспилятора `Babel`.

## Создание и запуск проекта

"my-app" - произвольное название проекта.

```bash
yarn create react-app my-app
# или
npm init react-app my-app
# или
npx create-react-app my-app

# смена директории
cd my-app

# запуск в режиме разработки
yarn start
# или
npm run start

# производственная сборка
yarn build
# или
npm run build
```

Флаг "--template" используется для выбора шаблона проекта.

```bash
yarn create react-app my-app --template cra-template-typescript
# "cra-template" можно опустить
yarn create my-app --template typescript
```

Имеется возможность создавать собственные шаблоны.

## Структура проекта

```
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── serviceWorker.js
    └── setupTests.js
```

Самыми важными файлами являются следующие:

- `public/index.html` - шаблон страницы (приложения)
- `src/index.js` - "входная точка" JavaScript в терминологии "бандлеров"

Эти файлы удалять **нельзя**. *Обратите внимание:* Вебпак обрабатывает только файлы, находящиеся в директории `src`.

## Вспомогательные инструменты

- Расширения для VSCode
  - [ES7 React/Redux/GraphQL/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
  - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- Расширения для Google Chrome
  - [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=ru)
  - [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

Настройки VSCode для Prettier (`settings.json`):

```json
"editor.defaultFormatter": "esbenp.prettier-vscode",
"prettier.endOfLine": "auto",
"prettier.jsxSingleQuote": true,
"prettier.packageManager": "yarn",
"prettier.singleQuote": true,
"prettier.semi": false,
"prettier.trailingComma": "none",
"prettier.useEditorConfig": false,
```

Полный список настроек смотрите [здесь](https://prettier.io/docs/en/options.html).

Для разработки компонентов в изоляции рекомендуется использовать <a href="https://storybook.js.org/">Storybook</a>:

```bash
npx -p @storybook/cli sb init
```

Для анализа бандла рекомендуется использовать <a href="https://www.npmjs.com/package/source-map-explorer">source-map-explorer</a>.

Устанавливаем пакет с помощью `yarn add source-map-explorer`. Добавляем в раздел `scripts` файла `package.json` строку `"analyze": "source-map-explorer 'build/static/js/*.js'"`. Выполняем анализ:

```bash
yarn build
yarn analyze
```

## Стили и другие статические ресурсы

Поскольку для сборки проекта используется Вебпак, все статические ресурсы (стили, изображения, шрифты и т.д.) должны импортироваться в JavaScript-файлы:

```css
// Button.css или Button.modules.css
@font-face {
  font-family: 'Montserrat';
  src: url('./Montserrat-Regular.ttf');
}
.btn {
  padding: 0.25em 0.75em;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25em;
  color: #1c1c1c;
}
```

```js
// Button.js
import './Montserrat-Regular.ttf'
import './Button.css'
// или
import styles from './Button.module.css'

import likeImg from './like.png'

export default function Button() {
  return (
    <button className="btn" /*или*/ className={styles.btn} >
      <img className="btn_like" src={likeImg} alt="like" />
    </button>
  )
}
```

Для стилизации также можно использовать специальные библиотеки, например, <a href="https://www.npmjs.com/package/styled-components">styled-components</a>. Шпаргалку по работе с данной библиотекой смотрите [здесь](styled-components.md).

Для сброса стилей в `index.css` нужно добавить строку `@import-normalize;`.

При сборке проекта CSS автоматически минифицируется и обрабатывается с помощью <a href="https://github.com/postcss/autoprefixer">autoprefixer</a>, автоматически добавляющего вендорные префиксы.

При большом количестве статических ресурсов, их можно поместить в директорию `public`. Ссылка на такие файлы делается с помощью `process.env.PUBLIC_URL`:

```jsx
<img src={process.env.PUBLIC_URL + '/img/logo.png'} />
```

*Обратите внимание:* такие файлы не будут обрабатываться Вебпаком.

## Абсолютный путь

Для использования абсолютных путей при импорте компонентов, необходимо в корневой директории (`my-app`) создать файл `jsconfig.json` или `tsconfig.json` (при использовании TypeScript) следующего содержания:

```json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

```jsx
import Button from 'components/Button';
// вместо
import Button from '../../components/Button';
```

## Пользовательские переменные среды окружения

Самый простой способ определения "кастомных" переменных среды окружения состоит в создании файла `.env` в корневой директории (`my-app`):

```bash
REACT_APP_TITLE="Some title"
REACT_APP_DESCRIPTION="Some description"
REACT_APP_BASE_URL=http://example.com/
# расширение переменной
REACT_APP_IMG_URL=$REACT_APP_BASE_URL/img/
```

Такие переменные должны начинаться с `REACT_APP`.

Использование:

```html
<!-- public/index.html -->
<title>%REACT_APP_TITLE%</title>
<meta name="description" content="%REACT_APP_DESCRIPTION%" />
```

```jsx
<img src={`${process.env.REACT_APP_IMG_URL}/logo.png`} />
```

Значения переменных заменяются при сборке проекта.

## Прогрессивное приложение

CRA позволяет легко создавать прогрессивные веб-приложения:

```bash
yarn create react-app my-app --template pwa
```

```jsx
// src/index.js
serviceWorker.register();
```

*Обратите внимание:* регистрацию сервис-воркера следует запускать только при сборке проекта.

## Проксирование (перенаправление запросов)

По умолчанию все запросы отправляются к серверу, на котором запущено приложение (`http://localhost:3000`). Для перенаправления запросов к серверу, использующему другой порт, необходимо добавить в файл `package.json` следующую строку:

```json
"proxy": "http://localhost:5000"
```

Также можно воспользоваться специальной библиотекой:

```bash
yarn add http-proxy-middleware
```

```jsx
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  )
}
```

## Разворачивание (деплой) проекта

Существует множество различных вариантов разворачивания приложения. Это можно сделать как локально, так и с помощью генераторов статических сайтов, таких как Netlify, Heroku, Vercel и т.д.

На мой взгляд, самым простым способом является "деплой" SPA-приложения на Netlify:

```bash
# установка CLI
yarn global add netlify-cli
# авторизация
netlify login
# деплой демо-версии
netlify deploy
# окончательный деплой
netlify deploy --prod
```

Имеется возможность продолжительной/длящейся интеграции (`CI/CD`) с `Netlify` репозитория, размещенного на `Github`.

Другие варианты деплоя можно найти [здесь](https://create-react-app.dev/docs/deployment).
