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
  var datacache = this.datacache
  var functioncache;

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

    if (datacache[h]) {
      return this.push(datacache[h])
    }

    var push = this.push
    var queue = this.queue

    this.transform = function(fn) {
      if (functioncache) {
        return
      }
      functioncache = fn
    }

    this.push = function(data) {
      if (functioncache && !transformed) {
        transformed = true
        data = functioncache(data)
      }
      datacache[h] = data
      push(data)
    }

    this.queue = function(data) {
      datacache[h] = data
      queue(data)
    }
    
    cb.call(this, obj)
  }))

}
