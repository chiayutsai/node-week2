const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const header = require('./header');
const Todo = require('./Models/Todo')
const {successHandle, errorHandle} = require('./handle')

dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(DB)
.then(()=>{
  console.log('資料庫連線成功')
}).catch(error=>{
  console.log(error)
})

const requestListener = async (req,res) => {
  let body = ''
  req.on('data', chunk => {
    body += chunk
  })
  if(req.url == '/posts' && req.method == 'GET'){
    const todo = await Todo.find()
    successHandle(res,todo)
  }else if(req.url == '/posts' && req.method == 'POST') {
    req.on('end', async ()=> {
      try{
        const title = JSON.parse(body).title
        const todo = await Todo.create({
          title
        })
        successHandle(res,todo)
      }catch(error){
        errorHandle(res,error,'欄位填寫錯誤')
      }
    })
  }else if(req.url == '/posts' && req.method == 'DELETE') {
    await Todo.deleteMany({})
    successHandle(res,[],'刪除全部成功')
  }else if(req.url.startsWith('/posts/') && req.method == 'DELETE') {

    try{
      const id = req.url.split('/').pop()
      const todo = await Todo.findByIdAndDelete(id)
      successHandle(res,[],'刪除成功')
    }catch(error){
      errorHandle(res,error,'查無此 id')
    }
  }else if(req.url.startsWith('/posts/') && req.method == 'PATCH') {
    req.on('end', async ()=> {
      try{
        const id = req.url.split('/').pop()
        const editTitle = JSON.parse(body).title
        if(editTitle != undefined){
          const todo = await Todo.findByIdAndUpdate(id, {title: editTitle}, {returnDocument:'after'})
          successHandle(res,todo,'更新成功')
        }else {
          throw new Error('Title 欄位為必填欄位')
        }
      }catch(error){
        errorHandle(res,error,error.message)
      }
    })
  }else if(req.method == 'OPTIONS') {
    res.writeHead(200, headers)
    res.end()
  }else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: 'false',
      message: '無此網路路由'
    }))
    res.end()
  }
}
const server = http.createServer(requestListener)
server.listen(process.env.PORT);