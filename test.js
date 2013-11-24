var assert = require('better-assert')
var through = require('through')
var tc = require('./index')()
var l = console.log

var cbcount = 0
var writecount = 0

var stream1 = through()
var stream2 = through()

stream1
	.pipe(tc.cache(function(obj) {
		++cbcount
		l('Transforming stream1')
		var str = '<div>' + obj.value + '</div>'
		this.push(str)
	}))
	.pipe(stream2)

stream2.on('data', function() {
	++writecount
})

stream1.on('end', function() {
	l('Asserting the callback count')
	assert(cbcount == 1)
	l('Asserting the write count')
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

		l('Transforming stream 3, more than once')

		this.transform(function(o) {
			return '<div>' + o + '</div>'
		})

		++cbcount
		var str = obj.value
		this.queue(str)

	}))
	.pipe(stream4)

stream4.on('data', function(d) {
	l('Asserting the value was changed by the transform function')
	assert(d[0] == '<')
	assert(d[d.length-1] == '>')
	++writecount
})

stream3.on('end', function() {
	l('Asserting the callback count')
	assert(cbcount == 2)
	l('Asserting the write count')
	assert(writecount == 2)
})

stream3.write({ value: 'a' })
stream3.write({ value: 'b' })
stream3.end()

var circular = {}
circular.circular = circular

tc.cache(function(obj) {
	l('Transforming circular structure')
	var str = '<div>' + obj + '</div>'
	this.push(str)
}).write(circular)

l('Finished')
