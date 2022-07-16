import app from './app'

const port = process.env.PORT

app.listen(port, async () => {
  console.log(`server is listening on ${port}`)
})
