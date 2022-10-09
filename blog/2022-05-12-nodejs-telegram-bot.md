---
slug: nodejs-telegram-bot
title: Разрабатываем бота для Telegram на Node.js
description: Туториал по разработке простого бота для Telegram на Node.js
authors: harryheman
tags: ["node.js", nodejs, telegram, bot, tutorial, бот, туториал]
image: https://habrastorage.org/webt/cc/tl/u0/cctlu0pn6hxld1s63lnvgr7a1mq.jpeg
---

<img src="https://habrastorage.org/webt/cc/tl/u0/cctlu0pn6hxld1s63lnvgr7a1mq.jpeg" />

Привет, друзья!

В данном туториале мы разработаем простого бота для [Telegram](https://web.telegram.org/k/). Сначала зарегистрируем и кастомизируем бота с помощью _BotFather_, затем напишем для него сервер на [Express](https://expressjs.com/ru/), развернем сервер на [Heroku](https://www.heroku.com/) и подключим бота к серверу с помощью веб-хука.

Функционал бота будет следующим:

- в ответ на сообщение _joke_ возвращается программистская шутка, например: "Algorithm: a word used by programmers when they don't want to explain how their code works." (Алгоритм - это слово, используемое программистами, когда они не хотят объяснять, как работает их код));
- в ответ на сообщение, представляющее собой дату в формате _ДД.ММ_, возвращается либо список дел, запланированных на эту дату в таблице Google (массив объектов), либо фраза "You have nothing to do on this day.", если на эту дату не запланировано никаких дел;
- в ответ на любое другое сообщение возвращается фраза "I have nothing to say.".

При разработке бота я буду опираться в основном на [официальную документацию](https://core.telegram.org/bots).

- [Репозиторий с кодом сервера для бота](https://github.com/harryheman/Blog-Posts/tree/master/telegram-bot-server).
- Бот - @aio350_reminder_bot.

<!--truncate-->

## Регистрация и кастомизация бота

Для регистрации бота нужен только Telegram (я буду использовать десктопную версию). Находим в нем _BotFather_ (@BotFather):

<img src="https://habrastorage.org/webt/o3/ca/yo/o3cayo0nllqv4zon8advwgfluyi.png" />

Нажимаем на _Start_ и получаем список команд:

<img src="https://habrastorage.org/webt/ui/4n/4v/ui4n4v12uvfcov2njnx44ldt9hc.png" />

Выполняем команду _/newbot_ для создания бота, указываем имя и _username_ бота (_username_ должно быть уникальным в пределах _Telegram_), например: "Neo" и "aio350_reminder_bot".

<img src="https://habrastorage.org/webt/su/0s/mo/su0smomium-nrapuom1k-xhq7pe.png" />

Получаем токен доступа: 5372263544:...

Выполняем команду _/mybots_ для получения списка наших ботов, выбираем только что созданного бота и нажимаем _Edit Bot_:

<img src="https://habrastorage.org/webt/_y/9z/7i/_y9z7igoskdkmjdbqmuotrlifz4.png" />

Добавляем боту описание (_Edit Description_), характеристику (_Edit About_) и аватар (_Edit Botpic_):

<img src="https://habrastorage.org/webt/yh/qq/wg/yhqqwgnj5k_udyksktgspmgfhvk.png" />

Аватар (спасибо [FlatIcon](https://www.flaticon.com/)):

<img src="https://habrastorage.org/webt/lc/c3/zn/lcc3znengvta9ngykz9njbletmc.png" />

Отлично, мы зарегистрировали бота в Telegram и кастомизировали его. Поздороваемся с ним:

<img src="https://habrastorage.org/webt/ow/ee/66/owee66mhhrebmfmn47scrs6xwsg.png" />
<img src="https://habrastorage.org/webt/zf/2r/hv/zf2rhveirjlqklnn695rwdi1rke.png" />

Бот молчит, потому что у него пока нет "мозгов") Давайте это исправим.

## Разработка и деплой сервера для бота

Создаем директорию, переходим в нее и инициализируем _Node.js-проект_:

```bash
mkdir telegram-bot-server
cd telegram-bot-server

yarn init -yp
# or
npm init -y
```

Устанавливаем зависимости:

```bash
# производственные зависимости
yarn add axios dotenv express fs-extra google-spreadsheet

# зависимость для разработки
yarn add -D nodemon
```

- [axios](https://github.com/axios/axios): клиент-серверная утилита для выполнения _HTTP-запросов_;
- [dotenv](https://www.npmjs.com/package/dotenv): утилита для работы с переменными среды окружения;
- [express](https://expressjs.com/ru/): _Node.js-фреймворк_ для разработки веб-серверов;
- [fs-extra](https://www.npmjs.com/package/fs-extra): расширенный _Node.js-модуль_ [fs](https://nodejs.org/api/fs.html);
- [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet): пакет для работы с гугл-таблицами;
- [nodemon](https://www.npmjs.com/package/nodemon): утилита для запуска сервера для разработки.

Определяем тип кода сервера (модуль) и команды для запуска сервера в производственном режиме (_start_) и режиме для разработки (_dev_) в файле _package.json_:

```json
"type": "module",
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
},
```

Создаем файл _.env_ и записываем туда токен доступа:

```
TELEGRAM_API_TOKEN=5348751300:...
```

Прежде, чем приступать к разработке сервера, необходимо настроить гугл-таблицу, в которой будут храниться наши задачи.

Создаем таблицу в [Google Spreadsheets](https://docs.google.com/spreadsheets/u/0/) следующего содержания:

<img src="https://habrastorage.org/webt/mf/rr/o2/mfrro2wgxx7pvriidldozbmgrqy.png" />

Извлекаем идентификатор таблицы из адресной строки (набор символов между _d/_ и _/edit_) и записываем его в _.env_:

```
GOOGLE_SPREADSHEET_ID=1HG60...
```

Идем в [Google Cloud Platform](https://console.cloud.google.com/), переходим в раздел _IAM & Admin_ -> _Service Accounts_ и создаем сервис-аккаунт (_Create Service Account_), например: _Telegram Bot Spreadsheet_.

<img src="https://habrastorage.org/webt/bq/na/jp/bqnajplo7qmrqbewmiw9f2lhcug.png" />
<img src="https://habrastorage.org/webt/gy/pk/o-/gypko-ncrrsytolxg_uxry3srxs.png" />

Выбираем созданный сервис-аккаунт, переходим в раздел _Keys_ и генерируем ключ (_Add Key_ -> _Create new key_) в формате _JSON_:

<img src="https://habrastorage.org/webt/5p/u5/bx/5pu5bxiy_jq3dn-vg_odmeo95bs.png" />
<img src="https://habrastorage.org/webt/_q/ip/vp/_qipvp0ucvtfzeswzvxjlbhg5rc.png" />

В скачанном _JSON-файле_ нас интересуют поля _client\_email_ и _private\_key_. Записываем значения этих полей в _.env_:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=telegram-bot-spreadsheet@telegram-bot-spreadsheet.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

Переходим в раздел _APIs & Services_ -> _Enabled APIs & services_ и подключаем интерфейс таблиц с сервис-аккаунту (_Enable APIs and Services_):

<img src="https://habrastorage.org/webt/sh/np/fx/shnpfx1zt2hofo9k4n3h6mxclws.png" />
<img src="https://habrastorage.org/webt/za/pq/u3/zapqu3bjhcbhmmb7e4bgoxa-xxq.png" />

_Обратите внимание_: аналогичным образом можно настроить доступ к гугл-календарю (только для работы с ним потребуется другой пакет, например, [@googleapis/calendar](https://www.npmjs.com/package/@googleapis/calendar)).

Теперь можно вернуться к разработке сервера.

Создаем файл _index.js_ и импортируем зависимости:

```javascript
import axios from 'axios'
import { config } from 'dotenv'
import express from 'express'
import { GoogleSpreadsheet } from 'google-spreadsheet'
```

Получаем доступ к переменным среды окружения, создаем экземпляр приложения _Express_ и определяем пути к шуткам и телеграмму:

```javascript
config()
const app = express()

const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single'
const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`
```

Подключаем посредников (middleware) _Express_ и инициализируем таблицу:

```javascript
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
})
```

Определяем роут для _POST-запроса_ к _/new-message_:

```javascript
app.post('/new-message', async (req, res) => {
  // ...
})
```

Извлекаем сообщение из тела запроса и проверяем, что сообщение содержит текст и идентификатор чата:

```javascript
const { message } = req.body

const messageText = message?.text?.toLowerCase()?.trim()
const chatId = message?.chat?.id
if (!messageText || !chatId) {
  return res.sendStatus(400)
}
```

Получаем данные из таблицы и формируем данные для ответа:

```javascript
await doc.loadInfo()
const sheet = doc.sheetsByIndex[0]
const rows = await sheet.getRows()
const dataFromSpreadsheet = rows.reduce((obj, row) => {
  if (row.date) {
    const todo = { text: row.text, done: row.done }
    obj[row.date] = obj[row.date] ? [...obj[row.date], todo] : [todo]
  }
  return obj
}, {})
```

Формируем текст ответа:

```javascript
let responseText = 'I have nothing to say.'
if (messageText === 'joke') {
  try {
    const response = await axios(JOKE_API)
    responseText = response.data.joke
  } catch (e) {
    console.log(e)
    res.send(e)
  }
} else if (/\d\d\.\d\d/.test(messageText)) {
  responseText =
    dataFromSpreadsheet[messageText] || 'You have nothing to do on this day.'
}
```

И отправляет ответ:

```javascript
try {
  await axios.post(TELEGRAM_URI, {
    chat_id: chatId,
    text: responseText
  })
  res.send('Done')
} catch (e) {
  console.log(e)
  res.send(e)
}
```

Наконец, определяем порт и запускаем сервер:

```javascript
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Бот не сможет взаимодействовать с сервером, запущенным локально, поэтому сервер необходимо где-нибудь развернуть, например, на _Heroku_.

Создаем там новое приложение, например: _my-telegram-bot-server_ (название должно быть уникальным в пределах _Heroku_):

<img src="https://habrastorage.org/webt/sk/1i/k_/sk1ik_m312f0y3fi11pcuwn85cm.png" />
<img src="https://habrastorage.org/webt/i7/sm/hj/i7smhjf9qhxbsuib42czwcq_rfg.png" />

Глобально устанавливаем _Heroku CLI_ и авторизуемся:

```bash
yarn global add heroku

heroku login
# далее следуем инструкциям
```

Находясь в корневой директории проекта, выполняем инициализацию _Git-репозитория_, подключаемся к _Heroku_, добавляем и фиксируем изменения и отправляем их в _Heroku_ (не забудьте создать файл _.gitignore_ с _node\_modules_ и _.env_):

```bash
git init

# у вас название проекта будет другим
heroku git:remote -a my-telegram-bot-server

git add .
git commit -m "create app"
git push heroku master
```

После деплоя получаем _URL_ приложения, например: _https://my-telegram-bot-server.herokuapp.com/_ (он нам еще пригодится).

Открываем вкладку _Settings_ на странице приложения и добавляем переменные среды окружения в разделе _Config Vars_ (_Reveal Config Vars_):

<img src="https://habrastorage.org/webt/4b/vs/nj/4bvsnjmsbhcvkflymi9kyzus1le.png" />

Отлично, на этом с разработкой и деплоем сервера мы закончили.

Осталось подключить к нему бота.

## Подключение бота к серверу

Существует несколько способов подключения бота к серверу, но самым простым является использование веб-хука.

Открываем терминал и выполняем следующую команду:

```bash
# в строке ("url=...") указываем `URL` проекта + `/new-message`
# после `bot` указываем токен доступа из переменной `TELEGRAM_API_TOKEN`
curl -F "url=https://my-telegram-bot-server.herokuapp.com/new-message" https://api.telegram.org/bot5372263544:.../setWebhook
```

<img src="https://habrastorage.org/webt/r0/64/ew/r064ewdletkrax4g4zzlrnma4z0.png" />

Получаем сообщение об успешной установке хука.

Возвращаемся к боту.

Нажимаем _/start_, получаем от бота сообщение "I have nothing to say.". Отправляем сообщение "joke", получаем шутку. Отправляем "11.05", получаем задачи в виде массива объектов. Отправляем "12.05", получаем "You have nothing to do on this day.".

<img src="https://habrastorage.org/webt/a5/oa/lr/a5oalrieet_8kcikjw9c5eceubw.png" />

_Примечание_: при разработке бота я немного опечатался (вместо "to do" написал "to to"), но уже исправился.

It's alive!)

Благодарю за внимание и happy coding!
