---
sidebar_position: 17.3
title: Паттерны проектирования TypeScript
description: Паттерны проектирования TypeScript
keywords: [javascript, js, typescript, ts, design patterns, patterns, паттерны проектирования, шаблоны]
tags: [javascript, js, typescript, ts, design patterns, patterns, паттерны проектирования, шаблоны]
---

# Паттерны проектирования TypeScript

[Источник](https://medium.com/@bytefer/list/mastering-typescript-series-688ee7c12807).

Спасибо [Денису Улесову](https://github.com/denis-ttk-1975) за помощь в редактировании материала.

_Обратите внимание_: предполагается, что вы имеете некоторый опыт работы с `TypeScript`. Если нет, рекомендую начать с:

- [Карманной книги по TypeScript](https://my-js.org/docs/guide/ts) или
- [Шпаргалки по TypeScript](https://my-js.org/docs/cheatsheet/ts).

Паттерны (или шаблоны) проектирования (design patterns) описывают типичные способы решения часто встречающихся проблем при проектировании программ.

В отличие от готовых функций или библиотек, паттерн нельзя просто взять и скопировать в программу. Паттерн представляет собой не какой-то конкретный код, а общую концепцию решения той или иной проблемы, которую нужно будет еще подстроить под нужды вашей программы.

Паттерны часто путают с алгоритмами, ведь оба понятия описывают типовые решения каких-то известных проблем. Но если алгоритм — это четкий набор действий, то паттерн — это высокоуровневое описание решения, реализация которого может отличаться в двух разных программах.

Если привести аналогии, то алгоритм — это кулинарный рецепт с четкими шагами, а паттерн — инженерный чертеж, на котором нарисовано решение, но не конкретные шаги его реализации (источник - https://refactoring.guru/ru/design-patterns, в настоящее время сайт работает только с `VPN`).

## Стратегия / Strategy

Важным функционалом почти любого веб-приложения является регистрация пользователя (аутентификация) и выполнение пользователем входа в систему (авторизация). Наиболее распространенными способами регистрации являются следующие: учетная запись (логин) / пароль, электронная почта или номер мобильного телефона. После успешной регистрации пользователь может использовать соответствующий метод входа в систему.

```javascript
function login(mode) {
  if (mode === "account") {
    loginWithPassword();
  } else if (mode === "email") {
    loginWithEmail();
  } else if (mode === "mobile") {
    loginWithMobile();
  }
}
```

Иногда приложение может поддерживать другие методы аутентификации и авторизации, например, в дополнение к электронной почте, страница авторизации `Medium` поддерживает сторонних провайдеров аутентификации, таких как `Google`, `Facebook`, `Apple` и `Twitter`.

<img src="https://habrastorage.org/webt/5i/dn/70/5idn70n1ufkaadqae1ive5ofcrk.jpeg" />
<br />

Для поддержки новых методов нам потребуется снова и снова изменять и дополнять функцию `login`:

```javascript
function login(mode) {
  if (mode === "account") {
    loginWithPassword();
  } else if (mode === "email") {
    loginWithEmail();
  } else if (mode === "mobile") {
    loginWithMobile();
  } else if (mode === "google") {
    loginWithGoogle();
  } else if (mode === "facebook") {
    loginWithFacebook();
  } else if (mode === "apple") {
    loginWithApple();
  } else if (mode === "twitter") {
    loginWithTwitter();
  }
}
```

Со временем обнаружится, что эту функцию все труднее поддерживать. Для решения данной проблемы можно применить паттерн "Стратегия", позволяющий инкапсулировать различные методы авторизации в разных стратегиях.

Для того, чтобы лучше понять приведенный ниже код взгляните на следующую диаграмму:

<img src="https://habrastorage.org/webt/xl/ji/z2/xljiz2tfletubn3dmm22r7bbg38.jpeg" />
<br />

Сначала мы определяем интерфейс `Strategy`. Затем на основе этого интерфейса реализуем две стратегии авторизации - через **Twitter** и **логин/пароль**.

**Интерфейс `Strategy`**

```ts
interface Strategy {
  authenticate(args: any[]): boolean;
}
```

**Класс `TwitterStrategy`**

```ts
class TwitterStrategy implements Strategy {
  authenticate(args: any[]) {
    const [token] = args;

    if (token !== "tw123") {
      console.error("Аутентификация с помощью аккаунта Twitter провалилась!");
      return false;
    }

    console.log("Аутентификация с помощью аккаунта Twitter выполнена успешно!");

    return true;
  }
}
```

**Класс `LocalStrategy`**

```ts
class LocalStrategy implements Strategy {
  authenticate(args: any[]) {
    const [username, password] = args;

    if (username !== "bytefer" && password !== "666") {
      console.log("Неправильное имя пользователя или пароль!");
      return false;
    }

    console.log("Аутентификация с помощью логина и пароля выполнена успешно!");
    return true;
  }
}
```

После описания различных стратегий авторизации, можно определить класс для переключения между стратегиями и выполнения соответствующих операций:

**Класс `Authenticator`**

```ts
class Authenticator {
  strategies: Record<string, Strategy> = {};

  use(name: string, strategy: Strategy) {
    this.strategies[name] = strategy;
  }

  authenticate(name: string, ...args: any) {
    if (!this.strategies[name]) {
      console.error("Политика аутентификации не установлена!");
      return false;
    }

    return this.strategies[name].authenticate.apply(null, args);
  }
}
```

Пример того, как это работает:

```ts
const auth = new Authenticator();

auth.use("twitter", new TwitterStrategy());

auth.use("local", new LocalStrategy());

function login(mode: string, ...args: any) {
  return auth.authenticate(mode, args);
}

login("twitter", "123");

login("local", "bytefer", "666");
```

Результат запуска приведенного кода выглядит следующим образом:

<img src="https://habrastorage.org/webt/m_/4e/gl/m_4egl8wkvmis_93l4sbyku8liq.jpeg" />
<br />

Кроме аутентификации и авторизации паттерн "Стратегия" можно использовать для валидации формы, а также для оптимизации большого количества ветвей `if else`.

Если вы используете `Node.js` для разработки сервиса аутентификации, обратите внимание на модуль [passport.js](https://www.passportjs.org/):

В настоящее время данный модуль поддерживает `538` стратегий аутентификации:

<img src="https://habrastorage.org/webt/8k/ru/5h/8kru5hbctypfor2rynkcjthu1pe.jpeg" />
<br />

Случаи использования паттерна "Стратегия":

- когда необходим динамический выбор одного из нескольких доступных алгоритмов. Как правило, каждый алгоритм инкапсулируется в отдельной стратегии (классе);
- когда имеется несколько классов, которые отличаются только поведением, и выбор конкретного поведения можно произвести динамически во время выполнения кода.

## Цепочка обязанностей / Chain of Responsibility

Паттерн "Цепочка обязанностей" (далее также - "Цепочка") позволяет избежать тесной связи и взаимного влияния между отправителем и получателем запроса, предоставляя нескольким объектам возможность последовательно обрабатывать запрос. В рассматриваемом паттерне многочисленные объекты ссылаются друг на друга, формируя цепочку объектов. Запрос передаются по цепочке до тех пор, пока один из объектов не осуществит его окончательную обработку.

<img src="https://habrastorage.org/webt/vk/bz/km/vkbzkmmfestiqv7xw8rundm0pmy.jpeg" />
<br />

Возьмем, к примеру, процедуру согласования отпуска в нашей компании: когда мне нужен выходной, я обращаюсь только к тимлиду, такой запрос не требуется передавать его вышестоящему руководителю и директору. Разные должности в компании предполагают разные обязанности и полномочия. Если звено в цепочке не может обработать текущий запрос и имеется следующее звено, запрос будет перенаправлен в это звено для дальнейшей обработки.

При разработке программного обеспечения распространенным сценарием применения "Цепочки" является посредник (промежуточное ПО, middleware).

Для того, чтобы лучше понять приведенный ниже код, взгляните на следующую диаграмму:

<img src="https://habrastorage.org/webt/fh/vj/8n/fhvj8nptqsas6sshd9fgrfhh_zo.jpeg" />
<br />

Мы определяем интерфейс `Handler`. Данный интерфейс, в свою очередь, определяет следующие методы:

- **use(h: Handler): Handler** - для регистрации обработчика (посредника);
- **get(url: string, callback: (data: any) => void): void** - для вызова обработчика.

**Интерфейс `Handler`**

```ts
interface Handler {
  use(h: Handler): Handler;

  get(url: string, callback: (data: any) => void): void;
}
```

Далее определяется абстрактный класс `AbstractHandler`, который инкапсулирует логику обработки запроса. Этот класс соединяет обработчики в цепочку последовательных ссылок:

**Абстрактный класс `AbstractHandler`**

```ts
abstract class AbstractHandler implements Handler {
  next!: Handler;

  use(h: Handler) {
    this.next = h;
    return this.next;
  }

  get(url: string, callback: (data: any) => void) {
    if (this.next) {
      return this.next.get(url, callback);
    }
  }
}
```

На основе `AbstractHandler` определяются классы `AuthMiddleware` и `LoggerMiddleware`. Посредник `AuthMiddleware` используется для обработки аутентификации пользователей, а посредник `LoggerMidddleware` - для вывода информации о запросе:

**Класс `AuthMiddleware`**

```ts
class AuthMiddleware extends AbstractHandler {
  isAuthenticated: boolean;

  constructor(username: string, password: string) {
    super();

    this.isAuthenticated = false;

    if (username === "bytefer" && password === "666") {
      this.isAuthenticated = true;
    }
  }

  get(url: string, callback: (data: any) => void) {
    if (this.isAuthenticated) {
      return super.get(url, callback);
    } else {
      throw new Error("Не авторизован!");
    }
  }
}
```

**Класс `LoggerMiddleware`**

```ts
class LoggerMiddleware extends AbstractHandler {
  get(url: string, callback: (data: any) => void) {
    console.log(`Адрес запроса: ${url}.`);

    return super.get(url, callback);
  }
}
```

Определяем класс `Route` для регистрации созданных посредников:

**Класс `Route`**

```ts
class Route extends AbstractHandler {
  urlDataMap: { [key: string]: any };

  constructor() {
    super();
    this.urlDataMap = {
      "/api/todos": [
        { title: "Изучение паттернов проектирования" },
      ],
      "/api/random": () => Math.random(),
    };
  }

 get(url: string, callback: (data: any) => void) {
  super.get(url, callback);

  if (this.urlDataMap.hasOwnProperty(url)) {
      const value = this.urlDataMap[url];
      const result = typeof value === "function" ? value() : value;
      callback(result);
    }
  }
}
```

Пример регистрации посредников с помощью `Route`:

```ts
const route = new Route();

route.use(new AuthMiddleware("bytefer", "666"))
 .use(new LoggerMiddleware());

route.get("/api/todos", (data) => {
  console.log(JSON.stringify(data, null, 2));
});

route.get("/api/random", (data) => {
  console.log(data);
});
```

<img src="https://habrastorage.org/webt/jh/bn/tk/jhbntkc-dfap_sbcm1q-d033ur4.jpeg" />
<br />

Результат выполнения приведенного кода выглядит следующим образом:

<img src="https://habrastorage.org/webt/82/9m/hv/829mhvejtqvbzacnzkxnaybg4-k.jpeg" />
<br />

Случаи использования паттерна "Цепочка обязанностей":

- когда необходимо отправить запрос одному из нескольких объектов без явного указания получателя;
- когда существует несколько объектов для обработки запроса, и выбор конкретного объекта для окончательной обработки запроса можно произвести динамически во время выполнения кода.

## Наблюдатель / Observer

Паттерн "Наблюдатель" широко используется в веб-приложениях - `MutationObserver`, `IntersectionObserver`, `PerformanceObserver`, `ResizeObserver`, `ReportingObserver`. Все эти `API` можно рассматривать как примеры применения "Наблюдателя". Кроме того, данный паттерн также используется для перманентного мониторинга событий и реагирования на модификацию данных.

В "Наблюдателе" существует две основные роли: **Субъект/Subject** и **Наблюдатель/Observer**.

Паттерн "Наблюдатель" определяет отношение **один ко многим** (one-to-many), позволяя нескольким объектам-наблюдателям одновременно следить за наблюдаемым субъектом. При изменении состояния наблюдаемого субъекта об этом уведомляются все объекты-наблюдатели, чтобы они, в свою очередь, могли обновить собственное состояние.

<img src="https://habrastorage.org/webt/py/5b/xo/py5bxouqh6rag1mj6vqvu5yvdwk.jpeg" />
<br />

На приведенной диаграмме в качестве Субъекта выступает моя статья (`Article`), а Наблюдателями являются `Chris1993` и `Bytefish`. "Наблюдатель" поддерживает простую связь в режиме широковещательной передачи (broadcast), поэтому все наблюдатели автоматически уведомляются о публикации новой статьи.

Для того, чтобы лучше понять приведенный ниже код, взгляните на следующую диаграмму:

<img src="https://habrastorage.org/webt/mt/lu/2h/mtlu2h1zxdwnoeucdj_rdno0na4.jpeg" />
<br />

Мы определяем интерфейсы `Observer` и `Subject`, которые используются для описания соответствующих объектов:

**Интерфейс `Observer`**

```ts
interface Observer {
  notify(article: Article): void;
}
```

**Интерфейс `Subject`**

```ts
interface Subject {
  observers: Observer[];

  addObserver(observer: Observer): void;

  deleteObserver(observer: Observer): void;

  notifyObservers(article: Article): void;
}
```

Затем мы определяем классы `ConcreteObserver` и `ConcreteSubject`, которые реализуют соответствующие интерфейсы:

**Класс `ConcreteObserver`**

```ts
class ConcreteObserver implements Observer {
  constructor(private name: string) {}

  notify(article: Article) {
    console.log(`"Статья: ${article.title}" была отправлена  ${this.name}.`);
  }
}
```

**Класс `ConcreteSubject`**

```ts
class ConcreteSubject implements Subject{
  public observers: Observer[] = [];

  public addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  public deleteObserver(observer: Observer): void {
    const n: number = this.observers.indexOf(observer);

    n != -1 && this.observers.splice(n, 1);
  }

  public notifyObservers(article: Article): void {
    this.observers.forEach((observer) => observer.notify(article));
  }
}
```

Проверяем работоспособность методов наших классов:

```ts
const subject: Subject = new ConcreteSubject();

const chris1993 = new ConcreteObserver("Chris1993");

const bytefish = new ConcreteObserver("Bytefish");

subject.addObserver(chris1993);
subject.addObserver(bytefish);

subject.notifyObservers({
  author: "Bytefer",
  title: "Observer Pattern in TypeScript",
  url: "https://medium.com/***",
});

subject.deleteObserver(bytefish);

subject.notifyObservers({
  author: "Bytefer",
  title: "Adapter Pattern in TypeScript",
  url: "https://medium.com/***",
});
```

Результат выполнения приведенного кода выглядит следующим образом:

```bash
"Статья: Observer Pattern in TypeScript" была отправлена Chris1993.
"Статья: Observer Pattern in TypeScript" была отправлена Bytefish.
"Статья: Adapter Pattern in TypeScript" была отправлена Chris1993.
```

Представим, что в настоящее время я пишу на две основные тематики - `JavaScript` и `TypeScript`. Поэтому, если я захочу опубликовать новую статью, то об этом необходимо уведомить только читателей, интересующихся `JavaScript`, или только читателей, интересующихся `TypeScript`. При использовании паттерна "Наблюдатель", нам придется создать два отдельных Субъекта. Однако лучшим решением будет использование паттерна "Издатель-Подписчик".

**Паттерн Издатель-Подписчик / Pub/Sub**

"Издатель-Подписчик" — это парадигма обмена сообщениями, в которой отправители сообщений (называемые издателями) не отправляют сообщения конкретным получателям (называемым подписчиками) напрямую. Вместо этого, опубликованные сообщения группируются по категориям и отправляются разным подписчикам. Подписчики могут интересоваться одной или несколькими категориями сообщений и получать только такие сообщения, не зная о существовании издателей.

В "Издателе-Подписчике" существует три основные роли: **Издатель/Publisher**, **Канал передачи сообщений/Channel** и **Подписчик/Subscriber**.

<img src="https://habrastorage.org/webt/xf/2c/cs/xf2ccs--h5zjz268wjuk6qs6kvg.jpeg" />
<br />

На приведенной диаграмме `Издатель` — это `Bytefer`, тема `A` и тема `B` в `Каналах` соответствуют `JavaScript` и `TypeScript`, а `Подписчики` — `Chris1993`, `Bytefish` и др.

Реализуем класс `EventEmitter` с помощью рассматриваемого паттерна:

```ts
type EventHandler = (...args: any[]) => any;

class EventEmitter {
  private c = new Map<string, EventHandler[]>();

  subscribe(topic: string, ...handlers: EventHandler[]) {
    let topics = this.c.get(topic);

    if (!topics) {
      this.c.set(topic, (topics = []));
    }

    topics.push(...handlers);
  }

  unsubscribe(topic: string, handler?: EventHandler): boolean {
    if (!handler) {
      return this.c.delete(topic);
    }

    const topics = this.c.get(topic);

    if (!topics) {
      return false;
    }

    const index = topics.indexOf(handler);

    if (index < 0) {
      return false;
    }

    topics.splice(index, 1);

    if (topics.length === 0) {
      this.c.delete(topic);
    }

    return true;
  }

  publish(topic: string, ...args: any[]): any[] | null {
    const topics = this.c.get(topic);

    if (!topics) {
      return null;
    }

    return topics.map((handler) => {
      try {
        return handler(...args);
      } catch (e) {
        console.error(e);
        return null;
      }
    });
  }
}
```

Пример использования `EventEmitter`:

```ts
const eventEmitter = new EventEmitter();

eventEmitter.subscribe("ts",
  (msg) => console.log(`Получено：${msg}`));

eventEmitter.publish("ts", `Паттерн "Наблюдатель"`);

eventEmitter.unsubscribe("ts");

eventEmitter.publish("ts", `Паттерн "Издатель/Подписчик"`);
```

Результат выполнения приведенного кода: `Получено: Паттерн "Наблюдатель"`.

В событийно-ориентированной архитектуре паттерн "Издатель-Подписчик" играет важную роль. Конкретная реализация данного паттерна может использоваться в качестве шины событий (Event Hub) для реализации обмена сообщениями между различными компонентами или модулями одной системы.

## Шаблон / Template

`CSV` (comma separated values - значения, разделенные запятыми) — это относительно простой формат хранения данных. Файлы `CSV` содержат табличные данные в виде обычного текста. Процесс обработки данных в формате `CSV` выглядит следующим образом:

<img src="https://habrastorage.org/webt/dd/w0/ma/ddw0ma8q7glkprecdmt6alrq8u0.jpeg" />
<br />

Реализуем функцию разбора (парсинга - parse) `CSV-файлов` в `Node.js`.

**users.csv**

```csv
id,Name
1,Bytefer
2,Kakuqo
```

**parse-csv.ts**

```ts
import fs from "fs";
import path from "path";
import * as url from "url";
import { csvParse } from "d3-dsv";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const processData = (fileData: any[]) => console.dir(fileData);

const content = fs.readFileSync(path.join(__dirname, "users.csv"), "utf8");

const fileData = csvParse(content);

processData(fileData);
```

В приведенном примере для парсинга `CSV` используется модуль [d3-dsv](https://www.npmjs.com/package/d3-dsv).

Для обработки `parse-cvs.ts` воспользуемся инструментом командной строки [esno](https://www.npmjs.com/package/esno):

```
$ npx esno parse-csv.ts
```

Результат выполнения данной команды будет выглядеть следующим образом:

```js
[
  { id: '1', Name: 'Bytefer' },
  { id: '2', Name: 'Kakuqo' },
  columns: [ 'id', 'Name' ]
]
```

`Markdown` — это язык разметки, который позволяет создавать документы в простом текстовом формате, который легко писать и читать. Но для того, чтобы отобразить документ `MD` на веб-странице, его необходимо преобразовать в `HTML-документ`.

Процесс преобразования `MD` в `HTML` может выглядеть следующим образом:

<img src="https://habrastorage.org/webt/2m/uw/ao/2muwaoet0dkqoli6ydh-ne2sohi.jpeg" />
<br />

Реализуем соответствующую функцию.

**Users.md**

```md
### Users
- Bytefer
- Kakuqo
```

**parse-md.ts**

```ts
import fs from "fs";
import path from "path";
import * as url from "url";
import { marked } from 'marked';

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const processData = (fileData: any[]) => console.dir(fileData);

const content = fs.readFileSync(path.join(__dirname, "Users.md"), "utf8");

const fileData = marked.parse(content);

processData(fileData);
```

В приведенном примере для парсинга `MD` используется модуль [marked](https://www.npmjs.com/package/marked).

Обрабатываем `parse-md.ts` с помощью `esno`:

```
$ npx esno parse-md.ts
```

Результат:

```js
'<h3 id="users">Users</h3>\n<ul>\n<li>Bytefer</li>\n<li>Kakuqo</li>\n</ul>\n'
```

Несмотря на разные типы данных, анализируемых в рассмотренных примерах, сам процесс анализа идентичен:

<img src="https://habrastorage.org/webt/md/dq/tn/mddqtnxkdoeejvvg87buhzs_f34.jpeg" />
<br />

Он состоит из трех основных этапов:

1. Чтение файла.
2. Парсинг файла.
3. Обработка данных.

Мы можем инкапсулировать данный процесс с помощью паттерна "Шаблон" (Шаблонный метод).

"Шаблон" состоит из двух основных частей: **абстрактного родительского класса** и **конкретного подкласса реализации**. Обычно, структура алгоритма подкласса инкапсулируется в абстрактном родительском классе, который также включает в себя реализацию некоторых общедоступных методов и порядок их выполнения. Наследуя от этого абстрактного класса, подклассы получают готовую структуру алгоритма и могут переопределять родительские методы.

Реализуем анализатор `CSV` и `MD` с помощью паттерна "Шаблон".

Для того, чтобы лучше понять приведенный ниже код, взгляните на следующую диаграмму, описывающую взаимосвязи между классами:

<img src="https://habrastorage.org/webt/ic/nq/a6/icnqa66yma3ztfmo9_tjo1n_-r8.jpeg" />
<br />

Сначала мы определяем абстрактный класс `FileParser`, затем - два подкласса реализации: `CsvParser` и `MarkdownParser`.

**Класс `FileParser`**

```ts
abstract class FileParser {
  // Шаблонный метод
  parse(filePath: string) {
    const content = this.readFile(filePath);

    const fileData = this.parseFile(content);

    this.processData(fileData);
  }

  readFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }

  abstract parseFile(fileContent: string): any;

  processData(fileData: any[]) {
    console.log(fileData);
  }
}
```

Метод `parse` - это шаблонный метод, инкапсулирующий процесс обработки файла.

**Класс `CsvParser`**

```ts
class CsvParser extends FileParser {
  parseFile(fileContent: string) {
    return csvParse(fileContent);
  }
}
```

**Класс `MarkdownParser`**

```ts
class MarkdownParser extends FileParser {
  parseFile(fileContent: string) {
    return marked.parse(fileContent);
  }
}
```

Пример использования классов `CsvParser` и `MarkdownParser`:

```ts
const csvParser = new CsvParser();
const mdParser = new MarkdownParser();

csvParser.parse(path.join(__dirname, "Users.csv"));
mdParser.parse(path.join(__dirname, "Users.md"));
```

Результат выполнения приведенного кода:

<img src="https://habrastorage.org/webt/3w/i7/5t/3wi75tyyqmfgwbwnxzpgineaieo.jpeg" />
<br />

Таким образом, "Шаблон" позволяет повторно использовать большую часть кода для реализации парсеров `CSV-` и `MD-файлов`. С помощью `FileParser` можно легко разработать новые парсеры для других типов данных.

Итак, паттерн "Шаблон" хорошо подходит для случая, когда общие шаги алгоритма идентичны, но некоторые части различаются по своей внутренней реализации, позволяя абстрагировать такие части с помощью отдельных подклассов.

## Адаптер / Adapter

Модуль [nodemailer](https://github.com/nodemailer/nodemailer) позволяет легко реализовать функцию отправки электронных писем в `Node.js`. После установки данного модуля для отправки email достаточно выполнить следующий код:

```js
const transporter = nodemailer.createTransport(transport[, defaults]);
transporter.sendMail(data[, callback])

```

Во избежание привязки сервиса электронной почты к конкретному провайдеру, определим следующий интерфейс:

```ts
interface EmailProvider {
  sendMail(options: EmailOptions): Promise<EmailResponse>;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

interface EmailResponse {}
```

С помощью этого интерфейса можно легко создавать новые почтовые сервисы:

```ts
class EmailService {
  constructor(public emailProvider: EmailProvider) {}

  async sendMail(options: EmailOptions): Promise<EmailResponse> {
    const result = await this.emailProvider.sendMail(options);

    return result;
  }
}
```

Во многих случаях этого будет достаточно. Однако может потребоваться поддержка поставщика облачных услуг электронной почты, например, **sendgrid** или **mailersend**. В их `SDK` можно найти метод для отправки email - `send`.

Определяем интерфейс `CloudEmailProvider`:

```ts
interface CloudEmailProvider {
  send(options: EmailOptions): Promise<EmailResponse>;
}
```

Сравнивая этот интерфейс с `EmailProvider`, мы обнаружим следующую проблему:

<img src="https://habrastorage.org/webt/ui/3e/r0/ui3er0zcizgr3yffpxhz-by1h5g.jpeg" />
<br />

Очевидно, что использовать `EmailService` для доступа к облачным службам электронной почты невозможно из-за несовпадения названий методов. Данную проблему можно решить разными способами, одним из которых является использование паттерна "Адаптер".

Цель "Адаптера" - обеспечить совместную работу объектов с несовместимыми интерфейсами. Это как клей, объединяющий два разных предметов в единое целое. В "Адаптере" существует четыре основных роли:

- **Client(EmailService)**: объект, который будет использовать целевой интерфейс (`Target`);
- **Target(EmailProvider)**: интерфейс, ожидаемый `Client`;
- **Adapter(CloudEmailAdapter)**: приспосабливает интерфейс `Adaptee` к интерфейсу `Target`;
- **Adaptee(CloudEmailProvider)**: описывает интерфейс, который необходимо адаптировать.

Создаем класс `CloudEmailAdapter`:

```ts
class CloudEmailAdapter implements EmailProvider {
  constructor(public emailProvider: CloudEmailProvider) {}

  async sendMail(options: EmailOptions): Promise<EmailResponse> {
    const result = this.emailProvider.send(options);

    return result;
  }
}
```

Интерфейсы `EmailProvider` и `CloudEmailProvider` не совпадают по названию метода. Для решения проблемы их совместимости предназначен `CloudEmailAdapter`.

Воспользуемся модулем [@sendgrid/mail](https://www.npmjs.com/package/@sendgrid/mail) для реализации класса `SendgridEmailProvider`:

```ts
import { MailService } from "@sendgrid/mail";

class SendgridEmailProvider implements CloudEmailProvider {
  private sendgridMail: MailService;

  constructor(
    private config: {
      apiKey: string;
      from: string;
    }
  ) {
    this.sendgridMail = new MailService();
    this.sendgridMail.setApiKey(this.config.apiKey);
  }

  async send(options: EmailOptions): Promise<EmailResponse> {
    const result = await this.sendgridMail.send(options);

    return result;
  }
}
```

_Обратите внимание_: приведенный код предназначен только для демонстрации и не должен использоваться в реальных проектах без необходимых доработок.

Пример совместного использования `SendgridEmailProvider` и `CloudEmailAdapter`:

```ts
const sendgridMail = new SendgridEmailProvider({
  apiKey: "******",
  from: "bytefer@gmail.com",
});

const cloudEmailAdapter = new CloudEmailAdapter(sendgridMail);

const emailService = new EmailService(cloudEmailAdapter);

emailService.sendMail({
  to: "******",
  subject: "Adapter Design Pattern",
  html: "<h3>Adapter Design Pattern</h3>",
  from: "bytefer@gmail.com",
});
```

Случаи использования паттерна "Адаптер":

- когда интерфейс существующего класса не соответствует потребностям системы, т.е. когда интерфейс этого класса по каким-либо причинам несовместим с системой;
- при использовании стороннего сервиса, интерфейс которого несовместим с нашим кодом.

## Фабрика / Factory

В паттерне "Фабрика" родительский класс (супер-класс) отвечает за определение публичного интерфейса производных объектов, а подкласс - за создание конкретных "продуктовых" объектов. Суть в том, что реализация специфических свойств продукта делегируется подклассу фабрики. Другим словами, именно в подклассе фабрики определяется, какой продукт создается.

<img src="https://habrastorage.org/webt/ox/xi/u0/oxxiu0hvu3xrayyopehpafczbta.jpeg" />
<br />

На приведенной диаграмме смоделирован процесс покупки автомобиля пользователем. `Bytefer` и `Chris1993` заказали модели `SuperX01` и `SuperX02` на фабриках `SuperX01` и `SuperX02`, соответственно. Затем фабрики произвели соответствующие модели и доставили их пользователям.

Посмотрим, как можно использовать "Фабрику" для описания процесса производства конкретной модели автомобиля на заводе.

Для того, чтобы лучше понять приведенный ниже код, взгляните на следующую диаграмму:

<img src="https://habrastorage.org/webt/rr/kj/ej/rrkjejfhnqnd_fwfxlhx57yhjdq.jpeg" />
<br />

В "Фабрике" существует четыре основные роли:

- **Product (Vehicle)**: абстрактный продукт;
- **Concrete Product (SuperX01)**: конкретный продукт;
- **Factory (VehicleFactory)**: абстрактная фабрика;
- **ConcreteFactory(SuperX01Factory)**: конкретная фабрика.

Определяем абстрактный класс `Vehicle` и два его подкласса - `SuperX01` и `SuperX02` для конкретных типов транспортных средств:

```ts
abstract class Vehicle {
  abstract run(): void;
}

class SuperX01 extends Vehicle {
  run(): void {
    console.log("SuperX01 start");
  }
}

class SuperX02 extends Vehicle {
  run(): void {
    console.log("SuperX02 start");
  }
}
```

Затем определяем класс `VehicleFactory` для представления завода по производству автомобилей. Абстрактный класс содержит абстрактный метод `produceVehicle`, который является фабричным методом:

```ts
abstract class VehicleFactory {
  abstract produceVehicle(): Vehicle;
}
```

На основе `VehicleFactory` определяются фабричные классы `SuperX01Factory` и `SuperX02Factory` для производства моделей автомобилей `SuperX01` и `SuperX02`:

```ts
class SuperX01Factory extends VehicleFactory {
  produceVehicle(): Vehicle {
    return new SuperX01();
  }
}

class SuperX02Factory extends VehicleFactory {
  produceVehicle(): Vehicle {
    return new SuperX02();
  }
}
```

Приступаем к "производству" автомобилей:

```ts
const superX01Factory = new SuperX01Factory();
const superX02Factory = new SuperX02Factory();

const superX01Vehicle = superX01Factory.produceVehicle();
const superX02Vehicle = superX02Factory.produceVehicle();

superX01Vehicle.run();
superX02Vehicle.run();
```

Результат выполнения приведенного кода выглядит следующим образом:

```bash
SuperX01 start
SuperX02 start
```

Итак, в паттерне "Фабрика" абстрактный класс предоставляет интерфейс для создания продуктов, а его подклассы определяют конкретные создаваемые объекты. С помощью объектно-ориентированного полиморфизма и принципа подстановки Лисков в процессе выполнения программы объекты подкласса переопределяют объекты родительского класса, упрощая расширение системы.

## Абстрактная фабрика / Abstract Factory

Паттерн "Абстрактная фабрика" предоставляет интерфейс категории связанных или взаимозависимых объектов без определения их конкретных свойств (классов).

В паттерне "Фабрика" конкретная фабрика отвечает за производство конкретных продуктов, каждая конкретная фабрика соответствует определенному продукту, и метод каждой фабрики уникален. Как правило, в конкретной фабрике существует только один метод для создания объектов или группа перезагружаемых (overloaded) методов, но они предназначены только для этой фабрики. Однако нам может потребоваться фабрика, способная производить не один, а несколько похожих продуктов.

<img src="https://habrastorage.org/webt/bf/_a/f-/bf_af-0cps0ect7oauz-bzfjcgm.jpeg" />
<br />

На приведенном изображении смоделирован процесс покупки автомобиля пользователем. `Bytefer` заказал `SuperX01` на заводе `SuperX`. Завод изготовил его по модели, соответствующей `SuperX01`, и доставил `Bytefer`. `Chris1993` заказал `SuperX02` на той же фабрике `SuperX`. Тот же завод изготовил его по образцу, соответствующему `SuperX02`, и доставил `Chris1993`.

Посмотрим, как использовать "Абстрактную фабрику" для описания процесса производства определенной модели автомобиля на заводе.

Для того, чтобы лучше понять приведенный ниже код, взгляните на следующую диаграмму:

<img src="https://habrastorage.org/webt/n2/33/cv/n233cvvz2fik1hdtsf3wxcahohs.jpeg" />
<br />

В "Абстрактной фабрике" существует четыре основные роли:

- **Product (Vehicle)**: абстрактный продукт;
- **Concrete Product (SuperX01)**: конкретный продукт;
- **Factory (VehicleFactory)**: абстрактная фабрика;
- **ConcreteFactory(SuperX01Factory)**: конкретная фабрика.

Определяем абстрактный класс `Vehicle` и два его подкласса - `SuperX01` и `SuperX02` для конкретных типов транспортных средств:

```ts
abstract class Vehicle {
  abstract run(): void;
}

class SuperX01 extends Vehicle {
  run(): void {
    console.log("SuperX01 start");
  }
}

class SuperX02 extends Vehicle {
  run(): void {
    console.log("SuperX02 start");
  }
}
```

Далее определяем класс `SuperXFactory` для представления фабрики по производству автомобилей. Эта абстрактная фабрика содержит абстрактные методы для производства моделей автомобилей `SuperX01` и `SuperX02`:

```TS
abstract class SuperXFactory {
  abstract produceSuperX01(): SuperX01;

  abstract produceSuperX02(): SuperX02;
}
```

На основе `SuperXFactory` определяется "заводской" класс `ConcreteSuperXFactory` для производства моделей автомобилей `SuperX01` и `SuperX02`:

```ts
class ConcreteSuperXFactory extends SuperXFactory {
  produceSuperX01(): SuperX01 {
    return new SuperX01();
  }

  produceSuperX02(): SuperX02 {
    return new SuperX02();
  }
}
```

Запускаем "производство" транспортных средств:

```ts
const superXFactory = new ConcreteSuperXFactory();

const superX01 = superXFactory.produceSuperX01();
const superX02 = superXFactory.produceSuperX02();

superX01.run();
superX02.run();
```

Результат выполнения приведенного кода выглядит следующим образом:

```bash
SuperX01 start
SuperX02 start
```

В предыдущем разделе мы рассмотрели паттерн "Фабрика". В чем же разница между ним и "Абстрактной фабрикой"?

Основное отличие между "Абстрактной фабрикой" и просто "Фабрикой" заключается в том, что "Фабрика" нацелена на производство уникального (иерархического) продукта. "Абстрактная фабрика" должна иметь возможность производить несколько видов похожих продуктов (это требование должно учитываться уже на уровне структуры класса фабрики).

<img src="https://habrastorage.org/webt/wj/wt/2o/wjwt2ozgtic7emrud3ortgeo97o.jpeg" />
<br />

Проще говоря, когда нам требуется создавать разные типы продуктов, принадлежащих определенной категории, применение "Абстрактной фабрики" вместо обычной позволит упростить код и сделает его более эффективным.
