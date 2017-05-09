/**
 * Created by AlnordWang on 2017/5/9.
 */
let http = require('http')
let fs = require('fs')

/*http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('./titles.json', (err, data) => {
      if (err) {
        console.log(err)
        res.end('Server Error')
      } else {
        let titles = JSON.parse(data.toString())

        fs.readFile('./template.html', (err, data) => {
          if (err) {
            console.error(err)
            res.end('Server Error')
          } else {
            let tmpl = data.toString()
            let html = tmpl.replace('%', titles.join('</li><li>'))
            res.writeHead(200, {'Content-Type' : 'text/html'})
            res.end(html)
          }
        })
      }
    })
  }
}).listen(8000, '127.0.0.1')
 */

let server = http.createServer((req, res) => {
  getTitles(res)
}).listen(8000, '127.0.0.1')

function getTitles(res) {
  fs.readFile('./title.json', (err, data) => {
    if (err) {
      hadError(err, res)
    } else {
      getTemplate(JSON.parse(data.toString()), res)
    }
  })
}

function getTemplate (titles, res) {
  fs.readFile('./template.html', (err, data) => {
    if(err) {
      hadError(err, data)
    } else {
      formatHtml(titles, data.toString(), res)
    }
  })
}

function formatHtml(titles, tmpl, res) {
  let html = tmpl.replace('%', titles.join('<li></li>'))
  res.writeHead(200, {'Content-Type' : 'text/html'})
  res.end(html)
}

function hadError(err, res) {
  console.log(err)
  res.end('Server Error')
}