let http = require('http')
let fs = require('fs')
let path = require('path')
let mime = require('mime')
let cache = {}


/**
 * When file not found, will sending 404 errors
 *
 * @param response
 * @public
 */


function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'})
  response.write('Error 404: resource, not found')
  response.end()
}
/***
 * Send HTTP headers and then sends the contents of the file
 *
 * @param response
 * @param filePath
 * @param fileContents
 */

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents)
}

/***
 * If file in cache, just send it out, otherwise read it from disk(static file only)
 *
 * @param response
 * @param cache
 * @param absPath
 */
function serverStatic(response, cache, absPath) {
  if(cache[absPath]){
    sendFile(response, absPath, cache[absPath])
  } else {
    fs.exists(absPath, (exists) => {
      if(exists) {
        fs.readFile(absPath, (err, data) => {
          if (err) {
            send404(response)
          } else {
            cache[absPath] = data
            sendFile(response, absPath, data)
          }
        })
      } else {
        send404(response)
      }
    })
  }
}
/**
 * */
let server = http.createServer((request, response) => {
  let filePath = false
  if(request.url === '/') {
    filePath = 'public/index.html'
  } else {
    filePath = 'public' + request.url
  }
  let absPath = './' + filePath
  serverStatic(response, cache, absPath)
})

server.listen(3000, () => {
  console.log('Server listening on port 3000.')
})

let chatServer = require('./lib/chat_server')
chatServer.listen(server)
