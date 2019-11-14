import Koa from 'koa'

const app = new Koa()

app.use((ctx) => {
  ctx.body = 'Hey'
})

app.listen(3000)
