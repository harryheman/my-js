---
sidebar_position: 16.2
title: Туториал по работе с таблицами с помощью React Table
description: Туториал по работе с таблицами с помощью React Table
keywords: [javascript, typescript, react, react-table, tanstack-table, table, таблица]
tags: [javascript, typescript, react, react-table, tanstack-table, table, таблица]
---

Привет, друзья!

В этом туториале я покажу вам несколько полезных приемов по работе с таблицами с помощью [React Table](https://react-table-v7.tanstack.com/).

React Table - одна из самых популярных на сегодняшний день библиотек экосистемы [React](https://ru.reactjs.org/) для манипулирования табличными данными. Однако это далеко не самое простое в изучении и использовании решение, поэтому хорошо подумайте, прежде чем добавлять его в свой проект.

Мы последовательно реализуем 5 вариантов таблицы:

- с возможностью сортировки строк;
- с возможностью фильтрации строк;
- с пагинацией;
- с возможностью выбора строк;
- комплексную.

В конце я расскажу еще об одной интересной библиотеке, позволяющей легким движением руки создавать богатые функционалом и приятные глазу таблицы.

Предполагается, что вы имеете некоторый опыт работы с React и [TypeScript](https://www.typescriptlang.org/).

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-table-test).

Демо приложения:

<iframe
  src="https://codesandbox.io/embed/react-table-fvt968?fontsize=14&hidenavigation=1&theme=dark"
  style={{ width: '100%', height: '500px', border: 0, borderRadius: '4px', overflow: 'hidden' }}
  title="react-table"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

React Table - "безголовая" ("headless") библиотека. Это означает, что она отвечает только за логику, а за разметку и стили отвечает разработчик. Подробнее об этом можно почитать [здесь](https://react-table-v7.tanstack.com/docs/overview).

[Здесь](https://react-table-v7.tanstack.com/docs/quick-start) можно найти базовый пример использования React Table (опционально).

## Подготовка и настройка проекта

Для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Создаем шаблон проекта с помощью [Vite](https://vitejs.dev/):

```bash
# react-table-test - название приложения
# react-ts - используемый шаблон: React + TypeScript
yarn create vite react-table-test --template react-ts
```

Переходим в созданную директорию, устанавливаем зависимости и запускаем сервер для разработки:

```bash
cd react-table-test
yarn
yarn dev
```

Устанавливаем дополнительные зависимости:

```bash
# производственные зависимости
yarn add react-table match-sorter react-icons @faker-js/faker regenerator-runtime
# зависимости для разработки
# типы для Node.js и React Table
yarn add -D @types/node @types/react-table
```

- [match-sorter](https://www.npmjs.com/package/match-sorter) - утилита для фильтрации и сортировки массивов;
- [react-icons](https://react-icons.github.io/react-icons/) - компоненты-иконки;
- [@faker-js/faker](https://www.npmjs.com/package/@faker-js/faker) - утилита для генерации фиктивных (но реалистичных) данных;
- [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime) - автономная среда выполнения для генераторов и асинхронных функций, скомпилированных [Regenerator](https://www.npmjs.com/package/regenerator-runtime).

Импортируем `regenerator-runtime` в файле `main.tsx`:

```javascript
import 'regenerator-runtime'
```

Это решает проблему совместимости React Table и React 18.

Определяем синонимы путей в файлах `vite.config.ts` и `tsconfig.json`:

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  // ...
}
```

Это позволяет импортировать файлы, находящиеся в директории `src`, из `@/*` на любом уровне вложенности.

Определяем минимальные стили в файле `index.css` (файл `App.css` можно удалить):

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  white-space: nowrap;
  padding: 0.5rem;
}

th {
  background: rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(2n) {
  background: rgba(0, 0, 0, 0.05);
}

h1 {
  text-align: center;
}
```

React Table почему-то не предоставляет типы для настроек и пропов таблицы, строки, колонки и ячейки, связанных с использованием хуков `useSortBy`, `useFilters` и др. для добавления такого функционала, как сортировка, фильтрация строк и т.п., т.е. любого функционала, кроме рендеринга данных.

_Обратите внимание_: далее мы работаем с файлами, находящимися в директории `src`.

Расширяем модуль `react-table` соответствующими интерфейсами в файле `types/react-table-config.d.ts` (путь и название файла являются обязательными):

```javascript
// решение найдено в сети
import {
  UseColumnOrderInstanceProps,
  UseColumnOrderState,
  UseExpandedHooks,
  UseExpandedInstanceProps,
  UseExpandedOptions,
  UseExpandedRowProps,
  UseExpandedState,
  UseFiltersColumnOptions,
  UseFiltersColumnProps,
  UseFiltersInstanceProps,
  UseFiltersOptions,
  UseFiltersState,
  UseGlobalFiltersColumnOptions,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersOptions,
  UseGlobalFiltersState,
  UseGroupByCellProps,
  UseGroupByColumnOptions,
  UseGroupByColumnProps,
  UseGroupByHooks,
  UseGroupByInstanceProps,
  UseGroupByOptions,
  UseGroupByRowProps,
  UseGroupByState,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
  UseResizeColumnsColumnOptions,
  UseResizeColumnsColumnProps,
  UseResizeColumnsOptions,
  UseResizeColumnsState,
  UseRowSelectHooks,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectRowProps,
  UseRowSelectState,
  UseRowStateCellProps,
  UseRowStateInstanceProps,
  UseRowStateOptions,
  UseRowStateRowProps,
  UseRowStateState,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByHooks,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState
} from 'react-table'

declare module 'react-table' {
  // take this file as-is, or comment out the sections that don't apply to your plugin configuration
  export interface TableOptions<D extends object = {}>
    extends UseExpandedOptions<D>,
      UseFiltersOptions<D>,
      UseGlobalFiltersOptions<D>,
      UseGroupByOptions<D>,
      UsePaginationOptions<D>,
      UseResizeColumnsOptions<D>,
      UseRowSelectOptions<D>,
      UseRowStateOptions<D>,
      UseSortByOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, this is a safe default.
      Record<string, any> {}

  export interface Hooks<D extends object = {}>
    extends UseExpandedHooks<D>,
      UseGroupByHooks<D>,
      UseRowSelectHooks<D>,
      UseSortByHooks<D> {}

  export interface TableInstance<D extends object = {}>
    extends UseColumnOrderInstanceProps<D>,
      UseExpandedInstanceProps<D>,
      UseFiltersInstanceProps<D>,
      UseGlobalFiltersInstanceProps<D>,
      UseGroupByInstanceProps<D>,
      UsePaginationInstanceProps<D>,
      UseRowSelectInstanceProps<D>,
      UseRowStateInstanceProps<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UseColumnOrderState<D>,
      UseExpandedState<D>,
      UseFiltersState<D>,
      UseGlobalFiltersState<D>,
      UseGroupByState<D>,
      UsePaginationState<D>,
      UseResizeColumnsState<D>,
      UseRowSelectState<D>,
      UseRowStateState<D>,
      UseSortByState<D> {}

  export interface ColumnInterface<D extends object = {}>
    extends UseFiltersColumnOptions<D>,
      UseGlobalFiltersColumnOptions<D>,
      UseGroupByColumnOptions<D>,
      UseResizeColumnsColumnOptions<D>,
      UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object = {}>
    extends UseFiltersColumnProps<D>,
      UseGroupByColumnProps<D>,
      UseResizeColumnsColumnProps<D>,
      UseSortByColumnProps<D> {}

  export interface Cell<D extends object = {}, V = any>
    extends UseGroupByCellProps<D>,
      UseRowStateCellProps<D> {}

  export interface Row<D extends object = {}>
    extends UseExpandedRowProps<D>,
      UseGroupByRowProps<D>,
      UseRowSelectRowProps<D>,
      UseRowStateRowProps<D> {}
}
```

Дополнительно определяем типы для компонентов глобального фильтра и фильтра колонки в файле `types/index.ts`:

```javascript
import {
  FilterProps,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersOptions
} from 'react-table'

export type GlobalFilterT<T extends object> = (
  props: Partial<UseGlobalFiltersOptions<T> & UseGlobalFiltersInstanceProps<T>>
) => JSX.Element

export type ColumnFilterT<T extends object> = (
  props: FilterProps<T>
) => JSX.Element
```

Определяем функцию генерации фиктивных данных в файле `utils/getData.ts`:

```javascript
import { faker } from '@faker-js/faker'

// функция генерации массива чисел от 0 до `len`
const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

// функция генерации id
let _id = 1
const id = () => _id++

// функция, возвращающая случайное целое число в заданном диапазоне
const randInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1))

// тип пользователя
export type User = ReturnType<typeof createUser>

// функция генерации данных пользователя
const createUser = () => {
  const statusChance = Math.random()

  return {
    id: id(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    age: randInt(18, 65),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: {
      city: faker.address.cityName(),
      street: faker.address.streetAddress()
    },
    job: {
      position: faker.name.jobTitle(),
      company: faker.company.name()
    },
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChance > 0.66
        ? 'relationship'
        : statusChance > 0.33
          ? 'complicated'
          : 'single'
  }
}

// функция генерации фиктивных данных в виде массива объектов пользователя заданной длины
const getData = (len: number) => range(len).map(createUser)

export default getData
```

Пример объекта пользователя:

```javascript
{
  id: 1,
  firstName: 'Germaine',
  lastName: 'Ritchie',
  age: 48,
  email: 'Loy73@hotmail.com',
  phone: '231.577.0194 x983',
  address: {
    city: 'Dallas',
    street: '8906 Lelia Parks'
  },
  job: {
    position: 'Lead Branding Facilitator',
    company: 'Torphy - Klein'
  },
  visits: 54,
  progress: 7,
  status: 'relationship'
}
```

Это все, что требуется для подготовки и настройки проекта.

## Сортируемая таблица

Основным хуком React Table является [useTable](https://react-table-v7.tanstack.com/docs/api/useTable), принимающий объект с настройками и возвращающий экземпляр таблицы:

```javascript
import { useTable } from 'react-table'

const tableInstance = useTable(options)
```

Обязательными настройками таблицы являются:

- `data: any[]` - данные в виде массива;
- `columns: Column[]` - массив с определениями колонок (column definitions).

Определение колонки представляет собой объект с одной обязательной настройкой:

- `accessor: string | Function` - строка или функция, которая используется для создания модели данных колонки.

В определении колонки, как правило, присутствует еще одна настройка:

- `Header: string | Function` - строка, функция или компонент, который используется для форматирования значения заголовка колонки.

Пример определений колонок:

```javascript
export const columns: Column<User>[] = [
  {
    Header: 'First Name',
    // значением колонки будет `user['firstName']`
    accessor: 'firstName',
  },
  {
    Header: 'Company',
    // функция принимает строку - объект данных
    // значением колонки будет `user['job'].position in user['job'].company`
    accessor: ({ job }) => `${job.position} in ${job.company}`
  }
]
```

Для добавления возможности сортировки строк предназначен хук [useSortBy](https://react-table-v7.tanstack.com/docs/api/useSortBy):

```javascript
import { useTable, useSortBy } from 'react-table'

const tableInstance = useTable({ columns, data }, useSortBy)
```

Он позволяет определять несколько дополнительных настроек колонок, таких как:

- `disableSortBy: true` - отключает сортировку для колонки (по умолчанию все колонки является сортируемыми);
- `sortType: string | Function` - строка, определяющая тип сортировки (название встроенной функции), или функция, которая используется для сортировки. Встроенные функции сортировки (типы сортировки) можно найти в [этом файле](https://github.com/TanStack/table/blob/v7/src/sortTypes.js). По умолчанию используется тип `alphanumeric`, который подходит для большинства случаев.

`useSortBy()` также позволяет передавать дополнительные настройки таблицы, такие как:

- `sortTypes: Record<string, SortByFn>` - объект, позволяющий перезаписывать встроенные и определять новые типы сортировки в виде функций.

Определяем таблицу с возможностью сортировки строк в файле `Table/Sortable.tsx`:

```javascript
import getData, { User } from '@/utils/getData'
import { BiSortAlt2, BiSortDown, BiSortUp } from 'react-icons/bi'
import { Column, SortByFn, useSortBy, useTable } from 'react-table'

// данные
const data = getData(20)

// определения колонок
export const columns: Column<User>[] = [
  {
    Header: 'ID',
    // user['id']
    accessor: 'id',
    // отключаем сортировку
    disableSortBy: true
  },
  {
    Header: 'First Name',
    accessor: 'firstName',
    // определяем тип сортировки
    sortType: 'string'
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
    sortType: 'string'
  },
  {
    Header: 'Age',
    accessor: 'age',
    sortType: 'number'
  },
  {
    Header: 'Email',
    accessor: 'email'
  },
  {
    Header: 'Phone',
    accessor: 'phone'
  },
  {
    Header: 'Address',
    // user['address'].city, user['address'].street
    accessor: ({ address }) => `${address.city}, ${address.street}`
  },
  {
    Header: 'Company',
    accessor: ({ job }) => `${job.position} in ${job.company}`
  }
]

// типы сортировки
const sortTypes: Record<string, SortByFn<User>> = {
  // перезаписывает встроенный тип `string`
  string: (rowA, rowB, columnId, desc) => {
    const [a, b] = [rowA.values[columnId], rowB.values[columnId]] as [
      string,
      string
    ]

    return a.localeCompare(b, 'en')
  }
}

export default function Sortable() {
  // создаем экземпляр таблицы
  const {
    // эти штуки являются обязательными
    getTableProps,
    getTableBodyProps,
    // о том, почему мы используем группы заголовков, а не сами заголовки, поговорим в следующем разделе
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data, sortTypes }, useSortBy)

  return (
    <>
      <h1>Sortable Table</h1>
      <div className='table-wrapper'>
        {/* к разметке надо привыкнуть :) */}
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}{' '}
                    {/* если колонка является сортируемой, рендерим рядом с заголовком соответствующую иконку в зависимости от того, включена ли сортировка, а также на основе порядка сортировки */}
                    {col.canSort && (
                      <span>
                        {col.isSorted ? (
                          col.isSortedDesc ? (
                            <BiSortUp />
                          ) : (
                            <BiSortDown />
                          )
                        ) : (
                          <BiSortAlt2 />
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row)

              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
```

Импортируем и рендерим данный компонент в файле `App.tsx`:

```javascript
import Sortable from './Table/Sortable'

export default function App() {
  return (
    <>
      <Sortable />
    </>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/0r/iw/jz/0riwjz9gmlnehrmoz0eogjfbibi.png" />
<br />

## Фильтруемая таблица

Для добавления возможности фильтрации строк предназначены хуки [useGlobalFilter](https://react-table-v7.tanstack.com/docs/api/useGlobalFilter)и [useFilters](https://react-table-v7.tanstack.com/docs/api/useFilters):

```javascript
import { useTable, useGlobalFilter, useFilters } from 'react-table'

const tableInstance = useTable({ columns, data }, useGlobalFilter, useFilters)
```

Первый используется для глобальной фильтрации, т.е. фильтрации по всем колонкам, второй - для фильтрации по определенным колонкам.

Дополнительные настройки колонок:

- `Filter: Function` - функция или компонент, которые используются для рендеринга UI (компонента) фильтра;
- `disableFilter: true` - отключает фильтрацию для колонки (по умолчанию все колонки является фильтруемыми);
- `filter: string | Function` - строка, определяющая тип фильтрации (название встроенной функции), или функция, которая используется для фильтрации. Встроенные функции фильтрации (типы фильтрации) можно найти в [этом файле](https://github.com/TanStack/table/blob/v7/src/filterTypes.js). По умолчанию используется тип `text`.

Дополнительные настройки таблицы:

- `filterTypes: FilterTypes` - объект, позволяющий перезаписывать встроенные и определять новые типы фильтрации в виде функций.

`defaultColumn: Object` - полезная настройка таблицы, позволяющая определять дефолтные настройки колонки, в частности, UI фильтра, что избавляет от необходимости определять настройку `Filter` для каждой колонки.

Начнем с фильтров.

Создаем файл `Table/Filterable/filters.ts`.

Импортируем зависимости и определяем компонент глобального фильтра:

```javascript
import { ColumnFilterT, GlobalFilterT } from '@/types'
import { User } from '@/utils/getData'
import { matchSorter } from 'match-sorter'
import { useMemo, useState } from 'react'
import { FilterType, FilterTypes, useAsyncDebounce } from 'react-table'

// UI глобального фильтра
export const GlobalFilter: GlobalFilterT<User> = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) => {
  // количество отфильтрованных строк
  const count = preGlobalFilteredRows?.length
  // локальное состояние значения фильтра
  const [value, setValue] = useState(globalFilter as string)
  // метод модификации значения фильтра
  // выполняется с задержкой в 250 мс
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter?.(value || undefined)
  }, 250)

  return (
    <label>
      Search:{' '}
      <input
        type='text'
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`${count} records...`}
      />
    </label>
  )
}
```

Определяем дефолтный и несколько кастомных компонентов фильтров:

```javascript
// UI дефолтного фильтра
export const DefaultColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, preFilteredRows, setFilter }
}) => {
  const count = preFilteredRows.length

  return (
    <input
      type='text'
      value={filterValue || ''}
      onChange={(e) => {
        // установка фильтра в значение `undefined` приводит к удалению фильтра
        setFilter(e.target.value || undefined)
      }}
      placeholder={`${count} records...`}
    />
  )
}

// UI фильтра-слайдера
export const SliderColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  // вычисляем минимальное и максимальное значения
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = min
    preFilteredRows.forEach((r) => {
      min = Math.min(r.values[id], min)
      max = Math.max(r.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <>
      <input
        type='range'
        min={min}
        max={max}
        value={filterValue || ''}
        onChange={(e) => {
          setFilter(parseInt(e.target.value, 10))
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
      <p>{filterValue}</p>
    </>
  )
}

// UI фильтра-диапазона
export const NumberRangeColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) => {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = min
    preFilteredRows.forEach((r) => {
      min = Math.min(r.values[id], min)
      max = Math.max(r.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div style={{ display: 'flex' }}>
      <input
        type='number'
        value={filterValue[0] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((prev = []) => [
            val ? parseInt(val, 10) : undefined,
            prev[1]
          ])
        }}
        placeholder={`Min ${min}`}
      />
      to
      <input
        type='number'
        value={filterValue[1] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter((prev = []) => [
            prev[0],
            val ? parseInt(val, 10) : undefined
          ])
        }}
        placeholder={`Max ${max}`}
      />
    </div>
  )
}

// UI фильтра-селектора
export const SelectColumnFilter: ColumnFilterT<User> = ({
  column: { filterValue, setFilter, preFilteredRows, id }
}) => {
  // формируем варианты
  const options = useMemo(() => {
    const opts = new Set()
    preFilteredRows.forEach((r) => {
      opts.add(r.values[id])
    })
    return [...opts.values()]
  }, [id, preFilteredRows])

  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value=''>All</option>
      {options.map((o: any, i) => (
        <option value={o} key={i}>
          {o}
        </option>
      ))}
    </select>
  )
}
```

Определяем кастомный тип фильтрации и кастомную функцию фильтрации:

```javascript
// кастомный тип фильтрации
export const fuzzyText: FilterType<User> = (rows, ids, filterValue) => {
  return matchSorter(rows, filterValue, {
    keys: [(row) => ids.map((id) => row.values[id]).flat()]
  })
}

// удаляем фильтр при отсутствии значения
fuzzyText.autoRemove = (val: unknown) => !val

// кастомная функция фильтрации
export const filterGreaterThanOrEqual: FilterType<User> = (
  rows,
  ids,
  filterValue
) => {
  return rows.filter((row) => {
    return ids.some((id) => {
      const rowValue = row.values[id]
      return rowValue >= filterValue
    })
  })
}

// удаляем фильтр, если значение не является числом
filterGreaterThanOrEqual.autoRemove = (val: unknown) => typeof val !== 'number'
```

Определяем типы фильтрации:

```javascript
export const filterTypes: FilterTypes<User> = {
  // добавляем новый тип
  fuzzyText,
  // перезаписываем встроенный тип `text`
  // просто для примера, встроенный тип лучше
  text: (rows, ids, filterVal) => {
    return rows.filter((row) => {
      return ids.some((id) => {
        const rowVal = String(row.values[id])
        return rowVal.toLowerCase().startsWith(String(filterVal).toLowerCase())
      })
    })
  }
}
```

Определяем таблицу с возможностью фильтрации строк в файле `Table/Filterable/index.tsx`:

```javascript
import getData, { User } from '@/utils/getData'
import { Column, useFilters, useGlobalFilter, useTable } from 'react-table'
import {
  DefaultColumnFilter,
  filterGreaterThanOrEqual,
  filterTypes,
  GlobalFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter
} from './filters'

const data = getData(20)

export const columns: Column<User>[] = [
  {
    Header: 'ID',
    accessor: 'id',
    // отключаем фильтрацию
    disableFilters: true
  },
  {
    Header: 'Name',
    // группируем колонки
    // причина, по которой мы используем `headerGroups`
    columns: [
      {
        Header: 'First Name',
        accessor: 'firstName'
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        // кастомный тип фильтрации
        filter: 'fuzzyText'
      }
    ]
  },
  {
    Header: 'Info',
    columns: [
      {
        Header: 'Age',
        accessor: 'age',
        // кастомный UI фильтра
        Filter: SliderColumnFilter,
        // встроенный тип фильтрации
        filter: 'equals'
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        Filter: NumberRangeColumnFilter,
        filter: 'between'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        Filter: SliderColumnFilter,
        // кастомная функция фильтрации
        filter: filterGreaterThanOrEqual
      }
    ]
  }
]

// настройки колонки по умолчанию
export const defaultColumn = {
  Filter: DefaultColumnFilter,
  // https://github.com/TanStack/table/issues/2293
  filter: 'text'
}

export default function Filterable() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // новые штуки (по сравнению с предыдущим примером)
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter
  } = useTable(
    { columns, data, defaultColumn, filterTypes },
    useGlobalFilter,
    useFilters
  )

  return (
    <>
      <h1>Filterable Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps()}>
                    {col.render('Header')}
                    {/* рендерим компонент фильтра колонки в случае, если колонка является фильтруемой */}
                    {col.canFilter ? <div>{col.render('Filter')}</div> : null}
                  </th>
                ))}
              </tr>
            ))}
            <tr>
              <th colSpan={visibleColumns.length}>
                {/* компонент глобального фильтра */}
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={state.globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
              </th>
            </tr>
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        {/* количество отфильтрованных строк */}
        <p>Filtered rows count: {rows.length}</p>
        {/* выбранные фильтры */}
        <pre>
          <code>{JSON.stringify(state.filters, null, 2)}</code>
        </pre>
      </div>
    </>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/wf/ev/bf/wfevbfipbhdbjsr7vgg436p1cwc.png" />
<br />

## Таблица с пагинацией

Для добавления возможности пагинации строк предназначен хук [usePagination](https://react-table-v7.tanstack.com/docs/api/usePagination):

```javascript
import { useTable, usePagination } from 'react-table'

const tableInstance = useTable({ columns, data }, usePagination)
```

При использовании данного хука в экземпляр таблицы включаются следующие свойства пагинации:

- `page: Row[]` - массив строк (текущая страница, используется для рендеринга строк вместо `rows`);
- `canPreviousPage: boolean` - индикатор наличия предыдущей страницы;
- `canNextPage: boolean` - индикатор наличия следующей страницы;
- `pageCount: number` - количество страниц (массивов строк);
- `gotoPage: (pageIndex: number) => void` - метод перехода к указанной странице (к массиву строк с указанным индексом);
- `nextPage: () => void` - метод перехода к следующей странице;
- `previousPage: () => void` - метод перехода к предыдущей странице;
- `setPageSize: (pageSize: number) => void` - метод установки размера страницы (количества строк в массиве);
- и др.

Также в состояние таблицы (`state`) включаются следующие свойства:

- `pageIndex: number` - индекс текущей страницы;
- `pageSize: number` - размер текущей страницы.

Начальный размер страницы может быть установлен с помощью настройки таблицы `initialState.pageSize`.

Определяем компонент пагинации в файле `Table/Paginated/Pagination.tsx`:

```javascript
import { User } from '@/utils/getData'
import React from 'react'
import { TableInstance } from 'react-table'

type Props = Pick<
  TableInstance<User>,
  | 'gotoPage'
  | 'previousPage'
  | 'nextPage'
  | 'canPreviousPage'
  | 'canNextPage'
  | 'pageCount'
  | 'pageIndex'
  | 'pageSize'
  | 'setPageSize'
>

export default function Pagination(props: Props) {
  // метод перехода к первой странице
  const gotoFirstPage = () => props.gotoPage(0)
  // метод перехода к последней странице
  const gotoLastPage = () => props.gotoPage(props.pageCount - 1)
  // метод перехода к указанной странице
  const gotoPage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // индекс массива
    const page = e.target.value ? Number(e.target.value) - 1 : 0
    props.gotoPage(page)
  }
  // метод установки размера страницы
  const setPageSize: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const size = Number(e.target.value)
    props.setPageSize(size)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 1rem'
      }}
    >
      <span>
        <button onClick={gotoFirstPage} disabled={!props.canPreviousPage}>
          {'<<'}
        </button>
        <button onClick={props.previousPage} disabled={!props.canPreviousPage}>
          {'<'}
        </button>
        <button onClick={props.nextPage} disabled={!props.canNextPage}>
          {'>'}
        </button>
        <button onClick={gotoLastPage} disabled={!props.canNextPage}>
          {'>>'}
        </button>
      </span>
      <span>
        Page {props.pageIndex + 1} of {props.pageCount}
      </span>
      <label>
        Go to page:{' '}
        <input
          type='number'
          defaultValue={props.pageIndex + 1}
          onChange={gotoPage}
          style={{ width: '8ch' }}
        />
      </label>
      <select value={props.pageSize} onChange={setPageSize}>
        {[10, 20, 30].map((size) => (
          <option value={size} key={size}>
            Show {size}
          </option>
        ))}
      </select>
    </div>
  )
}
```

Определяем таблицу с возможностью пагинации строк в файле `Table/Paginated/index.tsx`:

```javascript
import getData from '@/utils/getData'
import { usePagination, useTable } from 'react-table'
// берем колонки из предыдущего примера
import { columns } from '../Filterable'
import Pagination from './Pagination'

const data = getData(60)

export default function Paginated() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // новые штуки
    state: { pageIndex, pageSize },
    page,
    // возможно, здесь стоило использовать `...otherProps` :)
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    {
      columns,
      data,
      // начальный размер страницы
      initialState: {
        pageSize: 10
      }
    },
    usePagination
  )

  return (
    <>
      <h1>Paginated Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps()}>{col.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <br />
      <div>
        {/* пагинация */}
        <Pagination
          gotoPage={gotoPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageCount={pageCount}
          nextPage={nextPage}
          previousPage={previousPage}
          setPageSize={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
        {/* информация о пагинации */}
        <pre>
          <code>
            {JSON.stringify(
              {
                pageIndex,
                pageSize,
                pageCount,
                canNextPage,
                canPreviousPage
              },
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/46/jk/1m/46jk1mgekzrvty4xj9gtbg9ufgk.png" />
<br />

_Ремарка:_ почему id строк начинаются с 21? Потому что при импорте `columns` выполняется код файла `Table/Filterable/index.tsx`, где имеется строка `const data = getData(20)`, что приводит к увеличению значения переменной `_id`, определенной в файле `utils/getData.ts`, до 20.

## Таблица с возможностью выбора строк

Для добавления возможности выбора строк предназначен хук [useRowSelect](https://react-table-v7.tanstack.com/docs/api/useRowSelect):

```javascript
import { useTable, useRowSelect } from 'react-table'

const tableInstance = useTable({ columns, data }, useRowSelect)
```

При использовании данного хука в экземпляр таблицы включаются следующие свойства:

- `selectedFlatRows: Row[]` - плоский массив выбранных строк;
- `getToggleAllRowsSelectedProps` - метод генерации пропов для выбора всех строк;
- и др.

В состояние экземпляра таблицы (`state`) включается свойство `selectedRowIds`, значением которого является объект id выбранных строк.

В экземпляр строки включается свойство `getToggleRowSelectedProps`, значением которого является метод формирования пропов для выбора текущей строки.

Доступ к колонкам таблицы для добавления колонки с чекбоксами для выбора строк можно получить через свойство `visibleColumns` объекта встроенных хуков, который передается `useTable()` после кастомных хуков.

Определяем таблицу с возможностью выбора строк в файле `Table/Selectable.tsx`:

```javascript
import getData, { User } from '@/utils/getData'
import { forwardRef, useEffect, useRef } from 'react'
import {
  Row,
  TableToggleAllRowsSelectedProps,
  useRowSelect,
  useTable
} from 'react-table'
// импортируем колонки из компонента сортируемой таблицы
import { columns } from './Sortable'

const data = getData(10)

// компонент чекбокса
export const IndeterminateCheckbox = forwardRef(
  (
    { indeterminate, ...rest }: Partial<TableToggleAllRowsSelectedProps>,
    ref
  ) => {
    const defaultRef = useRef<HTMLInputElement | null>(null)
    const resolvedRef =
      (ref as React.MutableRefObject<HTMLInputElement | null>) || defaultRef

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate as boolean
      }
    }, [resolvedRef, indeterminate])

    return <input type='checkbox' ref={resolvedRef} {...rest} />
  }
)

export default function Selectable() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // новые штуки
    selectedFlatRows,
    state: { selectedRowIds }
  } = useTable({ columns, data }, useRowSelect, ({ visibleColumns }) => {
    visibleColumns.push((cols) => [
      // добавляем колонку для выбора строки
      {
        id: 'selection',
        // компонент заголовка
        // принимает экземпляр таблицы и модель колонки
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        ),
        // компонент ячейки
        // принимает экземпляр таблицы и модель ячейки
        Cell: ({ row }: { row: Row<User> }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        )
      },
      ...cols
    ])
  })

  return (
    <>
      <h1>Selectable Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps()}>{col.render('Header')} </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row)

              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        {/* количество выбранных строк */}
        <p>Selected rows count: {Object.keys(selectedRowIds).length}</p>
        {/* выбранные строки */}
        <pre>
          <code>
            {JSON.stringify(
              selectedFlatRows.map((d) => d.original),
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/-r/2u/jk/-r2ujkbuwxazgq3ofmd5phpvvgc.png" />
<br />

Мы с вами рассмотрели далеко не все возможности, предоставляемые React Table, но для многих случаев этого будет достаточно.

## Комплексная таблица

Начнем с ручной реализации мультифункциональной таблицы.

Определяем таблицу с возможностью сортировки, фильтрации, пагинации и выбора строк в файле `Table/Complex.tsx`:

```javascript
import getData, { User } from '@/utils/getData'
import { BiSortAlt2, BiSortDown, BiSortUp } from 'react-icons/bi'
import {
  Row,
  useFilters,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  Column
} from 'react-table'
// типы сортировки
import { sortTypes } from './Sortable'
// кастомная функция фильтрации, типы фильтрации и компоненты фильтров
import {
  filterGreaterThanOrEqual,
  filterTypes,
  GlobalFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter
} from './Filterable/filters'
// дефолтные настройки колонки
import { defaultColumn } from './Filterable'
// компонент пагинации
import Pagination from './Paginated/Pagination'
// компонент чекбокса
import { IndeterminateCheckbox } from './Selectable'

// данные
const data = getData(60)

// определения колонок
const columns: Column<User>[] = [
  {
    Header: 'ID',
    accessor: 'id',
    // отключаем сортировку и фильтрацию
    disableSortBy: true,
    disableFilters: true
  },
  {
    Header: 'Name',
    columns: [
      {
        Header: 'First Name',
        accessor: 'firstName',
        // встроенный тип сортировки
        sortType: 'string'
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        sortType: 'string',
        // кастомный тип фильтрации
        filter: 'fuzzyText'
      }
    ]
  },
  {
    Header: 'Info',
    columns: [
      {
        Header: 'Age',
        accessor: 'age',
        sortType: 'number',
        // кастомный компонент фильтра
        Filter: SliderColumnFilter,
        // встроенный тип фильтрации
        filter: 'equals'
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        Filter: NumberRangeColumnFilter,
        filter: 'between'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        Filter: SliderColumnFilter,
        // кастомная функция фильтрации
        filter: filterGreaterThanOrEqual
      }
    ]
  }
]

export default function Complex() {
  const {
    // обязательные штуки
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // состояние
    state: { globalFilter, pageIndex, pageSize, filters },
    // фильтрация
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    // пагинация
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // выбор строк
    selectedFlatRows
  } = useTable(
    // настройки
    {
      columns,
      data,
      sortTypes,
      defaultColumn,
      filterTypes,
      initialState: {
        pageSize: 10
      }
    },
    // плагины
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,
    // встроенные хуки
    ({ visibleColumns }) => {
      visibleColumns.push((cols) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }: { row: Row<User> }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          )
        },
        ...cols
      ])
    }
  )

  return (
    <>
      <h1>Complex Table</h1>
      <div className='table-wrapper'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((hG) => (
              <tr {...hG.getHeaderGroupProps()}>
                {hG.headers.map((col) => (
                  <th {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}
                    {/* иконка сортировки */}
                    {col.canSort && (
                      <span>
                        {col.isSorted ? (
                          col.isSortedDesc ? (
                            <BiSortUp />
                          ) : (
                            <BiSortDown />
                          )
                        ) : (
                          <BiSortAlt2 />
                        )}
                      </span>
                    )}
                    {/* UI фильтра */}
                    {col.canFilter ? <div>{col.render('Filter')}</div> : null}
                  </th>
                ))}
              </tr>
            ))}
            <tr>
              <th colSpan={visibleColumns.length}>
                {/* глобальный фильтр */}
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
              </th>
            </tr>
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row)

              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <br />
      {/* пагинация */}
      <Pagination
        gotoPage={gotoPage}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageCount={pageCount}
        nextPage={nextPage}
        previousPage={previousPage}
        setPageSize={setPageSize}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
      {/* информация */}
      <div>
        {/* выбранные фильтры */}
        <p>Filters</p>
        <pre>
          <code>{JSON.stringify(filters, null, 2)}</code>
        </pre>
        {/* состояние пагинации */}
        <p>Pagination state</p>
        <pre>
          <code>
            {JSON.stringify(
              {
                pageIndex,
                pageSize,
                pageCount,
                canNextPage,
                canPreviousPage
              },
              null,
              2
            )}
          </code>
        </pre>
        {/* выбранные строки */}
        <p>Selected rows</p>
        <pre>
          <code>
            {JSON.stringify(
              selectedFlatRows.map((d) => d.original),
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/_y/el/m1/_yelm1hpjipiv85e3b23xmqeoly.png" />
<br />

Следует отметить, что существует несколько библиотек, в той или иной степени абстрагирующих работу с React Table. Мне приглянулась [Material React Table](https://www.material-react-table.com/). _Обратите внимание_: для использования этой библиотеки требуется наличие [Material UI](https://mui.com/) 5 версии. Рассмотрим пример ее использования.

Устанавливаем необходимые зависимости:

```bash
yarn add material-react-table @mui/material @mui/icons-material @emotion/react @emotion/styled
```

Определяем в файле `Table/Material.tsx` таблицу со следующими возможностями (sic!):

- сортировка строк;
- фильтрация строк, включая глобальную фильтрацию, подсветку совпадений и показ/скрытие фильтров;
- пагинация строк;
- выбор строк (всех и отдельных);
- скрытие/показ колонок;
- изменение плотности (density) ячеек;
- переключение в полноэкранный режим и др.

```javascript
import getData, { User } from '@/utils/getData'
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table'

const data = getData(40)

// сигнатура определения колонки немного отличается от React Table
export const columns: MRT_ColumnDef<User>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    // отключаем сортировку и фильтрацию
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    header: 'First Name',
    accessorKey: 'firstName'
  },
  {
    header: 'Last Name',
    accessorKey: 'lastName'
  },
  {
    header: 'Age',
    accessorKey: 'age'
  },
  {
    header: 'Email',
    accessorKey: 'email'
  },
  {
    header: 'Phone',
    accessorKey: 'phone'
  },
  {
    header: 'Address',
    accessorFn: ({ address }) => `${address.city}, ${address.street}`
  },
  {
    header: 'Company',
    accessorFn: ({ job }) => `${job.position} in ${job.company}`
  }
]

export default function Material() {
  // вуаля!
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableRowSelection
      initialState={{ density: 'compact' }}
    />
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/_i/qn/yg/_iqnyggiqe0elkv3tfixiegdsd0.png" />
<br />

Закономерный вопрос: зачем использовать React Table, если существуют подобные абстракции? Это зависит от того, насколько кастомизированным будет внешний вид и функционал вашей таблицы. Как правило, чем более абстрагированным является решение, тем сложнее его настраивать. Другими словами, решения вроде Material React Table, обычно, предполагают использование предоставляемых ими компонентов как есть.

Надеюсь, вы узнали что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
