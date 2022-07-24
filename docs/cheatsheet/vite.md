---
sidebar_position: 29
title: Шпаргалка по Vite
description: Шпаргалка по Vite
keywords: ['javascript', 'js', 'vite', 'bundler', 'cheatsheet', 'шпаргалка', 'сборщик модулей']
tags: ['javascript', 'js', 'vite', 'bundler', 'cheatsheet', 'шпаргалка', 'сборщик модулей']
---

# Vite

> [Vite](https://vitejs.dev/) - это современный сборщик модулей (bundler) для `JavaScript-приложений`, менее кастомизируемый, чем `Webpack`, но гораздо более быстрый.

__Создание шаблона__

```bash
yarn create vite [project-name] --template [template-name]
```

- [project-name] - название проекта
- [template-name] - используемый шаблон

_Пример_

```bash
yarn create vite react-webrtc --template react
```

_SASS_

```bash
yarn add -D sass
```

__Плагины__

_Установка_

```bash
yarn add -D @vitejs/plugin-react
```

_Использование_

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

_Пользовательские плагины, которые показались мне интересными_

- [vite-plugin-pwa](https://github.com/antfu/vite-plugin-pwa)
- [vite-plugin-node](https://github.com/axe-me/vite-plugin-node)
- [vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)
- [vite-plugin-electron-renderer](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/electron-renderer)
- [vite-plugin-wasm-pack](https://github.com/nshen/vite-plugin-wasm-pack)

__Статические файлы__

Ссылки на файлы, находящиеся в директории `public`, должны начинаться с `/`. Предположим, что мы сохраняем аватары пользователей в директории `public/uploads/avatars`. Названием соответствующего файла является идентификатор пользователя + расширение файла. Тогда ссылка на файл `1.png` будет следующей:

```html
<img src='/uploads/avatars/1.png' alt='User Name' />
```

__Деплой статического сайта__

_Сборка и локальное тестирование приложения_

```bash
yarn build
yarn preview
```

_GitHub Pages_

Предположим, что мы деплоим на `https://[username].github.io/`. В корневой директории проекта создаем файл `deploy.sh` следующего содержания:

```sh
#!/usr/bin/env sh

# прерываем выполнение при наличии ошибок
set -e

# сборка
npm run build

# переходим в директорию со сборкой
cd dist

# если используем кастомный домен
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:[username]/[username].github.io.git main

cd -
```

_Netlify_

Создаем новый проект из GitHub со следующими настройками:

- Build Command: `vite build` или `npm run build`
- Publish directory: `dist`

_Heroku_

Авторизуемся в Heroku с помощью `heroku login`. В корневой директории проекта создаем файл `static.json` следующего содержания:

```json
{
  "root": "./dist"
}
```

Выполняем серию команд:

```bash
# изменение версии
$ git init
$ git add .
$ git commit -m "My site ready for deployment."

# создаем новое приложение с указанным названием
$ heroku apps:create example

# устанавливаем buildpack для статических сайтов
$ heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git

# публикуем сайт
$ git push heroku main

#  открываем браузер
$ heroku open
```

__Переменные среды окружения и режимы__

`Vite` загружает переменные среды окружения в объект `import.meta.env` из файлов `.env`, `env.local`, `env.[mode]` и др. Открытыми являются переменные, начинающиеся с `VITE_`, например:

```
PASSWORD=qwerty
VITE_SOME_KEY=some-public-value
```

В данном случае в клиентский код попадет только `VITE_SOME_KEY`.

Предопределенные переменные:

- `import.meta.env.MODE: 'development' | 'production'` - режим, в котором запущено приложение;
- `import.meta.BASE_URL: string` - основной путь приложения (определяется настройкой `base`);
- `import.meta.env.PROD: boolean`;
- `import.meta.env.DEV: boolean`.

__Настройки__

_Пример синонимов путей для `React-приложения`_

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
```
