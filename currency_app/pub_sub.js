/**
 * Created by AlnordWang on 2017/5/9.
 */
let events = require('events')
let net = require('net')
let channel = new events.EventEmitter();

channel.clients = {}
channel.subscriptions = {}

channel.on('join', (id, client) => {
  this.clients[id] = client;
  this.subscriptions[id] = (senderId, message) => {
    if(id !== senderId) {
      this.clients[id].write(message)
    }
  }
  this.on('broadcast', this.subscriptions[id])
})

channel.on('leave', (id) => {
  channel.removeListener('broadcast', id, id + ' has left the chat.\n')
})

channel.on('shutdown', () => {
  channel.emit('broadcast', '', 'Chat has shut down.\n')
  channel.removeListener('broadcast')
})
let server = net.createServer((client) => {
  let id = client.remoteAddress + ':' + client.remotePort
  console.log(id)
  client.on('connect', () => {
    channel.emit('join', id, client)
  })

  client.on('data', (data) => {
    data = data.toString()
    if(data === 'shutdown\r\n'){
      channel.emit('shutdown')
    }
    channel.emit('broadcast', id, data)
  })

  client.on('close', () => {
    channel.emit('leave', id)
  })
})

channel.on('join', (id, client) => {
  let welcome = 'Welcome!\nGuests online: ' + this.listeners('broadcast').length
  client.write(welcome + '\n')
})
server.listen(8888)