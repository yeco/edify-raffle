/**
 * Static HTTP server that uses gzip compression
 */

var DOCUMENT_ROOT = './public'
var DIRECTORY_INDEX = '/index.html'

var port = process.env.PORT || 8080

var zlib = require('zlib')
var http = require('http')
var path = require('path')
var fs = require('fs')

var mimeTypes = {
  'html': 'text/html',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'js': 'text/javascript',
  'css': 'text/css'
}

http.createServer(function (request, response) {
  // Remove query strings from uri
  if (request.url.indexOf('?') > -1) {
    request.url = request.url.substr(0, request.url.indexOf('?'))
  }

  // Remove query strings from uri
  if (request.url == '/') {
    request.url = DIRECTORY_INDEX
  }
  var filePath = DOCUMENT_ROOT + request.url

  var extname = path.extname(filePath)
  var mimeType = mimeTypes[extname.split('.')[1]]

  var acceptEncoding = request.headers['accept-encoding']
  if (!acceptEncoding) {
    acceptEncoding = ''
  }

  fs.exists(filePath, function (exists) {
    if (exists) {
      fs.readFile(filePath, function (error, content) {
        if (error) {
          response.writeHead(500)
          response.end()
        } else {
          var raw = fs.createReadStream(filePath)
          if (acceptEncoding.match(/\bgzip\b/)) {
            response.writeHead(200, {
              'content-encoding': 'gzip',
              'Content-Type': mimeType
            })
            raw.pipe(zlib.createGzip()).pipe(response)
          } else if (acceptEncoding.match(/\bdeflate\b/)) {
            response.writeHead(200, {
              'content-encoding': 'deflate',
              'Content-Type': mimeType
            })
            raw.pipe(zlib.createDeflate()).pipe(response)
          } else {
            response.writeHead(200, {})
            raw.pipe(response)
          }
        }
      })
    } else {
      response.writeHead(404)
      response.end()
    }
  })
}).listen(port)

console.log('Serving files on http://localhost:' + port)
