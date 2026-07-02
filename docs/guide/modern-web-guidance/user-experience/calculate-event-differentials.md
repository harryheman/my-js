# Вычисление времени между событиями с помощью Temporal

Вычисление времени, прошедшего между событиями (например, истечение срока действия пробной версии, продолжительность подписки или пропорциональные затраты), с помощью объекта `Date` исторически было сложным из-за проблем с временными зонами, переходами на летнее/зимнее время (DST) и несогласованным парсингом.

`Temporal` API предоставляет современное надежное решение для вычисления даты и времени. В частности, `Temporal.ZonedDateTime` и `Temporal.Duration` позволяют выполнять точные, DST-безопасные вычисления разницы во времени.

## Реализация

Для вычисления разницы между двумя событиями:

1. Создайте объекты ZonedDateTime: преобразуйте данные (даты и время) в объекты `Temporal.ZonedDateTime`. Это обеспечивает учет временной зоны при вычислениях.
2. Вычисляйте прошедшее время с помощью `.since()`: используйте `currentZonedDateTime.since(startZonedDateTime)` для вычисления времени, прошедшего с определенного события в прошлом.
3. Вычисляйте оставшееся время с помощью `.until()`: используйте `currentZonedDateTime.until(endZonedDateTime)` для вычисления времени, оставшегося до определенного события в будущем.
4. Управляйте точностью с помощью настроек: используйте `largestUnit`, `smallestUnit` и `roundingMode` для управления балансировкой и округлением результата.

### Пример: вычисление истечения срока действия пробного периода

```javascript
// 1. Получаем текущую временную точку в системной временной зоне
const now = Temporal.Now.zonedDateTimeISO();
const tz = now.timeZoneId;

// 2. Парсим данные (предполагаются строки ISO)
const startDateStr = "2025-01-01";
const startTimeStr = "12:00:00";
const endDateStr = "2025-01-31";
const endTimeStr = "12:00:00";

const startDate = Temporal.PlainDate.from(startDateStr);
const startTime = Temporal.PlainTime.from(startTimeStr);
const start = startDate.toPlainDateTime(startTime).toZonedDateTime(tz);

const endDate = Temporal.PlainDate.from(endDateStr);
const endTime = Temporal.PlainTime.from(endTimeStr);
const end = endDate.toPlainDateTime(endTime).toZonedDateTime(tz);

// 3. Вычисляем разницу с помощью `.since()` и `.until()`.
// По умолчанию, единицы, большие чем часы, могут не вычисляться автоматически.
// Используйте `largestUnit` для выражения разницы в больших единицах при необходимости.
const timeActive = now.since(start, { largestUnit: 'year' });
const timeRemaining = now.until(end, { largestUnit: 'year' });

console.log(`Active: ${timeActive.days} days, ${timeActive.hours} hours`);
console.log(`Remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours`);

// 4. Сравниваем даты
const isExpired = Temporal.ZonedDateTime.compare(now, end) > 0;
if (isExpired) {
  console.log("Subscription is expired.");
}
```

## Стратегическая реализация и лучшие практики

- Используйте `Temporal.ZonedDateTime` для вычислений, включающих реальные события, происходящие в определенных временных зонах (например, продление подписки или планирование события).
- Используйте `largestUnit` для определения наибольшей единицы результата (например, `'year'` или `'month'`). Дефолтным значением этой настройки является `'auto'`, что может приводить к тому, что результат не соответствует ожиданиям.
- Используйте `.since()` для вычисления времени, прошедшего с определенного события (например, `now.since(start)`), и `.until()` для вычисления времени, оставшегося до определенного события (например, `now.until(end)`).
- Не модифицируйте экземпляры напрямую; объекты `Temporal` являются иммутабельными. Такие операции, как `add()`, `subtract()` или `with()` возвращают новый экземпляр.
- Используйте `Temporal.ZonedDateTime.compare` для сравнения временных точек. Возвращается `1`, если первая точка следует после второй, `-1`, если до, и `0`, если точки равны.

## Поддержка и страховка

`Temporal` имеет ограниченную поддержку браузеров. Поддерживается в Chrome 144+, Edge 144+ (с января 2026 года) и Firefox 139+ (с мая 2025 года). Не поддерживается в Safari.

Для старых браузеров используйте определение поддержки и полифилл. Один из соответствующих стандартам полифиллов - `@js-temporal/polyfill`.

Обратите внимание, что полифилл не добавляет объект `Temporal` в глобальную область видимости автоматически во избежание конфликтов. При необходимости, это нужно делать вручную.

```javascript
// Проверяем поддержку Temporal
(async () => {
  if (typeof Temporal === 'undefined') {
    // Загружаем полифилл условно
    const module = await import("https://esm.sh/@js-temporal/polyfill");
    globalThis.Temporal = module.Temporal;
    // Расширяем `Date.prototype` при необходимости
    Date.prototype.toTemporalInstant = module.toTemporalInstant;
    initializeApp();
  }
})();
```
