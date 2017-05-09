/**
 * Created by AlnordWang on 2017/5/9.
 */

function Watcher (watchDir, processedDir) {
  this.watchDir = watchDir
  this.processDir = processedDir
}

let events = require('events')
    , util = require('util')

; util.inherits(Watcher, events.EventEmitter)

let fs = require('fs')
  , watchDir = './watch'
  , processDir = './done'

Watcher.prototype.watch = () => {
  let watcher = this
  fs.readdir(this.watchDir, (err, files) => {
    if (err) throw err
    for(let index in files) {
      watcher.emit('process', files[index])
    }
  })
}

Watcher.prototype.start = () => {
  let watcher = this;
  fs.watchFile(watchDir, () => {
    watcher.watch()
  })
}

let watcher = new Watcher(watchDir, processDir)

watcher.on('process', (file) => {
  let watchFile = this.watchDir + '/' + file
  let processedFile = this.processDir + '/' + file.toLowerCase()

  fs.rename(watchFile, processedFile, (err) => {
    if(err) {
      throw err
    }
  })
})

watcher.start()