---
slug: component-lib
title: Разрабатываем библиотеку компонентов с помощью React и TypeScript
description: Туториал по разработке библиотеки компонентов с помощью React и TypeScript
authors: harryheman
tags: [react.js, reactjs, react, typescript, ts, vite, storybook, component library, design system]
---

Привет, друзья!

В этой статье я покажу вам, как начать разработку библиотеки компонентов с помощью [Vite](https://vitejs.dev/), [React](https://ru.reactjs.org/), [TypeScript](https://www.typescriptlang.org/) и [Storybook](https://storybook.js.org/).

Мы разработаем библиотеку, состоящую из одного простого компонента - кнопки, подготовим библиотеку к публикации в реестре [npm](https://www.npmjs.com/), а также сгенерируем и визуализируем документацию для кнопки.

> [Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-ts-lib).

<!--truncate-->

## Подготовка и настройка проекта

Создаем шаблон проекта с помощью `Vite`:

```bash
# npm 7+
# react-ts-lib - название проекта
# react-ts - используемый шаблон
npm create vite react-ts-lib -- --template react-ts
```

Переходим в созданную директорию, устанавливаем зависимости и запускаем сервер для разработки:

```bash
cd react-ts-lib
npm i
npm run dev
```

Приводим директорию к следующей структуре:

```
- src
  - lib
    - Button
      - Button.tsx
    - index.ts
- App.tsx
- index.css
- vite.config.ts
- ...
```

Устанавливаем библиотеку [styled-components](https://www.styled-components.com/) (мы будем использовать эту библиотеку для стилизации кнопки) и типы для нее:

```bash
npm i styled-componets
npm i -D @types/styled-components
```

Устанавливаем плагин `Vite` для автоматической генерации файла с определениями типов:

```bash
npm i -D vite-plugin-dts
```

Настраиваем сборку, редактируя файл `vite.config.ts`:

```tsx
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // поддержка синтаксиса React (JSX и прочее)
    react(),
    // генерация файла `index.d.ts`
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      // путь к основному файлу библиотеки
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      // название библиотеки
      name: "ReactTSLib",
      // форматы генерируемых файлов
      formats: ["es", "umd"],
      // названия генерируемых файлов
      fileName: (format) => `react-ts-lib.${format}.js`,
    },
    // https://vitejs.dev/config/build-options.html#build-rollupoptions
    rollupOptions: {
      external: ["react", "react-dom", "styled-components"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "styled-components": "styled",
        },
      },
    },
  },
});
```

## Разработка компонента

Определяем минимальные стили и несколько переменных в файле `index.css`:

```css
/* импортируем шрифт */
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

/* определяем переменные */
/* палитра `Bootstrap` */
:root {
  --primary: #0275d8;
  --success: #5cb85c;
  --warning: #f0ad4e;
  --danger: #d9534f;
  --light: #f7f7f7;
  --dark: #292b2c;
  --gray: rgb(155, 155, 155);
}

/* "легкий" сброс стилей */
*,
*::before,
*::after {
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
  margin: 0;
  padding: 0;
}

/* выравнивание по центру */
#root {
  align-items: center;
  display: flex;
  gap: 0.6rem;
  height: 100vh;
  justify-content: center;
}
```

Приступаем к разработке кнопки.

Работаем с файлом `src/lib/Button/Button.tsx`.

Импортируем зависимости:

```tsx
import {
  ButtonHTMLAttributes,
  FC,
  MouseEventHandler,
  PropsWithChildren,
} from "react";
import styled from "styled-components";
```

Определяем перечисление с вариантами кнопки:

```tsx
export enum BUTTON_VARIANTS {
  PRIMARY = "primary",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}
```

Определяем типы пропов:

```tsx
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BUTTON_VARIANTS;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};
```

Кроме стандартных атрибутов, кнопка принимает 2 пропа:

- `variant` - вариант кнопки (`primary` и др.);
- `onClick` - обработчик нажатия кнопки.

Определяем компонент кнопки:

```tsx
const Button: FC<PropsWithChildren<Props>> = ({
  children,
  disabled,
  onClick,
  variant = BUTTON_VARIANTS.PRIMARY,
  ...restProps
}) => {
  // если кнопка заблокирована, переданный обработчик не вызывается
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    onClick && onClick(e);
  };

  return (
    <button disabled={disabled} onClick={handleClick} {...restProps}>
      {children}
    </button>
  );
};
```

Определяем стилизованную кнопку с помощью `styled`:

```tsx
const StyledButton = styled(Button)`
  background-color: var(
    --${(props) => (props.disabled ? "gray" : props.variant ?? "primary")}
  );
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  color: var(
    ${(props) =>
      props.variant &&
      (props.variant === BUTTON_VARIANTS.SUCCESS ??
        props.variant === BUTTON_VARIANTS.WARNING)
        ? "--dark"
        : "--light"}
  );
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  font-weight: 600;
  letter-spacing: 1px;
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};
  outline: none;
  padding: 0.8rem;
  text-transform: uppercase;
  transition: 0.4s;

  &:not([disabled]):hover {
    opacity: 0.8;
  }

  &:active {
    box-shadow: none;
  }
`;
```

Здесь хочется отметить 2 момента:

- `background-color: var(--${(props) => (props.disabled ? "gray" : props.variant ?? "primary")});` означает, что фоновый цвет зависит от варианта кнопки и определяется с помощью переменных, объявленных в `index.css`. Фон заблокированной кнопки - `--gray` или `rgb(155, 155, 155)`, дефолтный фон - `--primary` или `#0275d8`;
- это:

```tsx
color: var(
  ${(props) =>
    props.variant &&
    (props.variant === BUTTON_VARIANTS.SUCCESS ??
      props.variant === BUTTON_VARIANTS.WARNING)
      ? "--dark"
      : "--light"}
);
```

означает, что цвет текста также зависит от варианта кнопки и определяется с помощью переменных `CSS`. Цвет текста кнопки успеха или предупреждения - `--dark` или `#292b2c`, цвет остальных кнопок - `--light` или `#f7f7f7`.

Полагаю, остальные стили вопросов не вызывают.

Повторно экспортируем кнопку и перечисление в файле `src/lib/index.ts`:

```tsx
export { default as Button, BUTTON_VARIANTS } from "./Button/Button";
```

Посмотрим, как выглядит и работает наша кнопка.

Редактируем файл `App.tsx`:

```tsx
import { Button, BUTTON_VARIANTS } from "./lib";

function App() {
  // обработчик нажатия кнопки
  // принимает вариант кнопки
  const onClick = (variant: string) => {
    // выводим сообщение в консоль инструментов разработчика в браузере
    console.log(`${variant} button clicked`);
  };

  return (
    <>
      {/* дефолтная кнопка */}
      <Button onClick={() => onClick("primary")}>primary</Button>
      {/* заблокированная кнопка */}
      <Button onClick={() => onClick("disabled")} disabled>
        disabled
      </Button>
      {/* успех */}
      <Button
        variant={BUTTON_VARIANTS.SUCCESS}
        onClick={() => onClick(BUTTON_VARIANTS.SUCCESS)}
      >
        {BUTTON_VARIANTS.SUCCESS}
      </Button>
      {/* предупреждение */}
      <Button
        variant={BUTTON_VARIANTS.WARNING}
        onClick={() => onClick(BUTTON_VARIANTS.WARNING)}
      >
        {BUTTON_VARIANTS.WARNING}
      </Button>
      {/* опасность */}
      <Button
        variant={BUTTON_VARIANTS.DANGER}
        onClick={() => onClick(BUTTON_VARIANTS.DANGER)}
      >
        {BUTTON_VARIANTS.DANGER}
      </Button>
    </>
  );
}

export default App;
```

Запускаем сервер для разработки с помощью команды `npm run dev`:

<img src="https://habrastorage.org/webt/s0/be/3a/s0be3aiailkwuxdfjj-2tkcywo0.png" />
<br />

## Сборка и публикация пакета

Редактируем файл `package.json`, определяя в нем название пакета (наш пакет будет иметь [scope](https://docs.npmjs.com/cli/v8/using-npm/scope) с оригинальным названием `@my-scope` (в данном случае префикс `@` является обязательным)), его версию, лицензию, директорию с файлами, файл с типами, а также настраивая экспорты (разделы `scripts`, `dependencies` и `devDependencies` опущены):

```json
{
  "name": "@my-scope/react-ts-lib",
  "version": "0.0.0",
  "license": "MIT",
  "files": [
    "dist"
  ],
  "main": "./dist/react-ts-lib.umd.js",
  "module": "./dist/react-ts-lib.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/react-ts-lib.es.js",
      "require": "./dist/react-ts-lib.umd.js"
    }
  }
}
```

Пример `package.json` (с дополнительными полями) реальной библиотеки можно найти [здесь](https://github.com/harryheman/simple-fetch/blob/master/package.json).

_Обратите внимание_: перед сборкой имеет смысл "чистить" `package.json`.

Устанавливаем пакет [json](https://www.npmjs.com/package/json) в качестве зависимости для разработки:

```bash
npm i -D json
```

И определяем в разделе `scripts` следующую команду:

```json
"prepack": "json -f package.json -I -e \"delete this.devDependencies; delete this.dependencies\"",
```

Выполняем сборку с помощью команды `npm run build`:

<img src="https://habrastorage.org/webt/yr/fs/nt/yrfsnt7cknzhykkg_ibm01dp0i4.png" />
<br />

Это приводит к генерации директории `dist` с файлами библиотеки.

Для локального тестирования библиотеки необходимо сделать следующее:

- находясь в корневой директории проекта, выполняем команду `npm link` для создания символической ссылки. Эта команда приводит к добавлению пакета в глобальную директорию `node_modules`. Список глобально установленных пакетов можно получить с помощью команды `npm -g list --depth 0`:

<img src="https://habrastorage.org/webt/pt/0s/yt/pt0sytfzjdsdo--pijpqzb2zels.png" />
<br />

- находясь в корневой директории (или любой другой), выполняем команду `npm link @my-scope/react-ts-lib` для привязки пакета к проекту.

Редактируем импорт в файле `App.tsx`:

```tsx
import { Button, BUTTON_VARIANTS } from "@my-scope/react-ts-lib";
```

И запускаем сервер для разработки с помощью команды `npm run dev`:

<img src="https://habrastorage.org/webt/s0/be/3a/s0be3aiailkwuxdfjj-2tkcywo0.png" />
<br />

_Обратите внимание_: после локального тестирования пакета необходимо выполнить 2 команды:

- `npm unlink @my-scope/react-ts-lib` для того, чтобы отвязать пакет от проекта;
- `npm -g rm @my-scope/react-ts-lib` для удаления пакета из `node_modules` на глобальном уровне.

Для публикации пакета в реестре `npm` необходимо сделать следующее:

- [создаем аккаунт npm](https://www.npmjs.com/signup);
- авторизуемся с помощью команды `npm login`;
- публикуем пакет с помощью команды `npm publish`.

Список опубликованных пакетов можно увидеть на странице своего профиля (в моем случае - это https://www.npmjs.com/~igor_agapov):

<img src="https://habrastorage.org/webt/jo/pt/fm/joptfmqblejsvjc3jpqzsshqve0.png" />
<br />

## Генерация и визуализация документации

Устанавливаем пакет [@storybook/builder-vite
](https://www.npmjs.com/package/@storybook/builder-vite) в качестве зависимости для разработки:

```bash
npm i -D @storybook/builder-vite
```

И инициализируем `Storybook` с помощью следующей команды:

```bash
npx sb init --builder @storybook/builder-vite
```

Это приводит к генерации директории `.storybook`. Убедитесь, что файл `main.js` в этой директории имеет следующий вид:

```js
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-vite"
  },
  "features": {
    "storyStoreV7": true
  }
}
```

Создаем в корневой директории файл `.npmrc` следующего содержания:

```bash
legacy-peer-deps=true
```

Создаем файл `src/lib/Button/Button.stories.tsx` следующего содержания:

```tsx
import { ComponentMeta, ComponentStoryObj } from "@storybook/react";
import Button, { BUTTON_VARIANTS } from "./Button";
// импортируем стили
import "../../index.css";

// описание компонента и ссылка на него
const meta: ComponentMeta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
};
export default meta;

// истории
// дефолтная кнопка
export const Default: ComponentStoryObj<typeof Button> = {
  args: {
    children: "primary",
  },
};
// заблокированная кнопка
export const Disabled: ComponentStoryObj<typeof Button> = {
  args: {
    children: "disabled",
    disabled: true,
  },
};
// успех
export const SuccessVariant: ComponentStoryObj<typeof Button> = {
  args: {
    children: "success",
    variant: BUTTON_VARIANTS.SUCCESS,
  },
};
// кнопка с обработчиком нажатия
export const WithClickHandler: ComponentStoryObj<typeof Button> = {
  args: {
    children: "click me",
    onClick: () => alert("button clicked"),
  },
};
```

Выполняем команду `npm run storybook`:

<img src="https://habrastorage.org/webt/lr/9a/wr/lr9awrlxrdjsc4onpwdy3u4f5ic.png" />
<img src="https://habrastorage.org/webt/hg/ro/6h/hgro6hwispor6u1cblbkt0ukna0.png" />
<img src="https://habrastorage.org/webt/ps/m9/h8/psm9h8d1wc2ytelbagrwghkgpfk.png" />
<img src="https://habrastorage.org/webt/6c/yx/xs/6cyxxs80f-9vscup1jczejb1weu.png" />

Благодарю за внимание и happy coding!
