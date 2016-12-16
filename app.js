var fs = require('fs')
var express = require('express')
var find = require('find')
var Throttle = require('throttle')

var app = express()

var index = 0
var fileList = find.fileSync(/\.mp3$/, 'samples')
var clients = []
var fileName

app.get('/', function (req, res) {
  res.redirect('/page/index.html')
})
app.use('/page', express.static('page'))

app.get('/audio', function (req, res) {
  res.set({
    'Content-Type': 'audio/mpeg3',
    'Transfer-Encoding': 'chunked'
  })
  clients.push(res)
})

app.get('/file', function (req, res) {
  res.end(fileName)
})

app.listen(8100, function () {
  console.log('started at', 8100)
  next()
})

function next () {
  var stream = new Throttle(10000)
        .on('data', broadcast)
        .on('end', next)

  fileName = fileList[index++ % fileList.length]
  console.log('currently playing', fileName)
  fs.createReadStream(fileName).pipe(stream)
}

function broadcast (data) {
  clients.forEach(function (client) {
    client.write(data)
  })
}
