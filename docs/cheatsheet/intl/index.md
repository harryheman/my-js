---
hide_title: true
title: Шпаргалка по Internationalization API
description: Шпаргалка по Internationalization API
keywords: ['javascript', 'js', 'internationalization api', 'internationalization', 'intl']
tags: ['javascript', 'js', 'internationalization api', 'internationalization', 'intl']
---

# Internationalization API

- [Утилита `easy-intl`, облегчающая использование данного интерфейса](https://www.npmjs.com/package/easy-intl).
- [Пример использования `easy-intl`](https://codepen.io/harryheman/pen/QWgKGry).

[`Internationalization API`](https://tc39.es/ecma402/) предоставляет следующие возможности:

- локализованное (далее предполагается) сравнение строк
- форматирование чисел, включая валюту, различные единицы измерения и проценты
- форматирование даты и времени, включая относительные периоды, такие как завтра, вчера, через неделю и т.д.
- форматирование названий языков, регионов, скриптов и валют
- форматирование списков с соединительным союзом `И` или разделительным союзом `ИЛИ`
- "плюрализация" - перевод во множественное число
- преобразование регистра

В настоящее время  `Internationalization API` [поддерживается всеми современными браузерами](https://caniuse.com/internationalization).

Несмотря на то, что в `JavaScript` существуют такие методы для локализации как:

- [`Array.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString)
- [`String.localeCompare()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare), [`.toLocalLowerCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase), [`.toLocalUpperCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase)
- [`Number.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)
- [`Date.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString), [`.toLocaleDateString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString), [`.toLocaleTimeString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString)

их зачастую оказывается недостаточно.

Кроме того, поведение данных методов определяется конкретной реализацией `ECMAScript`, т.е. браузером.

Функционал, определенный в `Internationalization API`, инкапсулирован в объекте <a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl">`Intl`</a>. Данный объект не имеет внутреннего метода `[[Construct]]`, поэтому не может вызываться как конструктор с помощью ключевого слова `new`. Он также не имеет внутреннего метода `[[Call]]`, поэтому не может вызываться как функция.

`Intl` включает в себя следующие интерфейсы-конструкторы:

- `Collator` - сравнение строк
- `DateTimeFormat` - форматирование даты и времени
- `DisplayNames` - форматирование названий языков, регионов и т.д. на других языках
- `ListFormat` - форматирование списков
- `Locale` - определение локали
- `NumberFormat` - форматирование чисел
- `PluralRules` - плюрализация
- `RelativeTimeFormat` - форматирование относительных периодов времени

Возможные значения:

- [для языков (языков и стран)](https://github.com/libyal/libfwnt/wiki/Language-Code-identifiers)
- [для валют](https://en.wikipedia.org/wiki/ISO_4217#Active_codes)
- [для временных зон](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
- [для единиц измерения - примеры](https://unicode.org/reports/tr35/tr35-general.html#Example_Units)

_Пример получения текущей даты и времени в дефолтной локали_

```js
// [] означает текущую локаль (локаль по умолчанию)
const currentDateAndTime = new Intl.DateTimeFormat([], {
  dateStyle: 'short',
  timeStyle: 'short'
}).format()

console.log(currentDateAndTime) // 03.08.2021, 15:57
```

## <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale">`Locale`</a>

Конструктор `Locale` используется для создания экземпляров идентификаторов локали. Первым обязательным аргументом, передаваемым `Locale`, является локаль, которая может состоять из следующего:

- код языка
- код диалекта
- код региона или страны
- один или несколько уникальных вариантных подтегов (subtags)
- одна или несколько последовательностей из расширения `BCP 47`
- последовательность из расширения для частного использования

В большинстве случаев достаточно указать код языка или код языка и код страны через дефис:

```js
const ru = new Intl.Locale('ru-RU')
```

Вторым опциональным аргументом `Locale` является объект с настройками:

```js
const ru = new Intl.Locale(
  'ru',
  { region: 'RU', hourCycle: 'h24', calendar: 'gregory' }
)
```

Локаль может быть строкой или объектом. Пустой массив означает использование текущей локали пользователя:

```js
const now = new Intl.DateTimeFormat([], { timeStyle: 'short' }).format()
```

## <a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat">`DateTimeFormat`</a>

Конструктор `DateTimeFormat` используется для форматирования даты и времени. Он принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.DateTimeFormat(locale: object | string | [], options: object).format(date)
// [] - локаль по умолчанию
// date - дата, время или дата и время
```

_Настройки_

Свойство | Описание
--- | ---
timeZone | часовой пояс: `UTC`, `America/New_York`, `Europe/Paris` и т.д.
calendar | календарь: `chinese`, `gregory`, `hebrew`, `indian`, `islamic` и т.д.
numberingSystem | система счисления: `arab`, `beng`, `fullwide`, `latin` и т.д.
localeMatcher | алгоритм для поиска совпадений: `lookup`, `best fit`
formatMatcher | алгоритм для форматирования: `basic`, `best fit`
hour12 | если имеет значение `true`, используется 12-часовой формат
hourCycle | часовой формат: `h11`, `h12`, `h23`, `h24`
dateStyle | стиль форматирования даты: `full`, `long`, `medium`, `short`
weekday | день недели: `long`, `short`, `narrow`
day | день месяца: `numeric`, `2-digit`
month | месяц: `numeric`, `2-digit`, `long`, `short`, `narrow`
year | год: `numeric`, `2-digit`
era | эпоха: `long`, `short`, `narrow`
timeStyle | стиль форматирования времени: `full`, `long`, `medium`, `short`
hour | часы: `numeric`, `2-digit`
minute | минуты: `numeric`, `2-digit`
second | секунды: `numeric`, `2-digit`
dayPeriod | часть дня (утро, вечер и т.п.): `narrow`, `short`, `long`
timeZoneName | название часового пояса (UTC, PTC): `long`, `short`

Настройки `localeMatcher` и `formatMatcher` могут передаваться любому конструктору, предоставляемому `Intl`, но используются редко.

По умолчанию `new Intl.DateTimeFormat().format()` возвращает текущую дату в кратком виде (`dateStyle: short`).

_Примеры_

```js
const formatDateTime = ({ locale = [], date = Date.now(), ...options } = {}) =>
  new Intl.DateTimeFormat(locale, options).format(date)

console.log(
  '\n',
  // русский
  formatDateTime(), // 17.08.2021
  '\n',
  // американский английский
  formatDateTime({ locale: 'en-US', dateStyle: 'short', timeStyle: 'short' }), // 8/17/21, 3:56 PM,
  '\n',
  // британский английский
  formatDateTime({ locale: 'en-GB', dateStyle: 'long', timeStyle: 'short' }), // 17 August 2021 at 15:57
  '\n',
  // японский
  formatDateTime({ locale: 'ja-JP', dateStyle: 'short' }), // 2021/08/17
  '\n',
  // испанский
  formatDateTime({ locale: 'es-ES', dateStyle: 'full', timeStyle: 'full' }), // martes, 17 de agosto de 2021, 15:57:49 (hora estándar de Ekaterimburgo)
  '\n',
  // французский
  formatDateTime({
    locale: 'fr-FR',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit'
  }) // mardi 17 août 2021, 15 h
)
```

_Другие методы_

- `formatToParts()` - возвращает массив объектов, содержащих форматированную дату в виде пар ключ/значение (`{ type: 'weekday', value: 'Monday' }`)
- `formatRange(startDate, endDate)` - возвращает диапазон, например, `01/10/2022, 10:00 AM - 12:00 PM`
- `formatRangeToParts()`
- `resolveOptions()` - возвращает объект со свойствами, значениями которых являются вычисленные настройки форматирования для локали, даты и времени

## <a href="https://tc39.es/ecma402/#relativetimeformat-objects">`RelativeTimeFormat`</a>

Конструктор `RelativeTimeFormat` используется для локализации относительного времени, например, вчера, завтра, на следующей неделе, в прошлом месяце и т.д. Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.RelativeTimeFormat(locale, options).format(amount, unit)
// amount - количество единиц времени
// unit - единица времени: `day`, `month`, `year` и т.д.
```

Положительное число в `amount` означает будущее, отрицательное - прошлое.

_Настройки_

Свойство | Описание
--- | ---
numeric | `always` - "1 день назад" (дефолтное значение), `auto` - "вчера"
style | `long` (дефолтное значение), `short`, `narrow`

В данном случае метод `format` в качестве аргументов принимает число и единицу времени.

_Примеры_

```js
const formatRelativeTime = ({
  locale = [],
  value = '1 day',
  ...options
} = {}) => {
  const [amount, unit] = value.split(/[\s_]/)
  return new Intl.RelativeTimeFormat(locale, options).format(amount, unit)
}

console.log(
  '\n',
  formatRelativeTime(), // через 1 день
  '\n',
  formatRelativeTime({ locale: 'en-US', value: '-1 day', numeric: 'auto' }), // yesterday
  '\n',
  formatRelativeTime({
    locale: 'fr-FR',
    value: '1 week',
    style: 'long'
  }), // dans 1 semaine
  '\n',
  formatRelativeTime({
    locale: 'ja-JP',
    value: '-1 month',
    numeric: 'auto',
    style: 'long'
  }) // 先月
)
```

## <a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat">`NumberFormat`</a>

Конструктор `NumberFormat` используется для форматирования чисел, валюты, процентов и единиц измерения, таких как длина, температура и др. Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.NumberFormat(locale, options).format(number)
```

_Настройки_

Свойство | Описание
--- | ---
style | вид единиц: `decimal` - число с плавающей точкой, `currency` - валюта, `percent` - проценты, `unit` - единицы измерения. От этой настройки зависят другие
notation | стиль форматирования: `standard`, `scientific`, `engineering`, `compact`
numberingSystem | система счисления: `arab`, `beng`, `deva`, `fullwide`, `latn` и др.
minimumIntegerDigits | минимальное количество цифр целой части числа (от 1 до 21; по умолчанию 1)
minimumFractionDigits | минимальное количество цифр после запятой (от 0 до 20; по умолчанию 0)
maximumFractionDigits | максимальное количество цифр после запятой (от 0 до 20; по умолчанию наибольшее значение из minimumFractionDigits и 3)
minimumSignificantDigits | минимальное количество значащих цифр (от 1 до 21; по умолчанию 1)
maximumSignificantDigits | минимальное количество значащих цифр (от 1 до 21; по умолчанию minimumSignificantDigits)
signDisplay | отображение символов `+/-`: `auto`, `never`, `always`, `exceptZero`
useGrouping | если имеет значение `false`, разделители тысяч будут игнорироваться
compactDisplay | форматирование при использовании нотации `compact`
currency | код валюты при использовании стиля `currency`: `USD`, `EUR`, `RUB` и т.д.
currencyDisplay | отображение символа/названия валюты при использовании стиля `currency`: `symbol`, `narrowSymbol`, `code`, `name`
currencySign | форматирование отрицательных значений при использовании стиля `currency`: `standard`, `accounting`
unit | вид единицы измерения: `centimeter`, `meter`, `minute`, `hour`, `byte` и т.д.
unitDisplay | формат отображения единицы измерения: `long`, `short`, `narrow`

_Примеры_

```js
const formatNumber = ({ locale = [], number = 1234.56, ...options } = {}) =>
  new Intl.NumberFormat(locale, options).format(number)

console.log(
  '\n',
  formatNumber(),
  '\n', // 1 234,56
  formatNumber({ locale: 'en-US' }),
  '\n', // 1,234.56
  formatNumber({ locale: 'de-DE', style: 'currency', currency: 'EUR' }),
  '\n', // 1.234,56 €
  formatNumber({ locale: 'fr-FR', style: 'percent' }),
  '\n', // 123 456 %
  formatNumber({
    locale: 'it-IT',
    style: 'unit',
    unit: 'celsius',
    minimumFractionDigits: 3
  }),
  '\n' // 1.234,560 °C
)
```

## <a href="https://tc39.es/ecma402/#intl-displaynames-objects">`DisplayNames`</a>

Конструктор `DisplayNames` используется для форматирования названий языков, диалектов, регионов и валют на другом языке. Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.DisplayNames(locale, options).of(localeOf)
```

__Настройки__

Свойство | Описание
--- | ---
type | тип названия: `language`, `region`, `script`, `currency`
style | стиль форматирования: `long`, `short`, `narrow`
fallback | резерв: `code`, `none`

_Обратите внимание_: настройка `type` является обязательной. При этом хорошо поддерживается только `type` со значением `language`.

__Примеры__

```js
const formatNames = ({
  locale = [],
  localeOf = 'en-US',
  type = 'language',
  ...options
} = {}) => new Intl.DisplayNames(locale, { type, ...options }).of(localeOf)

console.log(
  '\n',
  formatNames(),
  '\n', // американский английский
  formatNames({
    localeOf: 'Egyp',
    type: 'script'
  }),
  '\n', // египетская иероглифическая
  formatNames({
    locale: 'fr-FR',
    localeOf: 'AU',
    type: 'region'
  }),
  '\n', // Australie - Авcтралия по-французски
  formatNames({
    locale: 'pl-PL',
    localeOf: 'GBP',
    type: 'currency',
    style: 'long'
  }),
  '\n' // funt szterling - английские фунты стерлингов на польском
)
```

## <a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat">`ListFormat`</a>

Конструктор `ListFormat` используется для форматирования списков путем подстановки соединительного союза `И` или разделительного союза `ИЛИ`. Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.ListFormat(locale, options).format(list)
```

_Настройки_

Свойство | Описание
--- | ---
type | формат вывода: `conjunction` (и; дефолтное значение), `disjunction` (или), `unit` (нет)
style | стиль форматирования: `long`, `short`, `narrow`

_Примеры_

```js
const browsers = ['Chrome', 'Firefox', 'Safari']

const formatList = ({
  locale = [],
  list = browsers,
  ...options
} = {}) => new Intl.ListFormat(locale, options).format(list)

console.log(
  '\n',
  formatList(),
  '\n', // Chrome, Firefox и Safari
  formatList({ locale: 'en-US', style: 'short' }),
  '\n', // Chrome, Firefox, & Safari
  formatList({ locale: 'ja-JP', type: 'disjunction' }),
  '\n' // Chrome、Firefox、またはSafari
)
```

## <a href="https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator">`Collator`</a>

Конструктор `Collator` используется для сравнения строк с учетом локали. Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.Collator(locale, options).compare(str1, str2)
```

_Настройки_

Свойство | Описание
--- | ---
usage | `sort` - сортировка (дефолтное значение) или `search` - поиск
sensitivity | чувствительность: `base`, `accent`, `case`, `variant`
collation | сопоставление вариантов для нескольких языков
numeric | `true` означает сравнение чисел
ignorePunctuation | `true` означает игнорирование пунктуации
caseFirst | `upper` - сначала идут строки, начинающиеся с большой буквы, `lower` - сначала идут строки, начинающиеся с маленькой буквы

_Результат_

- `0` - строки равны
- `-1` - первая строка "меньше" второй
- `1` - первая строка "больше" второй

_Примеры_

```js
const compareValues = ({ locale = [], values = [], ...options } = {}) =>
  new Intl.Collator(locale, options).compare(...values)

console.log(
  '\n',
  compareValues({ values: ['a', 'á'], sensitivity: 'base' }),
  '\n', // 0 -> одинаковые
  compareValues({ values: ['2', '10'] }),
  '\n', // 1 -> '2' > '10'
  compareValues({ values: ['2', '10'], numeric: true }),
  '\n' // -1 -> 2 < 10
)
```

## <a href="https://tc39.es/ecma402/#pluralrules-objects">`PluralRules`</a>

Конструктор `PluralRules` используется для плюрализации (перевода во множественное число). Данный метод принимает локаль и объект с настройками.

_Сигнатура_

```js
new Intl.PluralRules(locale, options).select(number)
```

_Настройки_

Свойство | Описание
--- | ---
type | `cardinal` - количество элементов (дефолтное значение), `ordinal` - порядок элемента (первый, второй, третий и т.д.)

_Примеры_

```js
const pluralize = ({ locale = [], number = 1, ...options } = {}) =>
  new Intl.PluralRules(locale, options).select(number)

console.log(
  '\n',
  pluralize(),
  '\n', // one
  pluralize({ locale: 'ru-RU', type: 'ordinal' }),
  '\n' // other
)
```

Как видите, в настоящее время данный метод поддерживает только локаль `en-US`.
