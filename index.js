var through = require('through')
var crypto = require('crypto')

function hash(value) {
  var shasum = crypto.createHash('sha1')
  return shasum.update(value).digest('hex')
}

var CacheStream = module.exports = function CacheStream() {
  if (!(this instanceof CacheStream)) {
    return new CacheStream
  }
  this.datacache = {}
}

CacheStream.prototype.invalidate = function() {
  this.datacache = {}
}

CacheStream.prototype.cache = function(cb) {

  var stream = through()
  var cache = this.datacache
  var transform;

  return stream.pipe(through(function(obj) {

    var transformed = false

    if (Buffer.isBuffer(obj)) {
      h = hash(obj.toString())
    }
    else if (typeof obj === 'object') {
      h = hash(JSON.stringify(obj))
    }
    else {
      h = hash(String(obj))
    }

    if (cache[h]) {
      return this.push(cache[h])
    }

    var push = this.push
    var queue = this.queue

    this.transform = function(fn) {
      if (transform) {
        return
      }
      transform = fn
    }

    this.push = function(data) {
      if (transform && !transformed) {
        transformed = true
        data = transform(data)
      }
      cache[h] = data
      push(data)
    }

    this.queue = function(data) {
      cache[h] = data
      queue(data)
    }
    
    cb.call(this, obj)
  }))

}
