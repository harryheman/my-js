---
sidebar_position: 12
---

# Webpack

> [Webpack](https://webpack.js.org/) - самый популярный на сегодняшний день сборщик модулей (bundler),  предоставляющий широкие возможности для тонкой настройки процесса сборки приложения.

Файл с настройками, обычно, носит название "webpack.config.js" и экспортируется в виде CommonJS-модуля:

```js
// webpack.config.js
module.exports = {
  // config
}
```

Для сборки требуется установить <a href="https://www.npmjs.com/package/webpack">`webpack`</a> и <a href="https://www.npmjs.com/package/webpack-cli">`webpack-cli`</a> и выполнить команду `webpack`.

## Команды и флаги webpack-cli

[Список команд и флагов](https://webpack.js.org/api/cli/)

### Основные команды

- `serve` - запуcкает сервер для разработки (`webpack-dev-server`)
- `watch` - запускает вебпак и следит за изменениями файлов

### Основные флаги

- `--entry` - входная точка приложения (см. ниже), например: `webpack --entry ./src/index.js`
- `--config, -c` - путь к файлу с настройками, например: `webpack -c ./config/webpack.dev.js`
- `--merge, -m` - объединение двух и более файлов с настройками, например: `webpack -c ./webpack.common.js -c ./webpack.dev.js -m`
- `--progress` - отображение прогресса сборки, например: `webpack --progress`
- `--output-path, -o` - директория для сборки (см. ниже), например: `webpack -o ./build`
- `--watch, -w` - наблюдение за файлами, например: `webpack -w ./app.js`
- `--hot, -h` - включает "горячую" замену модулей (hot modules replacement)
- `--devtool, -d` - управление созданием карт ресурсов (source maps)
- `--mode` - режим сборки, например: `webpack --mode=development`
- `--analyze` - вызов `webpack-bundle-analyzer` для получения информации о сборке, например: `webpack --analyze`

## Настройки

### mode

`mode` определяет режим сборки. Режим, в свою очередь, определяет, какие инструменты вебпак будет использовать для генерации "бандла". Это могут быть, например, инструменты для минимизации и оптимизации кода (при производственном режиме).

```js
mode: 'development'
// или
mode: 'production'
```

### context

`context` определяет контекст сборки - основную директорию, абсолютный путь для разрешения входных точек и загрузчиков. Используется редко.

```js
context: path.resolve(__dirname, 'src')
```

### entry

`entry` определяет входную точку (точки) приложения. Входная точка - это основной JS-файл, в котором импортируются модули приложения. Значением `entry` может быть строка, массив, объект или функция. По умолчанию, имеет значение `index.js`.

```js
entry: path.resolve(__dirname, 'src/app.js')
// или
entry: ['./app.js', './test.js']
// или
// названия файлов сборки
entry: {
  app: './app.js',
  home: {import: './home.js', filename: 'pages/[name][ext]'},
  about: {import: './about.js', filename: 'pages/[name][ext]'}
}
// или
// зависимости
entry: {
  app: {import: './app.js', dependOn: 'react-vendors'},
  'react-vendors': ['react', 'react-dom', 'prop-types']
}
```

### output

`output` определяет директорию, в которую помещаются файлы сборки. Значением `output` может быть строка или объект. По умолчанию, имеет значение `dist`.

```js
output: path.resolve(__dirname, 'build')
// или
output: {
  // основные
  // очистка директории перед повторной сборкой
  // замена clean-webpack-plugin
  clean: {
    // сохранение файлов
    keep: /\ignored\/dir\//
  }

  // названия файлов
  // development
  filename: '[name].bundle.js',
  // production
  filename: '[name].[contenthash].bundle.js'

  // путь к директории
  path: path.resolve(__dirname, 'build'),

  // путь к файлам в index.html - относительный или абсолютный
  publicPath: './',

  // дополнительные
  // загрузка "чанков" из разных источников
  crossOriginLoading: 'anonymous',

  // экспериментальная возможность
  // к скриптам добавляется type="module"
  module: true,

  // возможности JS, которые могут использоваться в генерируемых файлах
  environment: {
    arrowFunction: true,
    bigIntLiteral: false,
    const: true,
    destructuring: true,
    dynamicImport: false,
    forOf: true
  }
}
```

### resolve

`resolve` определяет порядок разрешения модулей. Значением `resolve` является объект.

```js
resolve: {
  // основные
  // синонимы для импорта (import, require)
  // файл src/components/Home.js можно импортировать так:
  // import Home from '@/Home'
  alias: {
    '@': path.resolve(__dirname, 'src/components')
  },

  // файлы src/utilities/format.js и src/templates/layout.js можно импортировать так:
  // import { format, layout } from '_'
  alias: {
    _: [
      path.resolve(__dirname, 'src/utilities/'),
      path.resolve(__dirname, 'src/templates/')
    ]
  },

  // расширения модулей
  extensions: [
    '.mjs',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.vue',
    '.json'
  ],

  // дополнительные
  // название файла, используемое при разрешении директории
  // по умолчанию index
  mainFiles: ['main'],

  // директория с модулями
  // по умолчанию node_modules
  modules: ['app_modules']
},
```

### Только для development-режима

#### devtool

`devtool` определяет стиль карт ресурсов (source maps), т.е. способ их создания.

```js
// оптимальный вариант
// с точки зрения скорости и содержательности
devtool: 'eval-cheap-source-map'
```

#### devServer

`devServer` определяет настройки для `webpack-dev-server` (сервера для разработки). Сервер запускается командой `serve`.

```js
devServer: {
  // основные
  // gzip-сжатие обслуживаемых (served) файлов
  compress: true,

  // директория с файлами для обслуживания
  // строка или массив
  contentBase: path.resolve(__dirname, 'public'),
  // или
  contentBase: [
    path.resolve(__dirname, 'public'),
    path.resolve(__dirname, 'assets'),
  ],

  // вместо ошибки 404 (запрашиваемая страница отсутствует),
  // возвращается index.html
  historyApiFallback: true,

  // "горячая" замена модулей
  // требуется webpack.HotModuleReplacementPlugin
  hot: true,

  // открыть браузер после начала обслуживания файлов
  open: true,
  // или
  open: {
    app: ['Google Chrome', '--incognito', '--other-flags']
  },

  // порт
  port: 3000,

  // дополнительные
  // уровень сообщений, выводимых в консоль браузера
  clientLogLevel: 'silent',

  // перенаправление запросов
  proxy: {
    '/api': 'http://localhost:5000'
  },

  // осуществляется сборка обслуживаемых файлов
  // файлы помещаются в директорию, указанную в output.path
  // при повторной сборке могут возникнуть проблемы,
  // связанные с тем, что целевая директория не является пустой
  writeToDisk: true
}
```

### Только для production-режима

#### optimization

`optimization` определяет оптимизацию сборки. Все необходимые оптимизации выполняются вебпаком автоматически (минимизация, разделение кода на части, создание распределенного, совместно используемого кода и т.д.).

```js
optimization: {
  // создание распределенного файла времени выполнения (runtime)
  runtimeChunk: 'single'
}
```

#### perfomance

`perfomance` позволяет накладывать ограничения на размер генерируемых файлов.

```js
performance: {
  // подсказки
  hints: 'warning',
  // максимальный размер входной точки в байтах
  // по умолчанию 250000
  maxEntrypointSize: 512000,
  // максимальный размер статических ресурсов
  // по умолчанию 250000
  maxAssetSize: 512000
}
```

### Опциональные

#### watch

`watch` включает режим наблюдения за файлами. Это означает, что после сборки вебпак будет следить за изменениями.

```js
// по умолчанию false
watch: true
```

#### watchOptions

`watchOptions` определяет настройки режима наблюдения.

```js
watchOptions: {
  // осуществлять повторную сборку через секунду после обнаружения изменений
  aggregateTimeout: 1000,
  // игнорируемые файлы или директории
  ignored: /node_modules/,
  // проверять файлы на наличие изменений каждую секунду
  poll: 1000
}
```

#### externals

`externals` определяет внешние ресурсы. Данные ресурсы не включаются в сборку. В основном, используется при разработке библиотек.

```js
externals: {
  react: 'react',
  lodash: {
    commonjs: 'lodash',
    amd: 'lodash',
    root: '_', // глобальная переменная
  }
}
```

#### experiments

`experiments` определяет экспериментальные возможности сборки.

```js
experiments: {
  // разрешает использовать await без async
  topLevelAwait: true,

  // к скриптам добавляется type="modules"
  // используется совместно с output.module
  outputModule: true
}
```

## module

По умолчанию вебпак умеет работать только с JS и JSON-файлами. Для обработки других файлов требуются `loaders` ("лоадеры", загрузчики). Такие загрузчики определяются в `module.rules`. `module.rules` имеет следующий формат:

```js
module: {
  rules: [
    {
      // регулярное выражение для поиска файлов,
      // подлежащих преобразованию
      // CSS и SASS-файлы (.css, .scss или .sass)
      // без учета регистра
      test: /\.(c|sa|sc)ss$/i,

      // игнорируемые директории
      exclude: /node_modules/,

      // целевые директории
      // используется редко
      include: /app_modules/,

      // несколько загрузчиков
      // загрузчики применяются снизу вверх,
      // т.е. от последнего к первому
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            // количество предшествующих загрузчиков
            importLoaders: 1
          }
        },
        'sass-loader'
      ],
    }

    // или
    // один загрузчик
    // сокращение для use: [ { loader } ]
    {
      loader: 'css-loader',
      options: {
        modules: true
      }
    },

    // для обработки статических ресурсов достаточно указать type: 'asset'
    {
      test: /\.(jpe?g|png|gif|svg|eot|ttf|woff?2)$/i,
      type: 'asset'
    }
  ]
}
```

## loaders

[Список основных загрузчиков](https://webpack.js.org/loaders/)

Каждый загрузчик устанавливается отдельно и имеет собственный набор опций.

### Стилизация

- <a href="https://webpack.js.org/loaders/style-loader/">`style-loader`</a> - применение сгенерированных  `css-loader` стилей к DOM
- <a href="https://webpack.js.org/loaders/css-loader/">`css-loader`</a> - преобразование CSS, включая `@import` и `url()`
- <a href="https://webpack.js.org/loaders/sass-loader/">`sass-loader`</a>
- <a href="https://webpack.js.org/loaders/less-loader/">`less-loader`</a>

### Транспиляция

- <a href="https://webpack.js.org/loaders/babel-loader/">`babel-loader`</a> - преобразование "нового" JS и JSX в "старый" JS
- <a href="https://github.com/TypeStrong/ts-loader">`ts-loader`</a> - преобразование TypeScript в JavaScript

### Шаблонизация

- <a href="https://webpack.js.org/loaders/html-loader/">`html-loader`</a> - экспорт HTML в виде строки
- <a href="https://github.com/peerigon/markdown-loader">`markdown-loader`</a> - преобразование MD в HTML
- <a href="https://github.com/javiercf/react-markdown-loader">`react-markdown-loader`</a> - преобразование MD в React-компоненты без состояния

### Фреймворки

- <a href="https://github.com/vuejs/vue-loader">`vue-loader`</a> - загрузка и компиляция Vue-компонентов
- <a href="https://github.com/TheLarkInn/angular2-template-loader">`angular2-template-loader`</a> - загрузка и компиляция Angular-компонентов

## Пример применения загрузчиков

```js
const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-class-properties']
  }
}

module.exports = {
  // ...
  module: {
    rules: [
      // JavaScript, React
      {
        test: /\.m?jsx?$/i,
        exclude: /node_modules/,
        use: babelLoader
      },
      // TypeScript
      {
        test: /.tsx?$/i,
        exclude: /node_modules/,
        use: [babelLoader, 'ts-loader']
      },
      // CSS, SASS
      {
        test: /\.(c|sa|sc)ss$/i,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          'sass-loader']
      },
      // MD
      {
        test: /\.md$/i,
        use: ['html-loader', 'markdown-loader']
      },
      // статические файлы
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff2?)$/i,
        type: 'asset'
      }
    ]
  }
}
```

## plugins

[Список основных плагинов](https://webpack.js.org/plugins/)

Плагины позволяют выполнять определенные операции в процессе сборки. Каждый плагин устанавливается отдельно и имеет собственный набор опций. Обратите внимание, что многие плагины несовместимы с вебпаком 5 версии.

### Основные

- <a href="https://webpack.js.org/plugins/copy-webpack-plugin/">`copy-webpack-plugin`</a> - копирование файлов и директорий в output.path
- <a href="https://webpack.js.org/plugins/html-webpack-plugin/">`html-webpack-plugin`</a> - создание HTML-файла на основе шаблона
- <a href="https://webpack.js.org/plugins/mini-css-extract-plugin/">`mini-css-extract-plugin`</a> - создание CSS-файла для каждого JS-файла (только для production-режима)
- <a href="https://webpack.js.org/plugins/provide-plugin/">`webpack.ProvidePlugin`</a> - автоматическая загрузка модулей
- <a href="https://webpack.js.org/plugins/hot-module-replacement-plugin/">`webpack.HotModuleReplacementPlugin`</a> - "горячая" замена модулей (только для development-режима)

### Дополнительные

- <a href="https://webpack.js.org/plugins/progress-plugin/">`webpack.ProgressPlugin`</a> - кастомизация отображения прогресса сборки
- <a href="https://webpack.js.org/plugins/define-plugin/">`webpack.DefinePlugin`</a> - создание глобальных констант
- <a href="https://webpack.js.org/plugins/environment-plugin/">`webpack.EnvironmentPlugin`</a> - создание переменных окружения process.env
- <a href="https://github.com/mrsteele/dotenv-webpack">`dotenv-webpack`</a> - создание переменных окружения .env
- <a href="https://github.com/webpack-contrib/webpack-bundle-analyzer">`webpack-bundle-analyzer`</a> - подробная информация о сборке
- <a href="https://github.com/Klathmon/imagemin-webpack-plugin">`imagemin-webpack-plugin`</a> - уменьшение размера изображений

[Полный список загрузчиков и плагинов](https://github.com/webpack-contrib/awesome-webpack)

## Пример использования плагинов

```js
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const Dotenv = require('dotenv-webpack')

module.exports = {
  // ...
  plugins: [
    // копируем статические файлы из public/assets в output.path/assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `./public/assets`,
          to: 'assets'
        }
      ]
    }),

    // создаем index.html в output.path на основе public/index.html
    new HtmlWebpackPlugin({
      // <%= htmlWebpackPlugin.options.title %> в index.html
      // будет заменено на Webpack
      title: 'Webpack',
      favicon: './public/favicon.png',
      template: './public/index.html',
      filename: 'index.html'
    }),

    // делаем React глобально доступным
    new webpack.ProvidePlugin({
      React: 'react'
    }),

    // обеспечиваем доступ к переменным окружения
    new Dotenv({
      path: './config/.env'
    })
  ]
}
```

### Дополнительные инструменты

Устанавливаются отдельно и имеют собственные настройки.

- <a href="https://github.com/webpack/webpack-dev-server">`webpack-dev-server`</a> - сервер для разработки
- <a href="https://github.com/survivejs/webpack-merge">`webpack-merge`</a> - программное объединение двух и более файлов с настройками
- <a href="https://github.com/kentcdodds/webpack-config-utils">`webpack-config-utils`</a> - создание гибкого файла настроек
- <a href="https://www.npmjs.com/package/workbox-webpack-plugin">`workbox-webpack-plugin`</a> - создание сервис-воркера
