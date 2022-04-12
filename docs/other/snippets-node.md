# `Node.js Snippets` :metal:

[На главную](../README.md)

### Содержание

- [Модуль `http`](#модуль-http)
- [Модуль `fs`](#модуль-fs)
- [Безопасное создание, чтение и удаление файла](#безопасное-создание-чтение-и-удаление-файла)
- [Проверка среды выполнения кода](#проверка-среды-выполнения-кода)
- [Создание хеша](#создание-хеша)
- [Генерация UUID](#генерация-uuid)
- [Преобразование строки в `base64` и обратно](#преобразование-строки-в-base64-и-обратно)
- [Промисификация](#промисификация)

## Модуль `http`

```js
// Простой сервер
import http from 'http'

const server = http.createServer((req, res) => {
  // write status and headers
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  // send plain text
  res.write('hi\n')

  // some json
  const json = {
    message: 'bye'
  }
  // send json
  res.end(JSON.stringify(json))
})

server.listen(
  3000,
  /* host - localhost or 127.0.0.1 by default */
  (e) => {
    if (e) {
      console.error(e)
    }
    console.log('🚀')
  }
)


// Ответ сервера в виде HTML-файла
const filePath = `${__dirname}/index.html`

const server = http.createServer(async (req, res) => {
  if (req.url === '/hi') {
    res.writeHead(200, { 'Content-Type': 'text/html' })

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return res.end(content)
    } catch (e) {
      console.error(e)
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write('bye')
  res.end()
})


// Ответ сервера в виде аудио-файла
import { promises as fs, constants, createReadStream } from 'fs'

// path to audio
const filePath = `${__dirname}/audio.mp3`

const server = http.createServer(async (req, res) => {
  switch (req.url) {
    case '/': {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.write('hi')
      return res.end()
    }
    case '/audio': {
      try {
        res.writeHead(200, { 'Content-Type': 'audio/mp3' })
        // check if file exists
        await fs.access(filePath, constants.F_OK)
        // create read stream
        const stream = createReadStream(filePath)
        // create pipe
        return stream.pipe(res)
      } catch (e) {
        res.end('not found')
      }
    }
  }
})
```

## Модуль `fs`

```js
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'

// absolute path to current working directory
const __dirname = dirname(fileURLToPath(import.meta.url))

// with `join()`
const dirPath = join(__dirname, 'files')
// without `join()`
const filePath = `${dirPath}/message.txt`

const content = 'hi'

// create
try {
  // create dir
  await fs.mkdir(dirPath, { recursive: true })
  // create file
  await fs.writeFile(filePath, content)
  console.log('created')
} catch (e) {
  console.error(e)
}

// read
try {
  const content = await fs.readFile(filePath, 'utf-8')
  console.log(content) // hi
} catch (e) {
  console.error(e)
}

// append
try {
  await fs.appendFile(filePath, '\nbye')
  const content = await fs.readFile(filePath, 'utf-8')
  console.log(content) // hi \nbye
} catch (e) {
  console.error(e)
}

// remove
try {
  // remove file
  await fs.unlink(filePath)
  // remove dir
  await fs.rmdir(dirPath)
} catch (e) {
  console.error(e)
}
```

## Безопасное создание, чтение и удаление файла

```js
// root path
const ROOT_PATH = `${__dirname}/files`
// check if dir or file not exists
const notExist = (e) => e.code === 'ENOENT'
// truncate path
const truncPath = (p) => p.split('/').slice(0, -1).join('/')

// create
async function createFile(fileData, filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  try {
    // create file
    await fs.writeFile(fileName, JSON.stringify(fileData, null, 2))
  } catch (e) {
    if (notExist(e)) {
      // create dir
      await fs.mkdir(truncPath(`${ROOT_PATH}/${filePath}`), {
        recursive: true
      })
      // create file after dir has been created
      return createFile(fileData, filePath, fileExt)
    }
    console.error(e)
  }
}

// read
async function readFile(filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  let fileHandler = null
  try {
    // open file
    fileHandler = await fs.open(fileName)
    // read file
    return await fileHandler.readFile('utf-8')
  } catch (e) {
    if (notExist(e)) {
      return console.error('not found')
    }
    console.error(e)
  } finally {
    // close handler
    fileHandler?.close()
  }
}

// remove
async function removeFile(filePath, fileExt = 'json') {
  const fileName = `${ROOT_PATH}/${filePath}.${fileExt}`

  try {
    // remove file
    await fs.unlink(fileName)
    // remove dir
    await removeDir(truncPath(`${ROOT_PATH}/${filePath}`))
  } catch (e) {
    if (notExist(e)) {
      return console.error('not found')
    }
    console.error(e)
  }
}

// remove dir
async function removeDir(dirPath, rootPath = ROOT_PATH) {
  if (dirPath === rootPath) return

  const isEmpty = (await fs.readdir(dirPath)).length < 1

  if (isEmpty) {
    // remove dir if its empty
    await fs.rmdir(dirPath)
    // remove parent dir
    removeDir(truncPath(dirPath), rootPath)
  }
}

// get all file names
async function getFileNames(path = ROOT_PATH) {
  let fileNames = []

  try {
    const files = await fs.readdir(path)

    if (files.length < 1) return fileNames

    for (let file of files) {
      file = `${path}/${file}`

      const isDir = (await fs.stat(file)).isDirectory()

      if (isDir) {
        fileNames = fileNames.concat(await getFileNames(file))
      } else {
        fileNames.push(file)
      }
    }

    return fileNames
  } catch (e) {
    if (notExist(e)) {
      return console.error('not found')
    }
    console.error(e)
  }
}
```

## Проверка среды выполнения кода

```js
const isBrowser = () => ![typeof window, typeof document].includes('undefined')

const isNode = () =>
  typeof process !== 'undefined' &&
  !!process.versions &&
  !!process.versions.node
```

## Создание хеша

```js
import crypto from 'crypto'

const createHash = (val) =>
  crypto.createHash('sha256').update(val).digest('hex')

const hash = createHash('hi')
console.log(hash)
// 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
```

## Генерация UUID

```js
const genUUID = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  )

console.log(genUUID())
// 3b472cc4-8370-4469-8c12-428e7da35063
```

## Преобразование строки в `base64` и обратно

```js
const btoa = (str) => Buffer.from(str, 'binary').toString('base64')

console.log(btoa('hi')) // aGk=

const atob = (str) => Buffer.from(str, 'base64').toString('binary')

console.log(atob('Ynll')) // bye
```

## `multer`

```js
import multer from 'multer'

const dirPath = `${__dirname}/files`

const uploadFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dirPath)
    },
    filename: (_, file, cb) => {
      cb(null, file.originalname)
    }
  })
})

// usage
app.post('/upload', uploadFile.single('file'), (req, res) => {
  console.log(req.files)
})
```

## `nodemailer` + `google-spreadsheet`

```js
import nodemailer from 'nodemailer'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID)

const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
})

const createMessage = (username, email) => `
  <h1>${username}</h1>
  <p>${email}</p>
`

async function sendMail() {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })

    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0]

    const rows = await sheet.getRows()

    for (const row of rows) {
      await gmailTransporter.sendMail({
        from: 'App name <example.com>',
        to: row.email,
        subject: 'Title',
        text: 'Text fallback',
        html: createMessage(row.username, row.email)
      })
    }
    console.log('All emails has been sent')
  } catch (e) {
    console.error(e)
  }
}
```