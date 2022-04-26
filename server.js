const http = require('http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const headers = require('./header')
const Post = require('./Models/Post')
const { successHandle, errorHandle } = require('./handle')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose
  .connect(DB)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log(error)
  })

const requestListener = async (req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  if (req.url == '/posts' && req.method == 'GET') {
    const post = await Post.find()
    successHandle(res, post)
  } else if (req.url == '/posts' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const post = await Post.create({
          name: data.name,
          content: data.content,
          image: data.image,
          createdAt: data.createdAt,
          likes: data.likes,
        })
        successHandle(res, post)
      } catch (error) {
        errorHandle(res, error, '欄位填寫錯誤')
      }
    })
  } else if (req.url == '/posts' && req.method == 'DELETE') {
    await Post.deleteMany({})
    successHandle(res, [], '刪除全部成功')
  } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
    try {
      const id = req.url.split('/').pop()
      const post = await Post.findByIdAndDelete(id)
      if (post) {
        successHandle(res, post, '刪除成功')
      } else {
        throw new Error()
      }
    } catch (error) {
      errorHandle(res, error, '查無此 id')
    }
  } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop()
        const data = JSON.parse(body)
        const post = await Post.findByIdAndUpdate(
          id,
          { name: data.name, content: data.content, image: data.image, createdAt: data.createdAt, likes: data.likes },
          { returnDocument: 'after' }
        )
        if (post) {
          successHandle(res, post, '更新成功')
        } else {
          throw new Error('無此ID或欄位填寫錯誤')
        }
      } catch (error) {
        errorHandle(res, error, error.message)
      }
    })
  } else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網路路由',
      })
    )
    res.end()
  }
}
const server = http.createServer(requestListener)
server.listen(process.env.PORT)
