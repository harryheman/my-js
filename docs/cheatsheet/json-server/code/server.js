const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Добавляем дефолтных посредников (logger, static, cors и no-cache)
server.use(middlewares)

// Добавляем кастомные маршруты перед роутером JSON Server
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

// Для обработки POST, PUT и PATCH необходимо использовать body-parser
server.use(jsonServer.bodyParser)
server.use((req, _, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Передаем управление роутеру JSON Server
  next()
})

// Используем дефолтный роутер
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
