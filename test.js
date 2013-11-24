var assert = require('better-assert')
var through = require('through')
var tc = require('./index')()

var cbcount = 0
var writecount = 0

var stream1 = through()
var stream2 = through()

stream1
	.pipe(tc.cache(function(obj) {
		++cbcount
		var str = '<div>' + obj.value + '</div>'
		this.push(str)
	}))
	.pipe(stream2)

stream2.on('data', function() {
	++writecount
})

stream1.on('end', function() {
	assert(cbcount == 1)
	assert(writecount == 2)
})

stream1.write({ value: 'hello, world' })
stream1.write({ value: 'hello, world' })
stream1.end()


cbcount = 0
writecount = 0

var stream3 = through()
var stream4 = through()

stream3
	.pipe(tc.cache(function(obj) {

		this.transform(function(o) {
			return '[' + o + ']'
		})

		++cbcount
		var str = '<div>' + obj.value + '</div>'
		this.push(str)

	}))
	.pipe(stream4)

stream4.on('data', function(d) {
	assert(d[0] == '[')
	assert(d[d.length-1] == ']')
	++writecount
})

stream3.on('end', function() {
	assert(cbcount == 2)
	assert(writecount == 2)
})

stream3.write({ value: 'a' })
stream3.write({ value: 'b' })
stream3.end()
