---
sidebar_position: 9
title: Шпаргалка по Temporal API и Dayjs
description: Шпаргалка по Temporal API и Dayjs
keywords: ['javascript', 'js', 'temporal api', 'day.js', 'dayjs', 'date', 'time', 'cheatsheet', 'шпаргалка', 'дата', 'время']
---

# Temporal API & Dayjs

`Temporal` - новый `API` для работы с датой и временем в `JS`.

- [Описание предложения](https://github.com/tc39/proposal-temporal)
- [Черновик спецификации](https://tc39.es/proposal-temporal/)
- [Рецепты по использованию `Temporal`](https://tc39.es/proposal-temporal/docs/cookbook.html)

_Обратите внимание_: предложение находится на 3 стадии рассмотрения и может подвергнуться некоторым изменениям, так что воздержитесь от его использования в продакшне до официального утверждения (вероятно, это произойдет в конце года).

Сегодня у нас имеется 2 механизма для работы с датой и временем в `JS`:

- объект [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- конструктор [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

Недостатки `Date`:

- манипуляции с датой/временем являются сложными;
- поддерживается только `UTC` и время на компьютере пользователя;
- поддерживается только григорианский календарь;
- разбор строк в даты подвержен ошибкам;
- объекты `Date` являются мутабельными, т.е. изменяемыми, например:

```js
const today = new Date()
const tomorrow = new Date(today.setDate(today.getDate() + 1))

console.log(tomorrow) // завтрашняя дата
console.log(today) // тоже завтрашняя дата!
```

Это и многое другое вынуждает разработчиков использовать библиотеки вроде [`moment.js`](https://momentjs.com/) (поддержка прекращена) или ее современные альтернативы типа [`dayjs`](https://day.js.org/) или [`date-fns`](https://date-fns.org/) при интенсивной работе с датой/временем.

`Intl.DateTimeFormat` предназначен исключительно для чувствительного к языку (локали) форматирования даты и времени.

Подробнее о нем и, в целом, об объекте `Intl` можно почитать [здесь](https://github.com/harryheman/React-Total/blob/main/md/intl.md).

## Temporal

<img src="https://habrastorage.org/webt/qb/zo/mu/qbzomud4-dtkojb1j7fje7qtqpi.png" />
<br />

Вот что можно сделать для того, чтобы поиграть с `Temporal`:

- создаем шаблон `JS-проекта` с помощью [`create-snowpack-app`](https://www.npmjs.com/package/create-snowpack-app):

```bash
# temporal-test - название проекта
# --template @snowpack/app-template-minimal - используемый шаблон
# --use-yarn - использовать yarn для установки зависимостей
# --no-git - не инициализировать Git-репозиторий
yarn create snowpack-app temporal-test --template @snowpack/app-template-minimal --use-yarn --no-git
# or
npx create-snowpack-app ...

# переходим в директорию
cd temporal-test
# открываем директорию в редакторе кода
# требуется предварительная настройка
code .
```

- устанавливаем полифил [`@js-temporal/polyfill`](https://www.npmjs.com/package/@js-temporal/polyfill)

```bash
yarn add @js-temporal/polyfill
# or
npm i @js-temporal/polyfill
```

- импортируем объекты и расширяем прототип `Date` в `index.js`:

```js
import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill'
Date.prototype.toTemporalInstant = toTemporalInstant
```

`Temporal` предоставляет следующие возможности.

__Текущие дата и время__

Объект [`Temporal.Now`](https://tc39.es/proposal-temporal/#sec-temporal-now-object) возвращает текущие дату и время:

```js
// время (UTC) с начала эпохи, т.е. с 00:00:00 1 января 1970 года
// в секундах
Temporal.Now.instant().epochSeconds
// в миллисекундах
Temporal.Now.instant().epochMilliseconds
// new Date().getTime()

// текущая временная зона
Temporal.Now.timeZone() // Asia/Yekaterinburg

// дата и время в текущей локации с учетом временной зоны
Temporal.Now.zonedDateTimeISO()
// 2022-01-06T13:39:44.178384177+05:00[Asia/Yekaterinburg]

// дата и время в другой временной зоне
Temporal.Now.zonedDateTimeISO('Europe/London')
// 2022-01-06T08:40:22.249422248+00:00[Europe/London]

// дата и время в текущей локации без учета временной зоны
Temporal.Now.plainDateTimeISO()
// 2022-01-06T13:52:19.54213954

// дата в текущей локации
Temporal.Now.plainDateISO()

// время в текущей локации
Temporal.Now.plainTimeISO()
```

__"Мгновенные" дата и время__

Объект [`Temporal.Instant`](https://tc39.es/proposal-temporal/#sec-temporal-instant-objects) возвращает объект, представляющий фиксированную позицию во времени с точностью до наносекунд. Позиция (строка) форматируется согласно `ISO 8601` следующим образом:

<img src="https://habrastorage.org/webt/f-/pm/7p/f-pm7p1ixll80mt-nqucx_dpmgg.png" />
<br />

```js
Temporal.Instant.from('2022-03-04T05:06+07:00')
// 2022-03-03T22:06:00Z

// 1 млрд. секунд с начала эпохи
Temporal.Instant.fromEpochSeconds(1.0e9)
// 2001-09-09T01:46:40Z
```

__"Зонированные" дата и время__

Объект [`Temporal.ZonedDateTime`](https://tc39.es/proposal-temporal/#sec-temporal-zoneddatetime-objects) возвращает объект, представляющий фиксированную позицию во времени с точностью до наносекунд с учетом временной зоны и календарной системы:

```js
new Temporal.ZonedDateTime(
 123456789000000000n, // наносекунды с начала эпохи (bigint)
 Temporal.TimeZone.from('Asia/Yekaterinburg'), // временная зона
 Temporal.Calendar.from('iso8601') // дефолтный календарь
) // 1973-11-30T02:33:09+05:00[Asia/Yekaterinburg]

Temporal.ZonedDateTime.from('2025-09-05T02:55:00+01:00[Europe/London]')
// 2025-09-05T02:55:00+01:00[Europe/London]

Temporal.ZonedDateTime.from({
 timeZone: 'America/New_York',
 year: 2025,
 month: 2,
 day: 28,
 hour: 10,
 minute: 15,
 second: 0,
 millisecond: 0,
 microsecond: 0,
 nanosecond: 0
}) // 2025-02-28T10:15:00-05:00[America/New_York]
```

__"Обычные" дата и время__

Обычные (plain) дата и время возвращают значения (год, месяц, день, час, минута, секунда и т.д.) без учета временной зоны:

- [`Temporal.PlainDate`](https://tc39.es/proposal-temporal/#sec-temporal-plaindate-objects) - дата:

```js
// 2022-01-31
new Temporal.PlainDate(2022, 1, 31)
Temporal.PlainDate.from('2022-01-31')
```

- [`Temporal.PlainTime`](https://tc39.es/proposal-temporal/#sec-temporal-plaintime-objects) - время:

```js
// 12:00:00
new Temporal.PlainTime(12, 0, 0)
Temporal.PlainTime.from('12:00:00')
```

- [`Temporal.PlainDateTime`](https://tc39.es/proposal-temporal/#sec-temporal-plaindatetime-objects) - дата и время:

```js
// 2022-01-31T12:00:00
new Temporal.PlainDateTime(2022, 1, 31, 12, 0, 0)
Temporal.PlainDateTime.from('2022-01-31T12:00:00')
```

- [`Temporal.PlainYearMonth`](https://tc39.es/proposal-temporal/#sec-temporal-plainyearmonth-objects) - месяц и год:

```js
// июнь 2022 года
// 2022-06
new Temporal.PlainYearMonth(2022, 6)
Temporal.PlainYearMonth.from('2022-06')
```

- [`Temporal.PlainMonthDay`](https://tc39.es/proposal-temporal/#sec-temporal-plainmonthday-objects) - месяц и день:

```js
// 4 мая
// 05-04
new Temporal.PlainMonthDay(5, 4)
Temporal.PlainMonthDay.from('05-04')
```

__Значение даты и времени__

Объект `Temporal` содержит ряд полезных свойств/геттеров:

```js
const date = Temporal.ZonedDateTime.from(
 '2022-01-31T12:13:14+05:00[Asia/Yekaterinburg]'
)

date.year         // 2022
date.month        // 1
date.day          // 31
date.hour         // 12
date.minute       // 13
date.second       // 14
date.millisecond  // 0
// и т.д.
```

Другие свойства:

- `dayOfWeek` - от `1` для понедельника до `7` для воскресенья;
- `dayOfYear` - от `1` до `365` или `366` в високосный год;
- `weekOfYear` - от `1` до `52` или `53`;
- `daysInMonth` - `28`, `29`, `30` или `31`;
- `daysInYear` - `365` или `366`;
- `inLeapYear` - `true` для високосного года.

__Сравнение и сортировка даты и времени__

Все объекты `Temporal` содержат метод `compare`, который возвращает:

- `0`, когда `date1` и `date2` равны;
- `1`, когда `date1` "больше" (наступит или наступила позже), чем `date2`;
- `-1`, когда `date1` "меньше" (наступит или наступила раньше), чем `date2`.

```js
const date1 = Temporal.Now.plainDateISO()
const date2 = Temporal.PlainDate.from('2022-04-05')

Temporal.PlainDateTime.compare(date1, date2) // -1
```

Разумеется, данный метод можно использовать для сортировки:

```js
const sortedDates = [
 '2022-01-01T00:00:00[Europe/London]',
 '2022-01-01T00:00:00[Asia/Yekaterinburg]',
 '2022-01-01T00:00:00[America/New_York]'
]
 .map((d) => Temporal.ZonedDateTime.from(d))
 .sort(Temporal.ZonedDateTime.compare)

console.log(sortedDates)
/*
 [
   '2022-01-01T00:00:00+05:00[Asia/Yekaterinburg]',
   '2022-01-01T00:00:00+00:00[Europe/London]',
   '2022-01-01T00:00:00-05:00[America/New_York]',
 ]
*/
```

__Вычисление даты и времени__

Все объекты `Temporal` содержат методы `add`, `subtract` и `round` для продолжительности (duration).

Продолжительность можно определить с помощью объекта [`Temporal.Duration`](https://tc39.es/proposal-temporal/#sec-temporal-duration-objects), передав ему `years, months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds`, а также знак (sign) `-1` для отрицательной и `1` для положительной продолжительности. Вместе с тем, стоит отметить, что указанные методы принимают любые подобные продолжительности (duration-like) значения без необходимости создания специального объекта.

```js
// 2022-01-06
const today = new Temporal.PlainDate(2022, 1, 6)

// прибавляем 1 день
const tomorrow = today.add({ days: 1 })
// или
// прибавляем 2 дня
const dayAfterTomorrow = today.add(Temporal.Duration.from({ days: 2 }))
// вычитаем 1 день
const yesterday = today.subtract({ days: 1 })

console.log(tomorrow) // 2022-01-07
console.log(dayAfterTomorrow) // 2022-01-08
console.log(yesterday) // 2022-01-05

// сегодняшняя дата осталась неизменной
// объекты `Temporal` являются иммутабельными (неизменяемыми)
console.log(today) // 2022-01-06

const duration = Temporal.Duration.from({ days: 2, hours: 12 })
const durationInDays = duration.round({ smallestUnit: 'days' })
// 3 дня
// https://day.js.org/docs/en/durations/as-iso-string
console.log(durationInDays) // P3D
```

Предположим, что у нас имеется такой инпут:

```html
<input type="date" class="calendar-input" />
```

Вот как можно установить "недельное" ограничение на выбор даты с помощью `Temporal` и отформатировать вывод с помощью `Intl.DateTimeFormat`:

```js
const today = Temporal.Now.plainDateISO()
const afterWeek = today.add({ days: 7 })

const calendarInput = document.querySelector('.calendar-input')

calendarInput.min = today
calendarInput.max = afterWeek
calendarInput.value = today

const dateFormatter = new Intl.DateTimeFormat([], {
 dateStyle: 'long'
})

calendarInput.onchange = ({ target: { value } }) => {
 const date = Temporal.PlainDate.from(value)
 const formattedDate = dateFormatter.format(date)
 console.log(formattedDate) // например, 14 января 2022 г.
}
```

Методы `until` и `since` возвращают объект `Temporal.Duration`, описывающий время до или после указанных даты и времени на основе текущей даты/времени:

```js
// количество месяцев, оставшихся до d1
d1.until().months

// дней до d2
d2.until().days

// недель, прошедших с d3
d3.since().weeks
```

Метод `equals` предназначен для определения идентичности (равенства) даты/времени:

```js
const d1 = Temporal.PlainDate.from('2022-01-31')
const d2 = d1.add({ days: 1 }).subtract({ hours: 24 })

console.log(
 d1.equals(d2)
) // true

console.log(
 Temporal.PlainDate.compare(d1, d2)
) // 0
```

__Строковые значения даты и времени__

Все объекты `Temporal` содержат метод `toString`, который возвращает строковое представление даты/времени:

```js
Temporal.Now.zonedDateTimeISO().toString()
// 2022-01-06T16:30:51.380651378+05:00[Asia/Yekaterinburg]

Temporal.Now.plainDateTimeISO().toString()
// 2022-01-06T16:32:47.870767866

Temporal.Now.plainDateISO().toString()
// 2022-01-06
```

Для форматирования даты/времени можно использовать объекты `Intl` или `Date`:

```js
// объект `Temporal`, не строка
const d1 = Temporal.Now.plainDateISO()

// ok
new Intl.DateTimeFormat('ru-RU').format(d1) // 06.01.2022
new Intl.DateTimeFormat('en-US').format(d1) // 1/6/2022
new Intl.DateTimeFormat('de-DE').format(d1) // 6.1.2022
// не ok
new Date(d1).toLocaleDateString() // error

// строка
const d2 = Temporal.Now.plainDateISO().toString()

// ok
new Date(d2).toLocaleDateString() // 06.01.2022
// не ok
new Intl.DateTimeFormat().format(d2) // error
// но
new Intl.DateTimeFormat().format(new Date(d2)) // ok
```

Для преобразования объекта `Date` в объект `Temporal.Instant` предназначен метод `toTemporalInstant` объекта `Date`. Для обратного преобразования используется свойство `epochMilliseconds` объектов `Temporal.Instant` и `Temporal.ZonedDateTime`:

```js
// туда
const legacyDate1 = new Date()
const temporalInstant = legacyDate1.toTemporalInstant()
// сюда
const legacyDate2 = new Date(temporalInstant.epochMilliseconds)
```

__Вместо заключения__

Появление в `JS` нового `API` для работы с датой/временем - это, конечно, хорошо, но:

- интерфейс `Temporal` сложно назвать дружелюбным, в отличие от `API`, предоставляемого `dayjs` и другими популярными `JS-библиотеками` для работы с датой/временем;
- многословный синтаксис: например, зачем использовать `Temporal.Now.plainDateTimeISO(Temporal.Now.timeZone()).toString()`, который все равно придется форматировать, когда есть `new Date().toLocaleString()`;
- отсутствие встроенной возможности форматирования даты/времени;
- для интеграции с `Date` и `Intl` требуются дополнительные преобразования и т.д.

Вывод:

- если в приложении ведется или планируется активная работа с датой/временем, используйте библиотеку;

## Dayjs

```js
// yarn add dayjs
import dayjs from 'dayjs' // 6.8K!

// plugins
import isLeapYear from 'dayjs/plugin/isLeapYear'
import utc from 'dayjs/plugin/utc'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import weekday from 'dayjs/plugin/weekday'
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear'
import minMax from 'dayjs/plugin/minMax'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import isBetween from 'dayjs/plugin/isBetween'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import toArray from 'dayjs/plugin/toArray'
import toObject from 'dayjs/plugin/toObject'
import arraySupport from 'dayjs/plugin/arraySupport'
import objectSupport from 'dayjs/plugin/objectSupport'

// locale
import 'dayjs/locale/ru'

// plugins
dayjs.extend(isLeapYear)
dayjs.extend(utc)
dayjs.extend(weekday)
dayjs.extend(dayOfYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(minMax)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(timezone)
dayjs.extend(updateLocale)
// toArray()
dayjs.extend(toArray)
// toObject()
dayjs.extend(toObject)
// dayjs(array)
dayjs.extend(arraySupport)
// dayjs(object)
dayjs.extend(objectSupport)

// locale
// global
dayjs.locale('ru')
// instance
// dayjs().locale('ru').format()

dayjs.updateLocale('ru', {
 ordinal: (n) => `${n}ое`
})

const localeDateTime1 = dayjs().format('DD.MM.YYYY, HH:mm:ss')
console.log(localeDateTime1) // 06.01.2022, 18:55:38
// native way
// new Date().toLocaleString()
/*
 new Intl.DateTimeFormat([], {
   dateStyle: 'short',
   timeStyle: 'medium' // with seconds
 }).format()
*/

const localeDateTime2 = dayjs().format('D MMMM YYYY г., HH:mm:ss')
console.log(localeDateTime2) // 6 января 2022 г., 19:01:01
// native way
/*
 new Intl.DateTimeFormat([], {
   day: 'numeric',
   month: 'long',
   year: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
   second: '2-digit'
 }).format()
*/

// utc plugin
const utcDateTime = dayjs.utc().format('DD.MM.YYYY, HH:mm')
console.log(utcDateTime) // 06.01.2022, 14:11

// dayjs(date).isValid()

// weekday plugin
const dateFormat = 'DD.MM.YYYY'
const nextMonday = dayjs().weekday(7).format(dateFormat)
console.log(nextMonday) // 10.01.2022

// setters/getters
// millisecond, second, minute, hour,
// date, day (0 indexed), month (0 indexed), year
// and some special units
// or
// get('year') | get('y')
// set('date', 1) | set('D', 1)

// dayOfYear and isLeapYear plugins
const halfOfYearDate = dayjs()
 .dayOfYear(dayjs().isLeapYear() ? 366 / 2 : 365 / 2)
 .format(dateFormat)
console.log(halfOfYearDate) // 02.07.2022

// isoWeeksInYear plugin
// isLeapYear plugin is required
const weeksInThisYear = dayjs().isoWeeksInYear()
console.log(weeksInThisYear) // 52

// minMax plugin
// max(date1, date2, ...dateN) | max(date[])
const maxDate = dayjs
 .max(dayjs(), dayjs('2021-12-31'), dayjs('2022-05-03'))
 .format(dateFormat)
console.log(maxDate) // 03.05.2022

// calculations
// subtract(value: number, unit?: string) | subtract({ unit: value })
const today = dayjs()
const yesterday = today.subtract(1, 'day').format(dateFormat)
// or using duration
// duration plugin is required
// duration(value: number, unit?: string) | duration({ unit: value })
const anotherYesterday = today
 .subtract(dayjs.duration({ day: 1 }))
 .format(dateFormat)
// native way
/*
 const today = new Date()
 const yesterday = new Date(
   today.setDate(today.getDate() - 1)
 ).toLocaleDateString()
*/
const dayAfterTomorrow = today.add(2, 'days').format(dateFormat)
console.log(yesterday) // 05.01.2022
console.log(dayAfterTomorrow) // 08.01.2022

const lastMonday = dayjs().startOf('week').format(dateFormat)
console.log(lastMonday) // 03.01.2022

const lastDayOfCurrentMonth = dayjs().endOf('month').format('dddd')
console.log(lastDayOfCurrentMonth) // понедельник

const timeFormat = 'HH:mm'
// get UTC offset in minutes
// convert minutes to hours
const myUtcOffset = dayjs().utcOffset() / 60
console.log(myUtcOffset) // 5

// set UTC offset in hours (from -16 to 16) or minutes
const localTimeFromUtc = dayjs.utc().utcOffset(myUtcOffset).format(timeFormat)
console.log(localTimeFromUtc) // 19:55

// relativeTime plugin
const d1 = '1380-09-08'
// fromNow(withoutSuffix?: boolean)
// from(date, withoutSuffix?)
const fromNow = dayjs(d1).fromNow()
console.log(fromNow) // 641 год назад

const d2 = '2022-07-02'
// toNow(withoutSuffix?: boolean)
// to(date, withoutSuffix?)
const toDate = dayjs().to(d2)
console.log(toDate) // через 6 месяцев

// difference
const d3 = dayjs('2021-07-01')
const d4 = dayjs('2022-01-01')
// date1.diff(date2, unit?: string, withoutTruncate?: boolean)
const diffInMonths = d4.diff(d3, 'month')
console.log(diffInMonths) // 6

// unix() - in seconds
const unixTimestampInMs = dayjs(d3).valueOf()
console.log(unixTimestampInMs) // 1625079600000

const daysInCurrentMonth = dayjs().daysInMonth()
console.log(daysInCurrentMonth) // 31

// toJSON()
const currentDateInIso = dayjs().toISOString()
console.log(currentDateInIso) // 2022-01-07T12:49:51.238Z

// query
// default unit is ms
// isBefore(date, unit?: string)
// isSame(date, unit?)
// isAfter(date, unit?)

// isSameOrBefore | isSameOrAfter plugins are required
// isSameOrBefore(date, unit?) | isSameOrAfter(date, unit?)

// isBetween plugin is required
// [ - inclusion of date, ( - exclusion
// isBetween(date1, date2, unit?: string, inclusivity?: string)
const isTodayStillWinter = dayjs().isBetween(
 '2021-12-01',
 '2022-03-01',
 'day',
 '[)'
)
console.log(isTodayStillWinter) // true

const myTimezone = dayjs.tz.guess()
console.log(myTimezone) // Asia/Yekaterinburg

const currentDateTimeAdvanced = dayjs().format(
 'Do MMMM YYYY г., HH часов mm минут (z)'
)
console.log(currentDateTimeAdvanced) // 7ое январь 2022 г., 18 часов 13 минут (GMT+5)

const currentDateTimeLocalized = dayjs().format('LLLL (zzz)')
console.log(currentDateTimeLocalized)
// пятница, 7 января 2022 г., 18:44 (Yekaterinburg Standard Time)

// humanize(withSuffix?: boolean)
const inADay = dayjs.duration(1, 'day').humanize(true)
console.log(inADay) // через день
```

- если манипуляции с датой/временем простые, немногочисленные и не предполагают разного формата вывода, используйте `Temporal` + `Date` или `Intl.DateTimeFormat`.
