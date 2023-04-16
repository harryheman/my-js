---
slug: browser-extension
title: Разрабатываем расширение для браузера
description: Туториал по разработке полезного браузерного расширения с помощью фреймворка Plasmo
authors: harryheman
tags: [javascript, js, typescript, ts, react.js, reactjs, react, browser extension, plasmo, браузерное расширение, расширение для браузера, mdn, search, поиск]
---

Hello, world!

В этом небольшом туториале мы с вами разработаем простое, но полезное расширение для браузера с помощью [Plasmo](https://www.plasmo.com/).

Наше расширение будет представлять собой вызываемый сочетанием клавиш попап с инпутом для поиска информации на [MDN](https://developer.mozilla.org/en-US/) с выводом 5 лучших результатов в виде списка. Кроме основного функционала, мы добавим страницу настроек для кастомизации цветов и отображения хлебных крошек. Мы будем разрабатывать расширения для Chrome, которое также будет работать в Firefox.

Вот как это будет выглядеть:

<img src="https://habrastorage.org/webt/2b/22/wn/2b22wndyxvqm1_axjfttw0c-hlg.png" />
<br />

Для тех, кого интересует только код, вот [ссылка на соответствующий репозиторий](https://github.com/harryheman/Blog-Posts/tree/master/mdn-finder).

<!--truncate-->

## Основной функционал - попап с поиском

Для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Создаем шаблон приложения:

```bash
# mdn-finder - название приложения/расширения
yarn create plasmo mdn-finder
```

Переходим в созданную директорию и устанавливаем зависимости:

```bash
cd mdn-finder

yarn
```

Устанавливаем дополнительные зависимости, необходимые для работы поиска:

```bash
yarn add @plasmohq/storage downshift flexsearch fzf swr
```

- [@plasmohq/storage](https://github.com/PlasmoHQ/storage) - абстракция над [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API), который может использоваться расширениями браузера для локального хранения данных;
- [downshift](https://www.downshift-js.com/) - библиотека, предоставляющая примитивы для разработки простых, гибких, отвечающих всем критериям WAI-ARIA React-компонентов autocomplete/combobox или select/dropdown;
- [flexsearch](https://github.com/nextapps-de/flexsearch) - библиотека для реализации полнотекстового поиска;
- [fzf](https://github.com/ajitid/fzf-for-js) - библиотека для реализации неточного (fuzzy) поиска;
- [swr](https://swr.vercel.app/ru) - хуки React для получения, кэширования и мутации данных.

Структура проекта будет следующей:

```
- assets
  - icon.png
  - search-index.json
  - search.png
- src
  - components
    - Search.tsx
  - search
    - fuzzy-search.ts
    - search-utils.ts
    - search.tsx
  - background.ts
  - options.tsx
  - popup.tsx
  - storage.ts
  - style.css
  - ...
```

После переноса файлов в директорию `src`, необходимо немного отредактировать файл `tsconfig.json`:

```json
{
  // ...
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~*": [
        "./src/*"
      ]
    }
  }
}
```

О самом поиске я рассказывал в [этой статье](https://habr.com/ru/company/timeweb/blog/585910/), поэтому в данном туториале мы сосредоточимся на Plasmo. Скопируйте файлы из директорий `components`, `search` и `assets`, а также файл `style.css` из репозитория проекта. Поисковый индекс (`search-index.json`), также можно копировать с [MDN](https://developer.mozilla.org/en-US/search-index.json). Запросы к MDN из другого источника блокируются [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), поэтому поисковый индекс хранится локально.

Для того, чтобы иметь возможность работать с поисковым индексом, необходимо немного отредактировать файл `package.json`:

```json
{
  // ...
  "manifest": {
    "web_accessible_resources": [
      {
        "resources": [
          "assets/search-index.json"
        ],
        "matches": [
          "https://*/*"
        ]
      }
    ],
    "host_permissions": [
      "https://*/*"
    ]
  }
}
```

Точкой входа приложения Plasmo является файл `popup.tsx`. Как следует из названия, этот компонент отвечает за рендеринг попапа, в котором будет находиться инпут для поиска. Редактируем этот файл следующим образом:

```javascript
import Search from './components/Search'
import './style.css'

function IndexPopup() {
  return <Search preload={true} />
}

export default IndexPopup
```

Запускаем сервер для разработки с помощью команды `yarn dev`. Выполнение этой команды приводит к генерации директории `build/chrome-mv3-dev` с файлами расширения.

Переходим по адресу `chrome://extensions/` и загружаем расширение в браузер (кнопка "Загрузить распакованное расширение"/"Load unpacked extension"):

<img src="https://habrastorage.org/webt/rk/dj/61/rkdj61shaakmqltsfl_xnd09_2i.png" />
<br />

В режиме разработки расширение, загруженное в браузер, автоматически обновляется при изменении соответствующих файлов.

Сочетание клавиш для запуска расширения можно установить на странице `chrome://extensions/shortcuts`:

<img src="https://habrastorage.org/webt/nu/m9/r4/num9r47zvohex0x5po872p3kf-q.png" />
<br />

Для создания производственной сборки необходимо выполнить команду `yarn build`. По умолчанию создается сборка для Chrome. В настоящее время Plasmo также поддерживает создание сборок для Firefox. Команда для создания такой сборки: `yarn build --target=firefox-mv2`. Подробнее почитать об этом можно [здесь](https://docs.plasmo.com/framework/workflows/build).

Для тестирования расширения в Firefox необходимо сделать 2 вещи:

- создать в директории `src` файл `background.ts` следующего содержания:

```javascript
export {}
```

Этот файл предназначен для запуска скриптов, отвечающих за выполнение фоновых задач. К таким скриптам относится, например, логика [сервис-воркера](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). Подробнее почитать об этом можно [здесь](https://docs.plasmo.com/framework/background-service-worker). Почему-то без этого файла расширение в Firefox не запускается.

- создать производственную сборку в виде архива с помощью команды `yarn build --target=firefox-mv2 --zip`.

## Дополнительный функционал - страница настроек

Для инициализации страницы настроек достаточно создать файл `options.tsx` в директории `src`.

Простейшим способом обмена данными между попапом и страницей настроек (а также другими скриптами) является использование предоставляемого Plasmo [хранилища](https://docs.plasmo.com/framework/storage).

Создаем в директории `src` файл `storage.ts` следующего содержания:

```javascript
import { Storage } from '@plasmohq/storage'

// ключ объекта настроек
export const OPTIONS_KEY = 'mdn_finder_options'

// дефолтные настройки
export const defaultOptions = {
  // цвет фона
  backgroundColor: '#282c34',
  // цвет текста
  textColor: '#f7f7f7',
  // фон выделения
  selectionBackground: '#5cb85c',
  // цвет выделения
  selectionColor: '#282c34',
  // индикатор отображения хлебных крошек в списке результатов поиска
  showUrl: true
}

// создаем экземпляр хранилища
const storage = new Storage()

// и экспортируем его
export default storage
```

Редактируем файл `options.tsx` следующим образом:

```javascript
import { useRef } from 'react'
import storage, { defaultOptions, OPTIONS_KEY } from '~storage'
import './style.css'

export default function IndexOptions() {
  // ссылка на кнопку отправки формы
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // обработчик отправки формы
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    // получаем данные формы в виде объекта
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries(),
    )

    try {
      // записываем настройки в хранилище
      await storage.set(OPTIONS_KEY, formData)

      // меняем текст кнопки
      if (btnRef.current) {
        btnRef.current.textContent = 'Saved'

        const id = setTimeout(() => {
          btnRef.current.textContent = 'Save'
          clearTimeout(id)
        }, 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <form className='options' onSubmit={onSubmit}>
      <label>
        Background color:{' '}
        <input
          type='color'
          name='backgroundColor'
          defaultValue={defaultOptions.backgroundColor}
        />
      </label>
      <label>
        Result item color:{' '}
        <input
          type='color'
          name='textColor'
          defaultValue={defaultOptions.textColor}
        />
      </label>
      <label>
        Selection background:{' '}
        <input
          type='color'
          name='selectionBackground'
          defaultValue={defaultOptions.selectionBackground}
        />
      </label>
      <label>
        Selection color:{' '}
        <input
          type='color'
          name='selectionColor'
          defaultValue={defaultOptions.selectionColor}
        />
      </label>
      <label>
        Show URL:{' '}
        <input
          type='checkbox'
          name='showUrl'
          defaultChecked={defaultOptions.showUrl}
        />
      </label>
      <button ref={btnRef}>Save</button>
    </form>
  )
}
```

Для того, чтобы попасть на страницу настроек, необходимо кликнуть по иконке расширения и выбрать пункт "Параметры"/"Options":

<img src="https://habrastorage.org/webt/y0/jd/x3/y0jdx3c7reh2pb5epfzefwbuhrm.png" />
<br />
<img src="https://habrastorage.org/webt/t9/lc/ol/t9lcolgtrtfxdfgglyy0i6eq6py.png" />
<br />

Возвращаемся к попапу. Редактируем файл `search/search.tsx`. Импортируем хранилище и извлекаем из него настройки:

```javascript
import storage, { defaultOptions, OPTIONS_KEY } from '~storage'

// ...

function InnerSearchNavigateWidget(props: InnerSearchNavigateWidgetProps) {
  // ...
  const [options, setOptions] = useState(defaultOptions)

  // ...
  useEffect(() => {
    storage.get<typeof options>(OPTIONS_KEY).then((opts) => {
      if (opts) {
        setOptions(opts)
      }
    })
  }, [])

  // далее работаем с этим компонентом
}
```

Индикатор отображения хлебных крошек (`options.showUrl`) используется при формировании списка результатов поиска:

```javascript
resultItems.map((item, i) => (
  <div
    {...getItemProps({
      key: item.url,
      className:
        'result-item ' + (i === highlightedIndex ? 'highlight' : ''),
      item,
      index: i,
    })}
  >
    <HighlightMatch title={item.title} q={inputValue} />
    {/* ! */}
    {Boolean(options.showUrl) ? (
      <>
        <br />
        <BreadcrumbURI uri={item.url} positions={item.positions} />
      </>
    ) : null}
  </div>
))
```

Цвет фона (`options.backgroundColor`) передается элементу формы:

```javascript
<form
  // ...
  style={
    {
      '--background-color': options.backgroundColor,
    } as React.CSSProperties
  }
>
  {/* ... */}
</form>
```

В файле `style.css` у нас имеются такие строки:

```css
.search-form {
  --background-color: var(--dark);

  /* ... */
  background-color: var(--background-color);
}
```

Остальные цвета передаются контейнеру с результатами поиска:

```javascript
<div
  className='search-results'
  style={
    {
      '--text-color': options.textColor,
      '--selection-background': options.selectionBackground,
      '--selection-color': options.selectionColor,
    } as React.CSSProperties
  }
>
  {searchResults}
</div>
```

В `style.css` у нас имеются такие строки:

```css
.search-results {
  --text-color: var(--light);
  --selection-background: var(--success);
  --selection-color: var(--dark);
}

.result-item span,
.result-item small {
  color: var(--text-color);
}

.result-item mark {
  background-color: var(--selection-background);
  color: var(--selection-color);
}
```

Спасибо переменным CSS за их динамичность :)

Меняем настройки:

<img src="https://habrastorage.org/webt/kp/qy/cx/kpqycx4aarajdpf7yy5dlxvuphk.png" />
<br />

Запускаем расширение:

<img src="https://habrastorage.org/webt/aa/qc/lz/aaqclzqzkyswknzlde70pav7h5u.png" />
<br />

Видим, что  настройки благополучно применяются к попапу.

Следует отметить, что проект, созданный с помощью Plasmo CLI, включает в себя GitHub Action [Browser Platform Publisher](https://github.com/marketplace/actions/browser-platform-publisher) для автоматической публикации расширения во всех поддерживаемых сторах. Подробнее почитать об этом можно [здесь](https://docs.plasmo.com/framework/workflows/submit). Соответствующий файл можно найти в директории `.github/workflows`.

К слову, поисковый индекс со статьями на русском языке можно найти [здесь](https://developer.mozilla.org/ru/search-index.json).

Надеюсь, вы узнали что-то новое и не зря потратили время.

Happy coding!
