---
sidebar_position: 28
---

# Google Spreadsheet

## Инициализация

```js
require('dotenv').config()

const { GoogleSpreadsheet } = require('google-spreadsheet')

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID) // извлекаем из адресной строки
// загружаем информацию о таблице
await doc.loadInfo()

// создание новой строки
const newSheet = await doc.addSheet()
// получаем первую таблицу в порядке появления
const firstSheet = doc.sheetsByIndex[0]
// получаем таблицу по `id`
const otherSheet = doc.sheetsById[123]
```

## Свойства

### Основные

- `sheetId: str` - идентификатор таблицы
- `title: str` - название таблицы
- `index: num >= 0` - индекс
- `sheetType: str (enum)` - тип
- `gridProperties: obj` - дополнительные свойства, если таблица является гридом
- `hidden: bool` - является ли таблица скрытой
- `tabColor: obj` - цвет вкладки
- `rightToLeft: bool` - направление текста

### Статистика

- `rowCount: num > 1` - количество строк
- `columnCount: num > 1` - количество колонок (столбцов)
- `cellStats: obj` - статистика о ячейках
- `cellStats.total: num >= 0` - количество ячеек, загруженных локально
- `cellStats.notEmpty: num >= 0` - количество загруженных непустых ячеек

## Методы

### Работа со строками

- `loadHeaderRow()` - загружает заголовок таблицы (первую строку). Обычно, не требуется вызывать вручную
- `setHeaderRow(values)` - устанавливает заголовок таблицы. `values` - массив строк - значения колонок первой строки
- `addRow(values, options?)` - добавляет новую строку. `values` - объект или массив. `options` - объект с настройками: `raw: bool` - сохранение строки без приведения к определенному типу, `insert: bool` - замена строк вместо создания новых
- `addRows(values, options?)` - добавление нескольких строк. `values` - массив значений строк. `options` такой же как в `addRow()`
- `getRows(options?)` - получение строк. `options` - объект с настройками: `offset: num >= 0` - количество пропускаемых строк, `limit: num >= 0` - количество получаемых строк

### Работа с ячейками

- `loadCells(filters?)` - фильтрует загружаемые таблицы

```js
await sheet.loadCells() // без фильтрации
await sheet.loadCells('B2:D5') // диапазон A1
await sheet.loadCells({
  startRowIndex: 5, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 200
}) // объект `GridRange`
await sheet.loadCells({ startRowIndex: 50 })
await sheet.loadCells(['B2:D5', 'B50:D55'])
```

О фильтрах можно почитать <a href="https://developers.google.com/sheets/api/reference/rest/v4/DataFilter">здесь</a>, о `GridRange` - <a href="https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#GridRange">здесь</a>.

- `getCell(rowIndex: num >= 0, columnIndex: num >= 0)` - извлекает ячейку из кэша на основе ненулевых индексов строки/колонки
- `getCellByA1(a1Adress)` - извлекает ячейку на основе адреса A1, например, `B5`
- `saveUpdatedCells()` - сохраняет все ячейки, которые имеют несохраненные изменения
- `saveCells(cells: arr)` - сохраняет указанные ячейки. Обычно, проще использовать `saveUpdatedCells()`
- `resetLocalCache(dataOnly?: bool)` - сбрасывает локальный кэш свойств и данных ячеек
- `mergeCells(range: RangeGrid, type)` - объединяет ячейки. Про тип объекдинения можно почитать <a href="https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#MergeType">здесь</a>
- `unmergeCells(range: GridRange)` - разделяет ячейки

### Обновление свойств

- `updateProperties(props)` - обновляет основные свойства таблицы

```js
await sheet.updateProperties({ title: 'New title' })
```

- `resize(props)` - обновляет свойства / размеры грида

```js
await sheet.resize({ rowCount: 1000, columnCount: 20 })
// является сокращением для
(props) => sheetUpdateProperties({ gridProperties: props })
```

- `updateDimensionProperties(colsOrRows: str (enum), props, bounds)` - обновляет размеры. `colsOrRows` - 'COLUMNS' | 'ROWS'. `props` - свойства для обновления. `bounds` - объект со следующими свойствами: `startIndex: num >= 0` - начало строки/колонки, `endIndex: num >= 0` - конец строки/колонки

### Другие

- `clear()` - очищает все данные/ячейки таблицы
- `delete()` - удаляет табалицу. Таблица становится недоступной в `doc.sheetById` и `doc.sheetByIndex`
- `copyToSpreadsheet(dest: str)` - копирование таблицы в другой документ. `dest` - `id` другой таблицы
