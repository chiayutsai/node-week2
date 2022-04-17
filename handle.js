const header = require('./header');

const successHandle = (res,data,message)=> {
  res.writeHead(200,header)
  res.write(JSON.stringify({
    status:'success',
    data,
    message
  }))
  res.end()
}

const errorHandle = (res,error,message) => {
  res.writeHead(400,header)
  res.write(JSON.stringify({
    status:'false',
    error,
    message
  }))
  res.end()
}

module.exports = {successHandle, errorHandle}