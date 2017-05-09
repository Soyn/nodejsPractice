/**
 * Created by AlnordWang on 2017/5/9.
 */
let net = require('net')

let server = net.createServer((socket) => {
  socket.on('data', (data) => {
    socket.write(data)
  })
}).listen(8888)
