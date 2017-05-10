/**
 * Setting up the Socket.io server
 */

let socketio = require('socket.io')
let io
let guestNumber = 1
let nickNames ={}
let nameUsed = []
let currentRoom = {}


exports.listen = (server) => {
  io = socketio.listen(server)
  io.set('log level', 1)

  io.sockets.on('connection', (socket) => {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed)
    joinRoom(socket, 'Lobby')

    handleMessageBroadcasting(socket, nickNames)
    handleNameChangeAttempts(socket, nickNames, nameUsed)
    handleRoomJoining(socket)

    socket.on('rooms', () => {
      socket.emit('rooms', io.sockets.manager.rooms)
    })

    handleClientDisconnection(socket, nickNames, nameUsed)
  })
}
/**
 * Assign a guest name
 *
 * @param {Object} socket
 * @param {Number} guestNumber
 * @param {String} nickNames
 * @param {Array} namesUsed
 * @returns {*}
 */

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  let name = 'Guest' + guestNumber
  nickNames[socket.id] = name
  socket.emit('nameResult', {
    success: true,
    name: name
  })
  namesUsed.push(name)
  return guestNumber + 1
}

/**
 * Logic related to join room
 * @param {object}socket
 * @param {string} room
 */
function joinRoom (socket, room) {
  socket.join(room)
  currentRoom[socket.id] = room
  socket.emit('joinResult', {room: room})

  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  })

  let usersInRoom = io.sockets.clients(room)
  if(usersInRoom.length > 1) {
    let usersInRoomSummary = 'Users currently in ' + room + ': '
    for(let index of usersInRoom) {
      let userSocketId = usersInRoom[index].id
      if(userSocketId !== socket.id){
        if (index > 0){
          usersInRoomSummary += ', '
        }
        usersInRoomSummary += nickNames[userSocketId]
      }
    }
    usersInRoomSummary += '.'
    socket.emit('message', {text: usersInRoomSummary})
  }
}
/**
 * Change
 * @param socket
 * @param nickNames
 * @param nameUsed
 */
function handleNameChangeAttempts (socket, nickNames, nameUsed) {
  socket.on('nameAttempt', (name) => {
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Name cannot begin with "Guest".'
      })
    } else {
      if (nameUsed.indexOf(name) === -1) {
        let previousName = nickNames[socket.id]
        let previousNameIndex = nameUsed.indexOf(previousName)
        nameUsed.push(name)
        nickNames[socket.id] = name
        delete nameUsed[previousNameIndex]
        socket.emit('nameResult', {
          success: true,
          name: name
        })

        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        })
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use'
        })
      }
    }
  })
}

/**
 * Sending chat message, relays the message to all other users in the same room
 * @param {object} socket
 */
function handleMessageBroadcasting (socket) {
  socket.on('message', (message) => {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    })
  })
}
/**
 * Handle the user join the room, id room is not exist, create a new room
 * @param socket
 */
function handleRoomJoining (socket) {
  socket.on('join', (room) => {
    socket.leave(currentRoom[socket.id])
    joinRoom(socket, room.newRoom)
  })
}
/**
 * Handle the event which user leaves
 * @param socket
 */
function handleClientDisconnection (socket) {
  socket.on('disconnect', () => {
    let nameIndex = nameUsed.indexOf(nickNames[socket.id])
    delete nameUsed[nameIndex]
    delete nickNames[socket.id]
  })
}
