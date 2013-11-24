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

  var cache = this.datacache
  var transform;

  return through(function(obj) {

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

    this.transform = function(fn) {
      if (transform) {
        return
      }
      transform = fn
    }

    this.queue = this.push = function(data) {
      if (transform && !transformed) {
        transformed = true
        data = transform(data)
      }
      cache[h] = data
      push(data)
    }
    
    cb.call(this, obj)
  })

}
