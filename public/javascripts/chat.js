/**
 * Created by AlnordWang on 2017/5/6.
 */

class Chat{
    constructor(socket){
        this.socket = socket
    }

    /**
     *
     * @param {String} room
     * @param {String} text
     */
    sendMessage(room, text) {
        let message = {room: room, text: text}
        this.socket.emit('message', message)
    }

    /**
     *
     * @param room
     */
    changeRoom(room) {
        this.socket.emit('join', {
            newroom: room
        })
    }

  /**
   * Handle chat command
   *
   * @param command
   * @returns {boolean}
   */
    processCommand(command) {
        let words = command.split(' ')
        command = words[0].substring(1, words[0].length).toLowerCase()
        let message = false

        switch(command) {
            case 'join': {
                words.shift()
                let room = words.join(' ')
                this.changeRoom(room)
                break
            }

            case 'nick': {
                words.shift()
                let name = words.join(' ')
                this.socket.emit('nameAttempt', name)
                break
            }

            default:
                message = 'Unrecongnize command.'
                break
        }
        return message
    }
}
